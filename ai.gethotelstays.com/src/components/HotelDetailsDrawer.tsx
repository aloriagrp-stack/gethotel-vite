import { useState, useEffect } from 'react';
import { X, MessageSquarePlus, Star, MapPin, ChevronLeft, ChevronRight, Check, Loader, ZoomIn } from 'lucide-react';
import { aiApi } from '../lib/api';
import FullscreenPhotoModal from './FullscreenPhotoModal';
import RoomCategoryCard, { type RoomItem } from './RoomCategoryCard';

interface HotelDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: {
    id: number;
    name: string;
    city: string;
    address?: string;
    description?: string;
    thumbnail?: string | null;
    images?: string[];
    pricePerNight: number;
    promotionalPrice?: number;
    starRating?: number;
    guestRating?: number;
    reviewCount?: number;
    amenities?: string[];
    mainAmenities?: string[];
    rooms?: RoomItem[];
  } | null;
  theme?: 'light' | 'dark';
  onAttachToChat: (attachment: {
    id: number;
    name: string;
    city: string;
    thumbnail: string | null;
    pricePerNight: number;
    starRating: number;
    guestRating: number;
    type: 'hotel' | 'room';
    hotelName?: string;
  }) => void;
  onBookRoom: (hotel: any, room: RoomItem) => void;
}

