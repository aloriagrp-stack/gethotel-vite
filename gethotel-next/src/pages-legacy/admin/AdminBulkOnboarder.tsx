'use client';
import { useState, useRef, useEffect } from "react";
import { 
    FileJson, Upload, X, RefreshCw, CheckCircle2, AlertCircle, 
    Key, Phone, Mail, Sparkles, Database, Plus, Trash2, ArrowUpRight,
    Eye, Check, ChevronDown, ChevronUp, Copy, Search, History, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/api";

interface OnboardResult {
    fileName: string;
    success: boolean;
    skipped?: boolean;
    hotelName?: string;
    email?: string;
    password?: string;
    phone?: string;
    roomsCount?: number;
    message?: string;
}

interface PreviewHotel {
    fileName: string;
    success: boolean;
    skipped: boolean;
    hotelName?: string;
    hotel?: {
        name: string;
        tagline?: string;
        description: string;
        city: string;
        address: string;
        pricePerNight?: number;
        starRating?: number;
        amenities?: string[];
        mainAmenities?: string[];
    };
    partner?: {
        name: string;
        email: string;
        password?: string;
        phone?: string;
    };
    rooms?: {
        name: string;
        pricePerNight: number;
        maxOccupancy?: number;
        bedConfiguration?: string;
        sizeM2?: number;
        totalInventory?: number;
        amenities?: string[];
        description?: string;
    }[];
    message: string;
}

interface HistoryLogEntry {
    timestamp: string;
    fileName: string;
    hotelName: string;
    email?: string;
    password?: string;
    phone?: string;
    roomsCount: number;
    status: 'success' | 'duplicate_skipped' | 'failed';
    message: string;
}

interface AdminBulkOnboarderProps {
    onSuccess?: () => void;
}

export default function AdminBulkOnboarder({ onSuccess }: AdminBulkOnboarderProps) {
    const [activePanel, setActivePanel] = useState<"upload" | "preview" | "results">("upload");
    const [selectedFiles, setSelectedFiles] = useState<{ file: File; id: string }[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [progressSteps, setProgressSteps] = useState<string[]>([]);
    const [previewHotels, setPreviewHotels] = useState<PreviewHotel[]>([]);
    const [checkedHotelIndices, setCheckedHotelIndices] = useState<number[]>([]);
    const [results, setResults] = useState<OnboardResult[]>([]);
    const [onboardError, setOnboardError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // History Log states
    const [historyLogs, setHistoryLogs] = useState<HistoryLogEntry[]>([]);
    const [historySearch, setHistorySearch] = useState("");
    const [historyLoading, setHistoryLoading] = useState(false);

    // Accordion control for review cards
    const [expandedCardIdx, setExpandedCardIdx] = useState<number | null>(null);

    // Copy to clipboard helper
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    // Load History on Mount
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await adminApi.bulkOnboardHistory();
            if (res.success) {
                setHistoryLogs(res.history || []);
            }
        } catch (err) {
            console.error("Failed to load bulk onboarding history logs:", err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        addJsonFiles(files);
        e.target.value = "";
    };

    const addJsonFiles = (files: File[]) => {
        const jsonFiles = files.filter(f => f.name.toLowerCase().endsWith('.json'));
        
        if (jsonFiles.length === 0) {
            alert("Please select valid JSON files.");
            return;
        }

        const newFiles = jsonFiles.map(f => ({
            file: f,
            id: `${f.name}-${Date.now()}-${Math.random()}`
        }));

        setSelectedFiles(prev => {
            const combined = [...prev, ...newFiles];
            if (combined.length > 10) {
                alert("You can select a maximum of 10 files at once.");
                return prev;
            }
            return combined;
        });

        // Reset states
        setOnboardError("");
        setProgressSteps([]);
    };

    const removeFile = (id: string) => {
        setSelectedFiles(prev => prev.filter(f => f.id !== id));
    };

    const clearAllFiles = () => {
        setSelectedFiles([]);
        setProgressSteps([]);
        setOnboardError("");
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        addJsonFiles(files);
    };

    const readFileContent = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string || "");
            reader.onerror = (err) => reject(err);
            reader.readAsText(file);
        });
    };

    // 1. STAGE ONE: Parse local files & show Preview
    const handleGeneratePreview = async () => {
        if (selectedFiles.length === 0) return;
        
        setProcessing(true);
        setOnboardError("");
        setPreviewHotels([]);
        setProgressSteps([`⏳ Initializing parallel AI parser for ${selectedFiles.length} files...`]);

        try {
            setProgressSteps(prev => [...prev, "⏳ Reading local JSON file contents..."]);
            const fileDataPromises = selectedFiles.map(async (fileObj) => {
                const content = await readFileContent(fileObj.file);
                return {
                    fileName: fileObj.file.name,
                    content
                };
            });

            const filesPayload = await Promise.all(fileDataPromises);
            setProgressSteps(prev => [...prev, "✓ Successfully read file contents.", "⏳ Contacting In-House Python AI Parser (High Speed)..."]);

            // Call backend API preview endpoint
            const res = await adminApi.bulkOnboardPreview({ files: filesPayload });

            if (res.success) {
                setProgressSteps(prev => [...prev, "✓ Parsing completed successfully!"]);
                const parsedHotels: PreviewHotel[] = res.hotels || [];
                setPreviewHotels(parsedHotels);
                
                // Select all ready (non-skipped & successful) hotels by default
                const readyIndices = parsedHotels
                    .map((h, idx) => (h.success && !h.skipped) ? idx : -1)
                    .filter(idx => idx !== -1);
                setCheckedHotelIndices(readyIndices);
                
                setActivePanel("preview");
                setSelectedFiles([]); // clear queue
            } else {
                setProgressSteps(prev => [...prev, "❌ Parsing failed."]);
                setOnboardError(res.message || "Failed to generate bulk onboarding preview.");
            }

        } catch (err: any) {
            setProgressSteps(prev => [...prev, "❌ Connection Error."]);
            setOnboardError(err.message || "Something went wrong while generating preview.");
        } finally {
            setProcessing(false);
        }
    };

    // Toggle selected preview cards
    const toggleHotelChecked = (idx: number) => {
        setCheckedHotelIndices(prev => 
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    // Select all ready hotels in preview
    const toggleSelectAllReady = () => {
        const readyIndices = previewHotels
            .map((h, idx) => (h.success && !h.skipped) ? idx : -1)
            .filter(idx => idx !== -1);

        if (checkedHotelIndices.length === readyIndices.length) {
            setCheckedHotelIndices([]); // deselect all
        } else {
            setCheckedHotelIndices(readyIndices); // select all
        }
    };

    // 2. STAGE TWO: Confirm & write selected hotels to DB
    const handleConfirmOnboard = async () => {
        if (checkedHotelIndices.length === 0) {
            alert("Please check at least one hotel to register.");
            return;
        }

        setProcessing(true);
        setOnboardError("");
        setProgressSteps(["⏳ Confirming onboarding queue...", "⏳ Registering approved hotel accounts to database..."]);

        try {
            // Map previewHotels to array of objects, setting skipped=true for unchecked ones
            const payloadHotels = previewHotels.map((h, idx) => {
                if (checkedHotelIndices.includes(idx)) {
                    return h;
                } else {
                    return {
                        ...h,
                        skipped: true,
                        message: "Skipped by administrator review."
                    };
                }
            });

            const res = await adminApi.bulkOnboardConfirm({ hotels: payloadHotels });

            if (res.success) {
                setResults(res.results || []);
                setActivePanel("results");
                loadHistory(); // reload past onboardings logs
                if (onSuccess) onSuccess();
            } else {
                setOnboardError(res.message || "Failed to finalize database registration.");
            }

        } catch (err: any) {
            setOnboardError(err.message || "Error occurred while registering profiles.");
        } finally {
            setProcessing(false);
        }
    };

    // Download credentials helper
    const downloadCredentialsTxt = () => {
        if (results.length === 0) return;
        const successes = results.filter(r => r.success && !r.skipped);
        if (successes.length === 0) return;

        let txt = "GETHOTELSTAYS - BULK ONBOARDING CREDENTIALS REPORT\n";
        txt += `Generated on: ${new Date().toLocaleString()}\n`;
        txt += "========================================================\n\n";

        successes.forEach((hotel, idx) => {
            txt += `${idx + 1}. HOTEL NAME: ${hotel.hotelName}\n`;
            txt += `   File: ${hotel.fileName}\n`;
            txt += `   Admin Email: ${hotel.email}\n`;
            txt += `   Admin Password: ${hotel.password}\n`;
            if (hotel.phone) {
                txt += `   Admin Phone: ${hotel.phone}\n`;
            }
            txt += `   Rooms Configured: ${hotel.roomsCount}\n`;
            txt += `   Status: ${hotel.message}\n`;
            txt += "--------------------------------------------------------\n";
        });

        const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `onboard_credentials_${Date.now()}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Filter history logs
    const filteredHistory = historyLogs.filter(log => {
        const query = historySearch.toLowerCase();
        return (
            log.hotelName.toLowerCase().includes(query) ||
            log.fileName.toLowerCase().includes(query) ||
            (log.email && log.email.toLowerCase().includes(query)) ||
            log.status.toLowerCase().includes(query)
        );
    });

    // History stats
    const totalSuccessfulOnboarded = historyLogs.filter(h => h.status === 'success').length;
    const totalSkippedDuplicates = historyLogs.filter(h => h.status === 'duplicate_skipped').length;
    const totalFailures = historyLogs.filter(h => h.status === 'failed').length;

    return (
        <div className="space-y-10 max-w-7xl mx-auto p-2 text-white font-sans">
            
            {/* Panel Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Flow Controller */}
                <div className="lg:col-span-5 bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] p-6 space-y-6">
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                            <span>AI Bulk Hotel Onboarding</span>
                        </h4>
                        <p className="text-[10px] font-bold text-neutral-400 leading-normal uppercase tracking-wider">
                            {"Two-Stage Process: Upload JSON -> AI Preview & Review -> Confirm Database Write"}
                        </p>
                    </div>

                    {activePanel === "upload" && (
                        <>
                            {/* Drag and Drop Zone */}
                            <div 
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => !processing && fileInputRef.current?.click()}
                                className={cn(
                                    "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[180px]",
                                    isDragging 
                                        ? "border-emerald-400 bg-emerald-950/20 scale-[1.02]" 
                                        : "border-[#262626] bg-[#141414] hover:bg-[#181818] hover:border-neutral-500",
                                    processing && "opacity-60 cursor-not-allowed pointer-events-none"
                                )}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    multiple
                                    accept=".json"
                                    className="hidden"
                                />
                                <Upload className="w-10 h-10 text-neutral-500 mb-3" />
                                <span className="text-xs font-bold text-white uppercase">Drag & Drop Hotel JSONs</span>
                                <span className="text-[9px] text-neutral-500 font-bold uppercase mt-1">or click to browse local files</span>
                            </div>

                            {/* Queue File List */}
                            {selectedFiles.length > 0 && (
                                <div className="space-y-3 bg-[#141414] p-4 rounded-2xl border border-[#262626]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold uppercase text-neutral-400 tracking-wider">
                                            Upload Queue ({selectedFiles.length} of 10)
                                        </span>
                                        <button
                                            onClick={clearAllFiles}
                                            disabled={processing}
                                            className="text-[9px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {selectedFiles.map(({ file, id }) => (
                                            <div key={id} className="flex items-center justify-between p-2.5 bg-[#0c0c0c] border border-[#262626] rounded-xl">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FileJson className="w-4 h-4 text-emerald-400 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-white truncate">{file.name}</p>
                                                        <p className="text-[8px] text-neutral-500 font-bold uppercase mt-0.5">
                                                            {(file.size / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeFile(id)}
                                                    disabled={processing}
                                                    className="p-1 hover:bg-[#1a1a1a] text-neutral-500 hover:text-red-400 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preview Button */}
                            <button
                                onClick={handleGeneratePreview}
                                disabled={processing || selectedFiles.length === 0}
                                className="w-full py-3.5 bg-neutral-100 text-black rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white disabled:bg-[#181818] disabled:text-neutral-600 disabled:border disabled:border-[#262626] disabled:cursor-not-allowed transition-all cursor-pointer shadow-md active:scale-98"
                            >
                                {processing ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                                        <span>AI Parsing Files...</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-3.5 h-3.5 text-black" />
                                        <span>Generate AI Onboarding Preview ({selectedFiles.length})</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {activePanel === "preview" && (
                        <div className="space-y-4">
                            <div className="bg-[#141414] p-4 border border-[#262626] rounded-2xl space-y-2">
                                <h5 className="text-[11px] font-bold text-emerald-400 uppercase">Reviewing {previewHotels.length} Properties</h5>
                                <p className="text-[10px] text-neutral-400 font-medium leading-normal uppercase">
                                    Check the cards on the right. Modify approval selections, copy credentials, then confirm database migration.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setActivePanel("upload");
                                        setPreviewHotels([]);
                                    }}
                                    className="flex-1 py-3 border border-[#2a2a2a] bg-[#181818] hover:bg-[#222222] rounded-xl text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleConfirmOnboard}
                                    disabled={processing || checkedHotelIndices.length === 0}
                                    className="flex-2 py-3 bg-neutral-100 hover:bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-1.5">
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            Saving to DB...
                                        </span>
                                    ) : (
                                        <span>Confirm & Register Selected ({checkedHotelIndices.length})</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {activePanel === "results" && (
                        <div className="space-y-4">
                            <div className="bg-emerald-950/60 p-4 border border-emerald-800/40 rounded-2xl space-y-2 text-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                                <h5 className="text-xs font-bold text-white uppercase mt-2">Registration Cycle Finished</h5>
                                <p className="text-[10px] text-neutral-400 font-medium leading-normal uppercase">
                                    Approved profiles are now live inside the database. Credentials report is ready for download.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setActivePanel("upload");
                                    setResults([]);
                                    setPreviewHotels([]);
                                }}
                                className="w-full py-3.5 bg-neutral-100 hover:bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer text-center"
                            >
                                Start New Batch Onboarding
                            </button>
                        </div>
                    )}

                    {/* Progress Steps Terminal */}
                    {progressSteps.length > 0 && (
                        <div className="border-t border-[#1f1f1f] pt-4 space-y-3">
                            <span className="text-[9px] font-bold uppercase text-neutral-400 tracking-wider block">AI extraction log console:</span>
                            <div className="bg-[#121212] border border-[#242424] text-neutral-200 p-4 rounded-xl font-mono text-[9px] leading-relaxed space-y-1.5 shadow-inner max-h-48 overflow-y-auto">
                                {progressSteps.map((step, idx) => (
                                    <div key={idx} className={cn(
                                        "transition-opacity duration-300",
                                        step.includes("⏳") ? "text-amber-400 font-bold" : step.includes("❌") ? "text-red-400 font-bold" : "text-emerald-400"
                                    )}>
                                        {step}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {onboardError && (
                        <div className="p-4 bg-red-950/60 border border-red-800/40 text-red-300 text-[10px] font-bold rounded-xl leading-normal flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                            <span>{onboardError}</span>
                        </div>
                    )}
                </div>

                {/* Right Column: Cards Panel & Results Review */}
                <div className="lg:col-span-7 bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] p-6 min-h-[400px] flex flex-col">
                    
                    {/* Header */}
                    <div className="pb-4 border-b border-[#1f1f1f] mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <h4 className="text-xs font-bold uppercase text-white tracking-wider">
                                {activePanel === "upload" && "Bulk Onboard Queue Dashboard"}
                                {activePanel === "preview" && "Step 2: AI Normalization Preview & Approval"}
                                {activePanel === "results" && "Step 3: Registration Summary & Credentials"}
                            </h4>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                                {activePanel === "upload" && "Add JSON configurations to proceed"}
                                {activePanel === "preview" && "Verify generated passwords and duplicates before inserting"}
                                {activePanel === "results" && "Completed profiles and transaction results"}
                            </p>
                        </div>

                        {activePanel === "results" && results.filter(r => r.success && !r.skipped).length > 0 && (
                            <button
                                onClick={downloadCredentialsTxt}
                                className="text-[9px] font-bold uppercase tracking-wider bg-neutral-100 hover:bg-white text-black px-3.5 py-1.5 rounded-xl active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                            >
                                Download Credentials TXT
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                        )}

                        {activePanel === "preview" && (
                            <button
                                onClick={toggleSelectAllReady}
                                className="text-[9px] font-bold uppercase tracking-wider border border-[#2a2a2a] bg-[#181818] hover:bg-[#222222] text-white px-3 py-1.5 rounded-xl active:scale-95 transition-all cursor-pointer"
                            >
                                {checkedHotelIndices.length === previewHotels.filter(h => h.success && !h.skipped).length 
                                    ? "Deselect All" 
                                    : "Select All Ready"}
                            </button>
                        )}
                    </div>

                    {/* Content panels based on active state */}
                    {activePanel === "upload" && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                            <div className="w-12 h-12 bg-[#141414] border border-[#262626] rounded-2xl flex items-center justify-center">
                                <FileJson className="w-6 h-6 text-neutral-500" />
                            </div>
                            <div className="space-y-1">
                                <h5 className="text-[11px] font-bold uppercase text-white tracking-wider">No files uploaded yet</h5>
                                <p className="text-[10px] font-bold text-neutral-400 leading-normal max-w-sm">
                                    Drag and drop your hotel JSONs on the left. The AI will parse them, check for existing records, and let you review them before registration.
                                </p>
                            </div>
                        </div>
                    )}

                    {activePanel === "preview" && (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                            {previewHotels.map((item, idx) => {
                                const isReady = item.success && !item.skipped;
                                const isExpanded = expandedCardIdx === idx;
                                const isChecked = checkedHotelIndices.includes(idx);

                                return (
                                    <div 
                                        key={idx}
                                        className={cn(
                                            "border rounded-2xl transition-all duration-300 overflow-hidden",
                                            isReady 
                                                ? isChecked 
                                                    ? "border-emerald-800/40 bg-emerald-950/20" 
                                                    : "border-[#262626] bg-[#141414]"
                                                : item.skipped 
                                                    ? "border-amber-800/40 bg-amber-950/20" 
                                                    : "border-red-800/40 bg-red-950/20"
                                        )}
                                    >
                                        {/* Card Header */}
                                        <div className="p-4 flex items-center justify-between gap-4 select-none">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {isReady ? (
                                                    <input 
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleHotelChecked(idx)}
                                                        className="w-4 h-4 accent-emerald-400 rounded cursor-pointer shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-4 h-4 shrink-0 rounded bg-[#222222] flex items-center justify-center">
                                                        <X className="w-2.5 h-2.5 text-neutral-500" />
                                                    </div>
                                                )}
                                                
                                                <div className="min-w-0">
                                                    <h5 className="text-[11px] font-bold text-white uppercase truncate">
                                                        {item.hotelName || item.fileName}
                                                    </h5>
                                                    <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">
                                                        File: {item.fileName}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span 
                                                    className={cn(
                                                        "px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-lg border text-white",
                                                        isReady 
                                                            ? "bg-emerald-950/80 border-emerald-800/40 text-emerald-400" 
                                                            : item.skipped 
                                                            ? "bg-amber-950/80 border-amber-800/40 text-amber-400" 
                                                            : "bg-red-950/80 border-red-800/40 text-red-400"
                                                    )}
                                                >
                                                    {isReady ? "Ready to Onboard" : item.skipped ? "Duplicate Warning" : "Failed Parse"}
                                                </span>

                                                <button
                                                    onClick={() => setExpandedCardIdx(isExpanded ? null : idx)}
                                                    className="p-1 hover:bg-[#222222] rounded-full transition-colors text-neutral-400 hover:text-white cursor-pointer"
                                                >
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded details */}
                                        {isExpanded && (
                                            <div className="px-4 pb-4 border-t border-[#1f1f1f] pt-3 space-y-4 text-[10px] bg-[#0c0c0c]">
                                                
                                                {/* Error banner inside card */}
                                                {!item.success && (
                                                    <div className="p-3 bg-red-950/60 border border-red-800/40 rounded-xl text-red-300 flex items-start gap-2">
                                                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                                                        <span className="font-bold">{item.message}</span>
                                                    </div>
                                                )}

                                                {item.success && (
                                                    <>
                                                        {/* Duplicate description banner */}
                                                        {item.skipped && (
                                                            <div className="p-3 bg-amber-950/60 border border-amber-800/40 rounded-xl text-amber-300 flex items-start gap-2">
                                                                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                                                <span className="font-bold">{item.message}</span>
                                                            </div>
                                                        )}

                                                        {/* Hotel Description summary */}
                                                        <div className="space-y-1">
                                                            <span className="font-bold uppercase text-neutral-500 text-[8px] tracking-wider block">Property details:</span>
                                                            <div className="p-3 bg-[#141414] border border-[#262626] rounded-xl leading-relaxed text-neutral-300 space-y-1">
                                                                <p className="font-bold text-white">{item.hotel?.name}</p>
                                                                <p className="text-[9px] text-neutral-400">{item.hotel?.tagline}</p>
                                                                <p className="mt-1">{item.hotel?.description}</p>
                                                                <p className="text-[9px] font-bold text-emerald-400 mt-2 uppercase">
                                                                    City: {item.hotel?.city} | Address: {item.hotel?.address}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Credentials section */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="p-3 bg-[#141414] border border-[#262626] rounded-xl space-y-1">
                                                                <span className="font-bold text-neutral-400 text-[8px] uppercase tracking-wider block">Admin Credentials:</span>
                                                                <div className="space-y-1 mt-1 text-[9px]">
                                                                    <div className="flex items-center justify-between gap-2 border-b border-[#1f1f1f] pb-1">
                                                                        <span className="text-neutral-500 uppercase font-bold">Email:</span>
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="font-bold text-white">{item.partner?.email}</span>
                                                                            <button onClick={() => copyToClipboard(item.partner?.email || "")} className="p-0.5 hover:bg-[#222222] text-neutral-400 hover:text-white rounded">
                                                                                <Copy className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center justify-between gap-2 border-b border-[#1f1f1f] pb-1">
                                                                        <span className="text-neutral-500 uppercase font-bold">Password:</span>
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="font-bold text-white">{item.partner?.password}</span>
                                                                            <button onClick={() => copyToClipboard(item.partner?.password || "")} className="p-0.5 hover:bg-[#222222] text-neutral-400 hover:text-white rounded">
                                                                                <Copy className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    {item.partner?.phone && (
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <span className="text-neutral-500 uppercase font-bold">Phone:</span>
                                                                            <span className="font-bold text-white">{item.partner?.phone}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Rooms Summary list */}
                                                            <div className="p-3 bg-[#141414] border border-[#262626] rounded-xl space-y-1.5">
                                                                <span className="font-bold text-neutral-400 text-[8px] uppercase tracking-wider block">Room categories ({item.rooms?.length}):</span>
                                                                <div className="space-y-1 max-h-24 overflow-y-auto text-[9px] pr-1">
                                                                    {item.rooms?.map((r, rIdx) => (
                                                                        <div key={rIdx} className="flex justify-between items-center py-1 border-b border-[#1f1f1f] last:border-0">
                                                                            <span className="font-bold text-neutral-200 truncate max-w-28">{r.name}</span>
                                                                            <span className="font-bold text-emerald-400 shrink-0">₹{r.pricePerNight}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activePanel === "results" && (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                            {results.map((result, idx) => {
                                const isSuccess = result.success && !result.skipped;
                                const isSkipped = result.skipped;

                                return (
                                    <div 
                                        key={idx}
                                        className={cn(
                                            "border p-4 rounded-2xl relative overflow-hidden transition-all duration-300",
                                            isSuccess 
                                                ? "bg-emerald-950/30 border-emerald-800/40" 
                                                : isSkipped 
                                                ? "bg-amber-950/30 border-amber-800/40" 
                                                : "bg-red-950/30 border-red-800/40"
                                        )}
                                    >
                                        <div className="flex items-start justify-between pb-2 border-b border-[#1f1f1f] mb-2">
                                            <div>
                                                <h5 className="text-[11px] font-bold text-white uppercase">
                                                    {result.hotelName || result.fileName}
                                                </h5>
                                                <p className="text-[8px] text-neutral-400 font-bold uppercase mt-0.5">
                                                    File: {result.fileName}
                                                </p>
                                            </div>
                                            <span 
                                                className={cn(
                                                    "px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-lg border text-white",
                                                    isSuccess 
                                                        ? "bg-emerald-950/80 border-emerald-800/40 text-emerald-400" 
                                                        : isSkipped 
                                                        ? "bg-amber-950/80 border-amber-800/40 text-amber-400" 
                                                        : "bg-red-950/80 border-red-800/40 text-red-400"
                                                )}
                                            >
                                                {isSuccess ? "Success" : isSkipped ? "Duplicate" : "Failed"}
                                            </span>
                                        </div>

                                        {isSuccess ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#141414] border border-[#262626] rounded-xl text-[10px] mt-2">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                                                    <div>
                                                        <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-wide block">Email</span>
                                                        <span className="font-bold text-white select-all">{result.email}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Key className="w-3.5 h-3.5 text-neutral-400" />
                                                    <div>
                                                        <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-wide block">Password</span>
                                                        <span className="font-bold text-white select-all">{result.password}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-[9px] text-neutral-300 font-semibold mt-2">{result.message}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>

            {/* History Logs Panel */}
            <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#1f1f1f] gap-4">
                    <div>
                        <h4 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
                            <History className="w-4 h-4 text-emerald-400" />
                            <span>Bulk Onboarding Transaction Logs</span>
                        </h4>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                            Audit logs of all previous AI hotel imports
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider bg-[#141414] border border-[#262626] rounded-xl p-2.5 self-start">
                        <span className="text-emerald-400 font-bold">✓ {totalSuccessfulOnboarded} Added</span>
                        <span className="text-neutral-600">|</span>
                        <span className="text-amber-400 font-bold">⚠️ {totalSkippedDuplicates} Skipped</span>
                        <span className="text-neutral-600">|</span>
                        <span className="text-red-400 font-bold">❌ {totalFailures} Failed</span>
                    </div>

                    {/* Search filter */}
                    <div className="relative w-full max-w-xs">
                        <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Filter by hotel, email, or status..."
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-[#262626] rounded-xl text-[10px] font-bold uppercase text-white tracking-wider placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
                        />
                    </div>
                </div>

                {historyLoading ? (
                    <div className="flex items-center justify-center p-12 text-neutral-400 text-[10px] font-bold uppercase tracking-widest gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                        Loading History Logs...
                    </div>
                ) : filteredHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-[10px]">
                            <thead>
                                <tr className="border-b border-[#1f1f1f] text-neutral-500 font-bold uppercase tracking-wider bg-[#0e0e0e]">
                                    <th className="py-3 px-4">Date/Time</th>
                                    <th className="py-3 px-4">File Name</th>
                                    <th className="py-3 px-4">Hotel Name</th>
                                    <th className="py-3 px-4">Admin Email</th>
                                    <th className="py-3 px-4">Temporary Password</th>
                                    <th className="py-3 px-4 text-center">Rooms</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#181818] font-medium text-neutral-300">
                                {filteredHistory.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-[#121212] transition-colors">
                                        <td className="py-3 px-4 whitespace-nowrap text-neutral-500">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-bold text-white max-w-xs truncate">{log.fileName}</td>
                                        <td className="py-3 px-4 font-bold uppercase text-white">{log.hotelName}</td>
                                        <td className="py-3 px-4 font-bold text-neutral-300 select-all">{log.email || "-"}</td>
                                        <td className="py-3 px-4">
                                            {log.password ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-white bg-[#141414] border border-[#262626] px-2 py-0.5 rounded select-all font-mono text-[9px]">{log.password}</span>
                                                    <button onClick={() => copyToClipboard(log.password || "")} className="p-0.5 text-neutral-400 hover:text-white">
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : "-"}
                                        </td>
                                        <td className="py-3 px-4 text-center font-bold text-emerald-400">{log.roomsCount}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span 
                                                className={cn(
                                                    "px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-lg border",
                                                    log.status === 'success' 
                                                        ? "bg-emerald-950/80 border-emerald-800/40 text-emerald-400" 
                                                        : log.status === 'duplicate_skipped' 
                                                        ? "bg-amber-950/80 border-amber-800/40 text-amber-400" 
                                                        : "bg-red-950/80 border-red-800/40 text-red-400"
                                                )}
                                            >
                                                {log.status === 'success' ? "Success" : log.status === 'duplicate_skipped' ? "Duplicate" : "Failed"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-neutral-500 text-[10px] font-bold uppercase tracking-wider space-y-1">
                        <History className="w-8 h-8 text-neutral-600 mx-auto" />
                        <p className="mt-2">No onboarding transactions found matching the filter</p>
                    </div>
                )}
            </div>

            {/* Micro-Notification Toast */}
            {copiedText && (
                <div className="fixed bottom-6 right-6 bg-[#181818] border border-[#333333] text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-2xl z-[999] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied to Clipboard!
                </div>
            )}

        </div>
    );
}
