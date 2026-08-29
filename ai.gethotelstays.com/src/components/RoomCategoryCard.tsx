import { MessageSquarePlus, CreditCard, ZoomIn } from 'lucide-react';

export interface RoomItem {
  id: number;
  name: string;
  pricePerNight: number;
  promotionalPrice?: number;
  maxOccupancy?: number;
  description?: string;
  images?: string[];
  amenities?: string[];
}

interface RoomCategoryCardProps {
  room: RoomItem;
  hotelName: string;
  hotelCity: string;
  fallbackThumbnail?: string | null;
  onAttachToChat: (room: RoomItem) => void;
  onBookRoom: (room: RoomItem) => void;
  onOpenGallery: (images: string[], title: string) => void;
  theme?: 'light' | 'dark';
}

export default function RoomCategoryCard({
  room,
  hotelName,
  fallbackThumbnail,
  onAttachToChat,
  onBookRoom,
  onOpenGallery,
  theme = 'light'
}: RoomCategoryCardProps) {
  // Parse room images
  const roomImages = (() => {
    if (Array.isArray(room.images) && room.images.length > 0) {
      return room.images;
    }
    if (fallbackThumbnail) {
      return [fallbackThumbnail];
    }
    return ["https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&w=800&q=80"];
  })();

  const primaryImage = roomImages[0];
  const roomPrice = room.promotionalPrice || room.pricePerNight || 2499;

  return (
    <div
      className={`py-4 transition-all duration-200 flex flex-row gap-3 sm:gap-4 items-stretch justify-between border-b ${
        theme === 'dark' 
          ? 'border-zinc-800/70 text-white' 
          : 'border-slate-200 text-slate-900'
      }`}
    >
      {/* ================= LEFT SIDE: Room Details & Action Buttons ================= */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <div>
          {/* Room Name */}
          <h5 className="text-sm font-extrabold leading-snug line-clamp-1 text-white" title={room.name}>
            {room.name}
          </h5>

          {/* Occupancy & Inclusions */}
          <p className="text-[11px] text-zinc-400 mt-1 flex flex-wrap items-center gap-1.5 font-medium">
            <span>👤 {room.maxOccupancy || 2} Guests</span>
            <span>•</span>
            <span>🛏️ King Bed</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Free Breakfast</span>
          </p>

          {/* Price per night */}
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-sm sm:text-base font-black text-white">₹{roomPrice.toLocaleString()}</span>
            <span className="text-[10px] text-zinc-400 font-medium">/night</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onAttachToChat(room)}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-zinc-200"
            title="Attach this room to chat to ask AI anything"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-blue-400" />
            <span>Attach</span>
          </button>

          <button
            type="button"
            onClick={() => onBookRoom(room)}
            className="px-4 py-1.5 rounded-xl text-[11px] font-extrabold bg-blue-600 hover:bg-blue-500 active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Book</span>
          </button>
        </div>
      </div>

      {/* ================= RIGHT SIDE: Room Photo & Gallery Trigger ================= */}
      <div 
        onClick={() => onOpenGallery(roomImages, `${room.name} (${hotelName})`)}
        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-[#0D0D11] border border-zinc-800 cursor-zoom-in group shadow-md"
        title="Click to view all room photos in fullscreen"
      >
        <img
          src={primaryImage}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Dark Hover Overlay with Zoom Icon */}
        <div className="absolute inset-0 bg-black/35 group-hover:bg-black/15 transition-colors flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity border border-white/10">
            <ZoomIn className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Photo Count Badge */}
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-bold text-white border border-white/10">
          {roomImages.length} {roomImages.length > 1 ? 'Photos' : 'Photo'}
        </div>
      </div>
    </div>
  );
}
