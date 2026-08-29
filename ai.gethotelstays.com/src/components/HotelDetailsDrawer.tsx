import { useState, useEffect } from 'react';
import { X, MessageSquarePlus, CreditCard, Star, MapPin, ChevronLeft, ChevronRight, Check, Loader, Building } from 'lucide-react';
import { aiApi } from '../lib/api';

interface RoomItem {
  id: number;
  name: string;
  pricePerNight: number;
  promotionalPrice?: number;
  maxOccupancy?: number;
  description?: string;
  images?: string[];
  amenities?: string[];
}

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

  // Combine thumbnail and hotel images
  const gallery = (() => {
    if (!hotel) return [];
    const imgs: string[] = [];
    if (hotel.thumbnail) imgs.push(hotel.thumbnail);
    if (Array.isArray(hotel.images)) {
      hotel.images.forEach(img => {
        if (img && !imgs.includes(img)) imgs.push(img);
      });
    }
    return imgs.length > 0 ? imgs : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"];
  })();

  // Reset and fetch rooms when hotel opens
  useEffect(() => {
    if (isOpen && hotel?.id) {
      setActivePhotoIdx(0);
      setAttachedNotification(null);

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

  const startingPrice = hotel.promotionalPrice || hotel.pricePerNight;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md transition-all duration-300 animate-fade-in">
      <div
        className={`w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 ${
          theme === 'dark' ? 'bg-[#111115] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold truncate">{hotel.name}</h3>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-400 shrink-0" />
                <span>{hotel.city}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
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
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* 1. Photo Gallery Carousel */}
          <div className="relative w-full h-[220px] sm:h-[260px] rounded-2xl overflow-hidden bg-slate-900 shadow-md group">
            <img
              src={gallery[activePhotoIdx]}
              alt={`${hotel.name} Photo ${activePhotoIdx + 1}`}
              className="w-full h-full object-cover transition-transform duration-500"
            />

            {/* Photo Counter */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white">
              {activePhotoIdx + 1} / {gallery.length} Photos
            </div>

            {/* Navigation Arrows */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIdx(prev => (prev - 1 + gallery.length) % gallery.length);
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIdx(prev => (prev + 1) % gallery.length);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Photo Thumbnail Strip */}
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePhotoIdx(i)}
                  className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activePhotoIdx === i ? 'border-brand-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* 2. Hotel Overview & Quick Actions */}
          <div className="space-y-3 pb-4 border-b border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black">{hotel.name}</span>
                  {hotel.guestRating && hotel.guestRating > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black bg-amber-500/20 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {hotel.guestRating.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  📍 {hotel.address ? `${hotel.address}, ${hotel.city}` : hotel.city}
                </p>
              </div>

              {/* Price & Attach Hotel CTA */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAttachHotel}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-brand-500/40 text-brand-400 hover:bg-brand-500/10 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Attach Hotel to Chat</span>
                </button>
              </div>
            </div>

            {/* Description */}
            {hotel.description && (
              <p className="text-xs leading-relaxed text-slate-300 line-clamp-3">
                {hotel.description}
              </p>
            )}

            {/* Amenities Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Free Wi-Fi', 'Air Conditioning', 'Couple Friendly', '24/7 Room Service', 'Power Backup'].map((am, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/5 border border-white/5 text-slate-300"
                >
                  ✓ {am}
                </span>
              ))}
            </div>
          </div>

          {/* 3. Available Rooms Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Available Room Categories ({rooms.length})
              </h4>
              <span className="text-[11px] text-slate-400">Starts from ₹{startingPrice.toLocaleString()}/night</span>
            </div>

            {isLoadingRooms ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader className="w-6 h-6 animate-spin text-brand-400" />
                <span className="text-xs font-medium">Loading live room rates...</span>
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-5 rounded-2xl bg-white/5 text-center text-xs text-slate-400">
                Standard rooms available at front desk. You can attach this hotel to chat to ask AI!
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.map((r) => {
                  const roomImage = (r.images && r.images[0]) || hotel.thumbnail || "https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&w=600&q=80";
                  const roomPrice = r.promotionalPrice || r.pricePerNight || hotel.pricePerNight;

                  return (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all flex flex-col sm:flex-row gap-3.5 items-start sm:items-center justify-between"
                    >
                      {/* Room Photo & Info */}
                      <div className="flex gap-3 items-center min-w-0 flex-1">
                        <img
                          src={roomImage}
                          alt={r.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 shadow-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs sm:text-sm font-bold truncate">{r.name}</h5>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            👤 {r.maxOccupancy || 2} Guests • 🛏️ King Bed • Free Breakfast
                          </p>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-sm font-black text-white">₹{roomPrice.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400">/night</span>
                          </div>
                        </div>
                      </div>

                      {/* Room Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <button
                          type="button"
                          onClick={() => handleAttachRoom(r)}
                          className="flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold border border-white/15 text-slate-300 hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                          title="Attach this room to chat and ask AI questions"
                        >
                          <MessageSquarePlus className="w-3.5 h-3.5" />
                          <span>Attach to Chat</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onBookRoom(hotel, r);
                          }}
                          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold bg-brand-600 hover:bg-brand-500 text-white active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Book Room</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
