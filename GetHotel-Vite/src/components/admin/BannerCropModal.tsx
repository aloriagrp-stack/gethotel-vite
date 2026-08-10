import React, { useState, useCallback, useEffect } from "react";
import ReactCrop, { Crop, PercentCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Crop as CropIcon, ZoomIn, ZoomOut, Check } from "lucide-react";

interface BannerCropModalProps {
    open: boolean;
    imageSrc: string;
    defaultAspect: number;
    onCancel: () => void;
    onConfirm: (croppedDataUrl: string) => void;
}

const ASPECT_OPTIONS: { label: string; value: number }[] = [
    { label: "Free (Manual)", value: 0 },
    { label: "Banner (21:9)", value: 21 / 9 },
    { label: "Widescreen (16:9)", value: 16 / 9 },
    { label: "Ultra-wide (3:1)", value: 3 / 1 }
];

const loadImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.src = url;
    });

const getCroppedImg = async (imageSrc: string, crop: PercentCrop): Promise<string> => {
    const image = await loadImage(imageSrc);
    const nw = image.naturalWidth;
    const nh = image.naturalHeight;

    const x = (crop.x / 100) * nw;
    const y = (crop.y / 100) * nh;
    const w = (crop.width / 100) * nw;
    const h = (crop.height / 100) * nh;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w));
    canvas.height = Math.max(1, Math.round(h));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported in this browser");
    ctx.drawImage(image, x, y, w, h, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.92);
};

const FULL_CROP: PercentCrop = { unit: "%", x: 0, y: 0, width: 100, height: 100 };

export default function BannerCropModal({ open, imageSrc, defaultAspect, onCancel, onConfirm }: BannerCropModalProps) {
    const [crop, setCrop] = useState<Crop>(FULL_CROP);
    const [zoom, setZoom] = useState(1);
    const [aspectValue, setAspectValue] = useState<number>(defaultAspect || 0);
    const [imgSize, setImgSize] = useState<{ width: number; height: number } | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open && imageSrc) {
            setZoom(1);
            setIsCropping(false);
            setError("");
            loadImage(imageSrc)
                .then((img) => {
                    const size = { width: img.naturalWidth, height: img.naturalHeight };
                    setImgSize(size);
                    setAspectValue(defaultAspect || 0);
                    if (defaultAspect) {
                        setCrop(makeAspectCrop({ unit: "%", width: 92 }, defaultAspect, size.width, size.height));
                    } else {
                        setCrop(FULL_CROP);
                    }
                })
                .catch(() => setError("Failed to load image. Please try another photo."));
        }
    }, [open, imageSrc, defaultAspect]);

    const onCropChange = useCallback((_: any, percentCrop: PercentCrop) => {
        setCrop(percentCrop);
    }, []);

    const handleAspectChange = (value: number) => {
        setAspectValue(value);
        if (imgSize) {
            if (value === 0) {
                setCrop(FULL_CROP);
            } else {
                setCrop(makeAspectCrop({ unit: "%", width: 92 }, value, imgSize.width, imgSize.height));
            }
        }
    };

    const handleConfirm = async () => {
        if (!imageSrc) return;
        setIsCropping(true);
        setError("");
        try {
            const croppedUrl = await getCroppedImg(imageSrc, crop as PercentCrop);
            onConfirm(croppedUrl);
        } catch (err) {
            console.error("Crop error:", err);
            setError("Failed to crop image. Please try another photo.");
            setIsCropping(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-3xl bg-[#0c0c0c] rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
                    <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <CropIcon className="w-4 h-4 text-emerald-400" />
                            Crop Hero Banner Image
                        </h3>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                            Resize the box from any edge/corner, or drag the image to position the part you want in the banner
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 text-neutral-400 hover:bg-[#1f1f1f] hover:text-white rounded-lg transition-colors cursor-pointer border border-[#282828]"
                        title="Cancel"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="relative w-full h-[45vh] bg-[#121212] rounded-xl overflow-hidden border border-[#262626]">
                        <ReactCrop
                            crop={crop}
                            onChange={onCropChange}
                            onComplete={onCropChange}
                            aspect={aspectValue === 0 ? undefined : aspectValue}
                            keepSelection
                            minWidth={60}
                            minHeight={34}
                            ruleOfThirds
                            className="w-full h-full flex items-center justify-center"
                        >
                            <img
                                src={imageSrc}
                                alt="Crop preview"
                                className="max-h-[45vh] max-w-full select-none"
                                style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                            />
                        </ReactCrop>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <ZoomOut className="w-4 h-4 text-neutral-400 shrink-0" />
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.01}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full accent-emerald-500 cursor-pointer"
                            />
                            <ZoomIn className="w-4 h-4 text-neutral-400 shrink-0" />
                        </div>
                        <label className="flex items-center gap-2 text-[11px] font-bold text-neutral-300 shrink-0">
                            <span className="uppercase tracking-wider">Aspect:</span>
                            <select
                                value={aspectValue}
                                onChange={(e) => handleAspectChange(Number(e.target.value))}
                                className="bg-[#1a1a1a] border border-[#2b2b2b] text-white text-xs font-bold rounded-lg px-3 py-2 outline-none cursor-pointer focus:border-emerald-500/60"
                            >
                                {ASPECT_OPTIONS.map(opt => (
                                    <option key={opt.label} value={opt.value} className="bg-[#1a1a1a]">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {error && (
                        <p className="text-xs font-bold text-red-400">{error}</p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1a1a1a] bg-black/40">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-[#2b2b2b]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isCropping || !crop}
                        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {isCropping ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Cropping...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Crop & Use
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