export default function HotelDetailsDrawer({
  isOpen,
  onClose,
  hotel,
  theme = 'light',
  onAttachToChat,
  onBookRoom
}: HotelDetailsDrawerProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [attachedNotification, setAttachedNotification] = useState<string | null>(null);

  // Fullscreen Blackout Gallery State
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryTitle, setGalleryTitle] = useState("Photo Gallery");
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

  // Combine thumbnail and hotel images
  const hotelGallery = (() => {
    if (!hotel) return [];
    const imgs: string[] = [];
    if (hotel.thumbnail) imgs.push(hotel.thumbnail);
    if (Array.isArray(hotel.images)) {
      hotel.images.forEach(img => {
        if (img && !imgs.includes(img)) imgs.push(img);
      });
    }
    return imgs.length > 0 ? imgs : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"];
  })();

  // Reset and fetch rooms when hotel opens
  useEffect(() => {
    if (isOpen && hotel?.id) {
      setActivePhotoIdx(0);
      setAttachedNotification(null);
      setGalleryModalOpen(false);

      if (hotel.rooms && hotel.rooms.length > 0) {
        setRooms(hotel.rooms);
      } else {
        setIsLoadingRooms(true);
        aiApi.getRooms(hotel.id)
          .then(res => {
            if (res.success && Array.isArray(res.rooms)) {
              setRooms(res.rooms);
            } else {
              setRooms([]);
            }
          })
          .catch(() => {
            setRooms([]);
          })
          .finally(() => {
            setIsLoadingRooms(false);
          });
      }
    }
  }, [isOpen, hotel]);

  if (!isOpen || !hotel) return null;

  const showAttachedToast = (name: string) => {
    setAttachedNotification(`Attached "${name}" to chat!`);
    setTimeout(() => {
      setAttachedNotification(null);
    }, 2500);
  };

  const handleAttachHotel = () => {
    onAttachToChat({
      id: hotel.id,
      name: hotel.name,
      city: hotel.city,
      thumbnail: hotel.thumbnail || null,
      pricePerNight: hotel.pricePerNight,
      starRating: hotel.starRating || 4,
      guestRating: hotel.guestRating || 4.5,
      type: 'hotel'
    });
    showAttachedToast(hotel.name);
  };

  const handleAttachRoom = (r: RoomItem) => {
    onAttachToChat({
      id: r.id,
      name: r.name,
      city: hotel.city,
      thumbnail: (r.images && r.images[0]) || hotel.thumbnail || null,
      pricePerNight: r.pricePerNight,
      starRating: hotel.starRating || 4,
      guestRating: hotel.guestRating || 4.5,
      type: 'room',
      hotelName: hotel.name
    });
    showAttachedToast(r.name);
  };

  const handleOpenFullscreenGallery = (images: string[], title: string, index = 0) => {
    setGalleryImages(images);
    setGalleryTitle(title);
    setGalleryInitialIndex(index);
    setGalleryModalOpen(true);
  };

  const startingPrice = hotel.promotionalPrice || hotel.pricePerNight;
  const ratingValue = hotel.guestRating && hotel.guestRating > 0 ? hotel.guestRating : (hotel.starRating || 4.5);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-xl animate-backdrop-smooth">
        {/* Full Page Drawer Container on Mobile, Spacious Centered Sheet on Desktop */}
        <div
          className={`w-full h-full sm:h-[90vh] max-w-2xl flex flex-col rounded-none sm:rounded-3xl border-0 sm:border shadow-2xl overflow-hidden animate-drawer-spring ${
            theme === 'dark' ? 'bg-[#0B0B0E] sm:border-zinc-800 text-white' : 'bg-white sm:border-slate-200 text-slate-900'
          }`}
        >
          {/* Top Header - Ultra Clean: Hotel Name | Location */}
          <div className="px-5 py-3.5 border-b border-zinc-800/80 flex items-center justify-between shrink-0 bg-[#101014] backdrop-blur-md">
            <div className="min-w-0 pr-3 flex items-center gap-2 truncate">
              <h3 className="text-xs sm:text-sm font-extrabold text-white truncate leading-none">{hotel.name}</h3>
              <span className="text-zinc-600 shrink-0 select-none">|</span>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-medium flex items-center gap-1 shrink-0">
                <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate">{hotel.city || hotel.address}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-zinc-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-zinc-700/50"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Attached Floating Alert Toast */}
          {attachedNotification && (
            <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 text-center animate-fade-in flex items-center justify-center gap-2 shrink-0">
              <Check className="w-4 h-4" />
              <span>{attachedNotification}</span>
            </div>
          )}

          {/* Scrollable Drawer Content */}
          <div className="p-4 sm:p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1 bg-[#0B0B0E]">
            {/* 1. Hotel Photo Gallery Carousel with Click-to-Fullscreen */}
            <div 
              onClick={() => handleOpenFullscreenGallery(hotelGallery, hotel.name, activePhotoIdx)}
              className="relative w-full h-[230px] sm:h-[280px] rounded-2xl overflow-hidden bg-[#121218] border border-zinc-800 shadow-md group cursor-zoom-in"
              title="Click to view fullscreen gallery"
            >
              <img
                src={hotelGallery[activePhotoIdx]}
                alt={`${hotel.name} Photo ${activePhotoIdx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Top Right Zoom Icon Indicator */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4" />
              </div>

              {/* Bottom Photo Counter */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                {activePhotoIdx + 1} / {hotelGallery.length} Photos
              </div>

              {/* Navigation Arrows */}
              {hotelGallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIdx(prev => (prev - 1 + hotelGallery.length) % hotelGallery.length);
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIdx(prev => (prev + 1) % hotelGallery.length);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Photo Thumbnail Strip */}
            {hotelGallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {hotelGallery.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePhotoIdx(i)}
                    className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePhotoIdx === i ? 'border-blue-500 scale-105 shadow-md ring-2 ring-blue-500/30' : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* 2. Hotel Overview & Quick Actions */}
            <div className="space-y-3 pb-4 border-b border-zinc-800/70">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-black text-white">{hotel.name}</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/20">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {ratingValue.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    📍 {hotel.address ? `${hotel.address}, ${hotel.city}` : hotel.city}
                  </p>
                </div>

                {/* Attach Hotel to Chat CTA */}
                <button
                  type="button"
                  onClick={handleAttachHotel}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-700 bg-[#16161D] hover:bg-[#1E1E26] text-zinc-200 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <MessageSquarePlus className="w-4 h-4 text-blue-400" />
                  <span>Attach Hotel to Chat</span>
                </button>
              </div>

              {/* Description */}
              {hotel.description && (
                <p className="text-xs leading-relaxed text-zinc-300 line-clamp-3">
                  {hotel.description}
                </p>
              )}

              {/* Amenities Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Free Wi-Fi', 'Air Conditioning', 'Couple Friendly', '24/7 Room Service', 'Power Backup'].map((am, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#14141A] border border-zinc-800 text-zinc-300"
                  >
                    ✓ {am}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Available Rooms Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Available Room Categories ({rooms.length})
                </h4>
                <span className="text-[11px] text-zinc-400 font-medium">Starts from ₹{startingPrice.toLocaleString()}/night</span>
              </div>

              {isLoadingRooms ? (
                <div className="p-8 text-center text-zinc-400 flex flex-col items-center gap-2">
                  <Loader className="w-6 h-6 animate-spin text-blue-400" />
                  <span className="text-xs font-medium">Loading live room inventory...</span>
                </div>
              ) : rooms.length === 0 ? (
                <div className="p-5 rounded-2xl bg-[#14141A] border border-zinc-800 text-center text-xs text-zinc-400">
                  Standard rooms available at front desk. You can attach this hotel to chat to ask AI!
                </div>
              ) : (
                <div className="flex flex-col">
                  {rooms.map((r) => (
                    <RoomCategoryCard
                      key={r.id}
                      room={r}
                      hotelName={hotel.name}
                      hotelCity={hotel.city}
                      fallbackThumbnail={hotel.thumbnail}
                      theme={theme}
                      onAttachToChat={handleAttachRoom}
                      onBookRoom={(selectedRoom) => {
                        onClose();
                        onBookRoom(hotel, selectedRoom);
                      }}
                      onOpenGallery={(images, title) => handleOpenFullscreenGallery(images, title, 0)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Fullscreen Blackout Photo Modal */}
      <FullscreenPhotoModal
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        images={galleryImages}
        title={galleryTitle}
        initialIndex={galleryInitialIndex}
      />
    </>
  );
}
