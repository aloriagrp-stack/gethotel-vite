import React, { useState, useCallback, useEffect, useRef } from "react";
import { X, Crop as CropIcon, ZoomIn, ZoomOut, Check, Plus, Minus } from "lucide-react";

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

const MIN_FRAME_W = 80;
const MIN_FRAME_H = 46;
const MAX_ZOOM = 8;

type Frame = { x: number; y: number; w: number; h: number };
type ImgState = { tx: number; ty: number; s: number };

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const loadImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.src = url;
    });

export default function BannerCropModal({ open, imageSrc, defaultAspect, onCancel, onConfirm }: BannerCropModalProps) {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null);
    const [imgSize, setImgSize] = useState<{ nw: number; nh: number } | null>(null);
    const [frame, setFrame] = useState<Frame>({ x: 0, y: 0, w: 100, h: 50 });
    const [img, setImg] = useState<ImgState>({ tx: 0, ty: 0, s: 1 });
    const [aspectSel, setAspectSel] = useState<number>(0);
    const [isCropping, setIsCropping] = useState(false);
    const [error, setError] = useState("");
    const [isReady, setIsReady] = useState(false);

    const dragRef = useRef<{
        mode: "move" | "resize";
        handle: string | null;
        startX: number;
        startY: number;
        frame: Frame;
        img: ImgState;
    } | null>(null);

    // Measure viewport container
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const measure = () => setViewport({ w: el.clientWidth, h: el.clientHeight });
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [open]);

    // Load image + initial layout whenever modal opens
    useEffect(() => {
        if (!open || !imageSrc) return;
        setImgSize(null);
        setIsReady(false);
        setError("");
        setIsCropping(false);
        setAspectSel(defaultAspect || 0);
        loadImage(imageSrc)
            .then((el) => setImgSize({ nw: el.naturalWidth, nh: el.naturalHeight }))
            .catch(() => setError("Failed to load image. Please try another photo."));
    }, [open, imageSrc, defaultAspect]);

    // Compute initial frame + image position once image & viewport are known
    useEffect(() => {
        if (!open || !imgSize || !viewport || isReady) return;
        const W = viewport.w;
        const H = viewport.h;
        let fw = Math.round(W * 0.72);
        let fh = Math.round(fw * (9 / 21));
        if (fh > H * 0.78) {
            fh = Math.round(H * 0.78);
            fw = Math.round(fh * (21 / 9));
        }
        fw = Math.min(fw, W);
        fh = Math.min(fh, H);
        const f: Frame = { x: Math.round((W - fw) / 2), y: Math.round((H - fh) / 2), w: fw, h: fh };
        const minS = Math.max(f.w / imgSize.nw, f.h / imgSize.nh);
        setFrame(f);
        setImg(computeCoverage(f, { tx: 0, ty: 0, s: minS }, imgSize.nw, imgSize.nh));
        setIsReady(true);
    }, [open, imgSize, viewport, isReady]);

    // Ensure image always fully covers the crop frame
    const computeCoverage = (fr: Frame, im: ImgState, nw: number, nh: number): ImgState => {
        const minS = Math.max(fr.w / nw, fr.h / nh);
        let s = Math.max(im.s, minS);
        let tx = im.tx;
        let ty = im.ty;
        if (s !== im.s) {
            const cx = fr.x + fr.w / 2;
            const cy = fr.y + fr.h / 2;
            tx = cx - ((cx - tx) / im.s) * s;
            ty = cy - ((cy - ty) / im.s) * s;
        }
        const minTx = fr.x + fr.w - nw * s;
        const maxTx = fr.x;
        const minTy = fr.y + fr.h - nh * s;
        const maxTy = fr.y;
        return {
            s,
            tx: clamp(tx, minTx, maxTx),
            ty: clamp(ty, minTy, maxTy)
        };
    };

    // ─── IMAGE MOVE ──────────────────────────────────────────────────────────
    const applyMove = (dx: number, dy: number) => {
        if (!imgSize || !dragRef.current) return;
        const base = dragRef.current.img;
        const next = computeCoverage(frame, { ...base, tx: base.tx + dx, ty: base.ty + dy }, imgSize.nw, imgSize.nh);
        setImg(next);
    };

    // ─── FRAME RESIZE from all edges/corners ────────────────────────────────
    const applyResize = (handle: string | null, dx: number, dy: number) => {
        if (!imgSize || !viewport || !dragRef.current) return;
        const base = dragRef.current.frame;
        let f: Frame = { ...base };
        const maxW = viewport.w;
        const maxH = viewport.h;

        if (handle && handle.includes("e")) f.w = clamp(base.w + dx, MIN_FRAME_W, maxW - base.x);
        if (handle && handle.includes("s")) f.h = clamp(base.h + dy, MIN_FRAME_H, maxH - base.y);
        if (handle && handle.includes("w")) {
            const nw = clamp(base.w - dx, MIN_FRAME_W, base.x + base.w);
            f.w = nw;
            f.x = base.x + base.w - nw;
        }
        if (handle && handle.includes("n")) {
            const nh = clamp(base.h - dy, MIN_FRAME_H, base.y + base.h);
            f.h = nh;
            f.y = base.y + base.h - nh;
        }

        const nextImg = computeCoverage(f, dragRef.current.img, imgSize.nw, imgSize.nh);
        setFrame(f);
        setImg(nextImg);
    };

    // ─── ZOOM (keeps subject under frame center stable) ────────────────────
    const applyZoom = (newS: number) => {
        if (!imgSize) return;
        const minS = Math.max(frame.w / imgSize.nw, frame.h / imgSize.nh);
        const s = clamp(newS, minS, MAX_ZOOM);
        const cx = frame.x + frame.w / 2;
        const cy = frame.y + frame.h / 2;
        const natCx = (cx - img.tx) / img.s;
        const natCy = (cy - img.ty) / img.s;
        const tx = cx - natCx * s;
        const ty = cy - natCy * s;
        setImg(computeCoverage(frame, { tx, ty, s }, imgSize.nw, imgSize.nh));
    };

    const zoomByFactor = (factor: number) => applyZoom(img.s * factor);

    // Mouse wheel zoom (non-passive to allow preventDefault)
    useEffect(() => {
        const el = viewportRef.current;
        if (!el || !open) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            zoomByFactor(Math.exp(-e.deltaY * 0.0012));
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [open, frame, img, imgSize]);

    // ─── ASPECT PRESETS (resize frame to ratio, keeping center) ────────────
    const applyAspect = (value: number) => {
        setAspectSel(value);
        if (!value || !viewport) return;
        const cx = frame.x + frame.w / 2;
        const cy = frame.y + frame.h / 2;
        let w = Math.max(frame.w, frame.h * value);
        w = Math.min(w, viewport.w);
        let h = w / value;
        if (h > viewport.h) {
            h = viewport.h;
            w = h * value;
        }
        const f: Frame = { x: clamp(cx - w / 2, 0, viewport.w - w), y: clamp(cy - h / 2, 0, viewport.h - h), w, h };
        if (imgSize) {
            setImg(computeCoverage(f, img, imgSize.nw, imgSize.nh));
        }
        setFrame(f);
    };

    // ─── POINTER DRAG (move image / resize frame) ──────────────────────────
    const onPointerDown = (e: React.PointerEvent) => {
        if (!isReady) return;
        if (e.button !== 0 && e.pointerType === "mouse") return;
        const handleEl = (e.target as HTMLElement).closest("[data-handle]");
        dragRef.current = {
            mode: handleEl ? "resize" : "move",
            handle: handleEl ? handleEl.getAttribute("data-handle") : null,
            startX: e.clientX,
            startY: e.clientY,
            frame: { ...frame },
            img: { ...img }
        };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        const d = dragRef.current;
        if (!d) return;
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        if (d.mode === "resize") {
            applyResize(d.handle, dx, dy);
        } else {
            applyMove(dx, dy);
        }
    };

    const onPointerUp = () => {
        dragRef.current = null;
    };

    // ─── EXPORT: exactly what is visible inside the frame ──────────────────
    const handleConfirm = async () => {
        if (!imageSrc || !imgSize) return;
        setIsCropping(true);
        setError("");
        try {
            const image = await loadImage(imageSrc);
            const nw = image.naturalWidth;
            const nh = image.naturalHeight;
            const s = img.s;
            const natX0 = (frame.x - img.tx) / s;
            const natY0 = (frame.y - img.ty) / s;
            const natW = frame.w / s;
            const natH = frame.h / s;

            const scaleF = 2;
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(frame.w * scaleF));
            canvas.height = Math.max(1, Math.round(frame.h * scaleF));
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Canvas not supported in this browser");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(image, natX0, natY0, natW, natH, 0, 0, canvas.width, canvas.height);
            onConfirm(canvas.toDataURL("image/jpeg", 0.92));
        } catch (err) {
            console.error("Crop error:", err);
            setError("Failed to crop image. Please try another photo.");
            setIsCropping(false);
        }
    };

    if (!open) return null;

    const minZoom = imgSize ? Math.max(frame.w / imgSize.nw, frame.h / imgSize.nh) : 1;
    const zoomPct = Math.round(img.s * 100);

    const handleCursor: Record<string, string> = {
        n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize",
        ne: "nesw-resize", sw: "nesw-resize", nw: "nwse-resize", se: "nwse-resize"
    };

    const cornerPositions = [
        { handle: "nw", style: { left: -5, top: -5 } },
        { handle: "ne", style: { right: -5, top: -5 } },
        { handle: "sw", style: { left: -5, bottom: -5 } },
        { handle: "se", style: { right: -5, bottom: -5 } }
    ];

    const edgePositions = [
        { handle: "n", style: { left: 14, right: 14, top: -3, height: 6 } },
        { handle: "s", style: { left: 14, right: 14, bottom: -3, height: 6 } },
        { handle: "e", style: { top: 14, bottom: 14, right: -3, width: 6 } },
        { handle: "w", style: { top: 14, bottom: 14, left: -3, width: 6 } }
    ];

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
                            Drag image to move it · Resize frame from edges/corners · Scroll / slider to zoom
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
                    <div
                        ref={viewportRef}
                        className="relative w-full h-[45vh] bg-[#121212] rounded-xl overflow-hidden border border-[#262626]"
                        style={{ touchAction: "none", cursor: img.s > minZoom + 0.001 ? "grab" : "default" }}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                    >
                        {imgSize && (
                            <img
                                src={imageSrc}
                                alt="Crop preview"
                                draggable={false}
                                className="absolute select-none"
                                style={{
                                    left: img.tx,
                                    top: img.ty,
                                    width: imgSize.nw * img.s,
                                    height: imgSize.nh * img.s,
                                    userSelect: "none",
                                    WebkitUserSelect: "none",
                                    pointerEvents: "none",
                                    maxWidth: "none"
                                }}
                            />
                        )}

                        {isReady && (
                            <>
                                {/* Dimmed areas outside the frame */}
                                <div className="absolute bg-black/65 pointer-events-none" style={{ left: 0, top: 0, right: 0, height: frame.y }} />
                                <div className="absolute bg-black/65 pointer-events-none" style={{ left: 0, bottom: 0, right: 0, height: viewport!.h - frame.y - frame.h }} />
                                <div className="absolute bg-black/65 pointer-events-none" style={{ left: 0, top: frame.y, height: frame.h, width: frame.x }} />
                                <div className="absolute bg-black/65 pointer-events-none" style={{ right: 0, top: frame.y, height: frame.h, width: viewport!.w - frame.x - frame.w }} />

                                {/* Crop frame */}
                                <div
                                    className="absolute pointer-events-none"
                                    style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h, boxShadow: "0 0 0 1.5px rgba(255,255,255,0.9)" }}
                                >
                                    {/* Rule of thirds */}
                                    <div className="absolute bg-white/25 pointer-events-none" style={{ left: `${100 / 3}%`, top: 0, bottom: 0, width: 1 }} />
                                    <div className="absolute bg-white/25 pointer-events-none" style={{ left: `${200 / 3}%`, top: 0, bottom: 0, width: 1 }} />
                                    <div className="absolute bg-white/25 pointer-events-none" style={{ top: `${100 / 3}%`, left: 0, right: 0, height: 1 }} />
                                    <div className="absolute bg-white/25 pointer-events-none" style={{ top: `${200 / 3}%`, left: 0, right: 0, height: 1 }} />
                                </div>

                                {/* Corner handles */}
                                {cornerPositions.map(cp => (
                                    <div
                                        key={cp.handle}
                                        data-handle={cp.handle}
                                        className="absolute w-[11px] h-[11px] bg-white rounded-[3px] border border-black/40 z-10"
                                        style={{ ...cp.style, cursor: handleCursor[cp.handle] }}
                                    />
                                ))}
                                {/* Edge handles */}
                                {edgePositions.map(ep => (
                                    <div
                                        key={ep.handle}
                                        data-handle={ep.handle}
                                        className="absolute bg-white/80 rounded-[3px] z-10"
                                        style={{ ...ep.style, cursor: handleCursor[ep.handle] }}
                                    />
                                ))}
                            </>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Zoom controls */}
                        <div className="flex items-center gap-3 flex-1">
                            <button
                                type="button"
                                onClick={() => zoomByFactor(1 / 1.2)}
                                className="w-8 h-8 rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white flex items-center justify-center border border-[#2b2b2b] transition-colors cursor-pointer"
                                title="Zoom out"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <input
                                type="range"
                                min={minZoom}
                                max={MAX_ZOOM}
                                step={0.01}
                                value={img.s}
                                onChange={(e) => applyZoom(Number(e.target.value))}
                                className="w-full accent-emerald-500 cursor-pointer"
                            />
                            <button
                                type="button"
                                onClick={() => zoomByFactor(1.2)}
                                className="w-8 h-8 rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white flex items-center justify-center border border-[#2b2b2b] transition-colors cursor-pointer"
                                title="Zoom in"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                            <span className="text-[11px] font-black text-neutral-300 w-12 text-right shrink-0">
                                {zoomPct}%
                            </span>
                        </div>

                        <label className="flex items-center gap-2 text-[11px] font-bold text-neutral-300 shrink-0">
                            <span className="uppercase tracking-wider">Aspect:</span>
                            <select
                                value={aspectSel}
                                onChange={(e) => applyAspect(Number(e.target.value))}
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
                        disabled={isCropping || !isReady}
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
                                CROP &amp; USE
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
