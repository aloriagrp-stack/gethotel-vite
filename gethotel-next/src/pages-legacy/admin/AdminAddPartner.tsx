'use client';
import { useState } from "react";
import { adminApi } from "@/lib/api";
import { 
    Users, Hotel, Plus, Trash2, Loader2, CheckCircle2, 
    SlidersHorizontal, Eye, EyeOff, Search, Info, AlertTriangle,
    ChevronDown, ChevronRight, ArrowRight, ArrowLeft, Zap,
    Upload, Download
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchablePartnerSelectProps {
    partners: any[];
    selectedId: string;
    onChange: (id: string) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

function SearchablePartnerSelect({ partners, selectedId, onChange, disabled, placeholder = "-- Choose Partner User --", className }: SearchablePartnerSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const selectedPartner = partners.find(p => p.id === parseInt(selectedId));

    const filtered = partners.filter(p => 
        !search.trim() ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={cn("relative", className || "w-full")}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-[#141414] border border-[#262626] rounded-xl focus:outline-none focus:border-neutral-400 text-left text-xs font-bold text-white transition-all disabled:opacity-55 flex justify-between items-center cursor-pointer select-none"
            >
                <span className="truncate">
                    {selectedPartner ? `${selectedPartner.name} (${selectedPartner.email})` : placeholder}
                </span>
                <span className="text-neutral-500 ml-2">▼</span>
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => {
                            setIsOpen(false);
                            setSearch("");
                        }}
                    />
                    
                    <div className="absolute left-0 right-0 mt-1.5 bg-[#0c0c0c] border border-[#262626] shadow-2xl rounded-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="p-2.5 border-b border-[#1f1f1f] bg-[#111111]">
                            <input
                                type="text"
                                placeholder="Type to search partner..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full px-3 py-2 bg-[#161616] border border-[#282828] rounded-lg outline-none focus:border-neutral-400 text-xs font-bold text-white placeholder:text-neutral-500"
                                autoFocus
                            />
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto divide-y divide-[#181818]">
                            {filtered.length === 0 ? (
                                <div className="p-4 text-center text-neutral-500 text-[10px] font-bold uppercase tracking-wider">
                                    No partners found
                                </div>
                            ) : (
                                filtered.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(p.id.toString());
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                        className={cn(
                                            "w-full text-left px-4 py-3 text-xs font-bold transition-colors hover:bg-[#161616] block truncate cursor-pointer",
                                            p.id.toString() === selectedId ? "bg-[#181818] text-white" : "text-neutral-300"
                                        )}
                                    >
                                        {p.name} <span className="text-[10px] text-neutral-500 font-medium">({p.email})</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

interface AdminAddPartnerProps {
    hotels: any[];
    partners: any[];
    setPartners: (partners: any[]) => void;
}

export default function AdminAddPartner({ hotels, partners, setPartners }: AdminAddPartnerProps) {
    const [subTab, setSubTab] = useState<"register" | "createProperty" | "bulk" | "studio" | "csvImport">("register");

    // CSV Setup States
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvRows, setCsvRows] = useState<any[]>([]);
    const [isCsvImporting, setIsCsvImporting] = useState(false);
    const [csvError, setCsvError] = useState("");
    const [csvSuccess, setCsvSuccess] = useState("");
    const [csvResultsLog, setCsvResultsLog] = useState<any[]>([]);

    const parseCSV = (text: string) => {
        const lines = [];
        let row: string[] = [];
        let inQuotes = false;
        let currentVal = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    currentVal += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                row.push(currentVal.trim());
                currentVal = '';
            } else if ((char === '\n' || char === '\r') && !inQuotes) {
                if (char === '\r' && nextChar === '\n') {
                    i++;
                }
                row.push(currentVal.trim());
                if (row.length > 1 || row[0] !== '') {
                    lines.push(row);
                }
                row = [];
                currentVal = '';
            } else {
                currentVal += char;
            }
        }
        if (currentVal !== '' || row.length > 0) {
            row.push(currentVal.trim());
            lines.push(row);
        }
        return lines;
    };

    const mapHeaders = (headers: string[]) => {
        const cleanHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const fieldMapping: Record<string, string[]> = {
            partnerName: ['partnername', 'name', 'ownername', 'owner', 'fullname', 'ownerfullname'],
            partnerEmail: ['partneremail', 'email', 'owneremail', 'loginemail', 'emailaddress'],
            partnerPhone: ['partnerphone', 'phone', 'number', 'mobile', 'contact', 'phonenumber'],
            partnerPassword: ['partnerpassword', 'password', 'pass', 'accountpassword'],
            hotelName: ['hotelname', 'hotel', 'propertyname', 'property'],
            hotelAddress: ['hoteladdress', 'address', 'fulladdress', 'location'],
            city: ['city', 'town'],
            price: ['price', 'pricepernight', 'rate', 'baseprice'],
            stars: ['stars', 'star', 'starrating', 'rating'],
            amenities: ['amenities', 'facilities', 'amenity']
        };

        const mappedIndices: Record<number, string> = {};

        headers.forEach((_, index) => {
            const clean = cleanHeaders[index];
            for (const [field, synonyms] of Object.entries(fieldMapping)) {
                if (synonyms.includes(clean)) {
                    mappedIndices[index] = field;
                    break;
                }
            }
        });

        return mappedIndices;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCsvFile(file);
        setCsvError("");
        setCsvSuccess("");
        setCsvResultsLog([]);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            try {
                const parsed = parseCSV(text);
                if (parsed.length < 2) {
                    setCsvError("The CSV file must contain a header row and at least one data row.");
                    return;
                }

                const headers = parsed[0];
                const dataRows = parsed.slice(1);

                if (dataRows.length > 10) {
                    setCsvError("The uploaded CSV exceeds the limit of 10 rows. Please limit the CSV to max 10 rows.");
                    return;
                }

                const headerMap = mapHeaders(headers);
                const requiredFields = ['partnerName', 'partnerEmail', 'partnerPassword', 'hotelName', 'hotelAddress'];
                const mappedFields = Object.values(headerMap);
                const missingRequired = requiredFields.filter(f => !mappedFields.includes(f));

                if (missingRequired.length > 0) {
                    const friendlyNames: Record<string, string> = {
                        partnerName: 'Partner Name',
                        partnerEmail: 'Partner Email',
                        partnerPassword: 'Partner Password',
                        hotelName: 'Hotel Name',
                        hotelAddress: 'Hotel Address'
                    };
                    setCsvError(`CSV is missing required columns: ${missingRequired.map(f => friendlyNames[f] || f).join(", ")}`);
                    return;
                }

                const parsedRows = dataRows.map((rowArr, i) => {
                    const rowObj: any = { id: i + 1, stars: "3", price: "1200", city: "Delhi", amenities: "Free Wifi, AC" };
                    rowArr.forEach((val, colIdx) => {
                        const fieldName = headerMap[colIdx];
                        if (fieldName) {
                            rowObj[fieldName] = val;
                        }
                    });
                    return rowObj;
                });

                setCsvRows(parsedRows);
            } catch (err: any) {
                setCsvError("Failed to parse CSV file. Please make sure it is a valid CSV.");
            }
        };
        reader.readAsText(file);
    };

    const handleCsvRowChange = (index: number, field: string, value: string) => {
        const updated = [...csvRows];
        updated[index] = { ...updated[index], [field]: value };
        setCsvRows(updated);
    };

    const removeCsvRow = (index: number) => {
        setCsvRows(csvRows.filter((_, i) => i !== index));
    };

    const downloadCsvTemplate = () => {
        const headers = "Partner Name,Partner Email,Partner Phone,Partner Password,Hotel Name,Hotel Address,City,Price,Stars,Amenities\n";
        const sampleRow = 'John Doe,john@grandpalace.com,9876543210,SecretPass123!,Grand Palace Hotel,"Plot 44, Aerocity",Delhi,2500,4,"Free Wifi, Swimming Pool, AC, Restaurant"\n';
        const blob = new Blob([headers + sampleRow], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "partner_hotel_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCsvImportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCsvError("");
        setCsvSuccess("");
        setCsvResultsLog([]);

        if (csvRows.length === 0) {
            setCsvError("No CSV records loaded to process.");
            return;
        }

        // Validate rows
        for (let i = 0; i < csvRows.length; i++) {
            const r = csvRows[i];
            if (!r.partnerName?.trim() || !r.partnerEmail?.trim() || !r.partnerPassword?.trim()) {
                setCsvError(`Row #${i + 1}: Partner Name, Partner Email, and Password are required.`);
                return;
            }
            if (!r.hotelName?.trim() || !r.hotelAddress?.trim()) {
                setCsvError(`Row #${i + 1}: Hotel Name and Hotel Address are required.`);
                return;
            }
        }

        setIsCsvImporting(true);
        const results = [];

        try {
            for (let i = 0; i < csvRows.length; i++) {
                const r = csvRows[i];
                try {
                    // 1. Create Partner
                    let partnerId: number;
                    const existingPartner = partners.find(p => p.email?.toLowerCase() === r.partnerEmail.trim().toLowerCase());
                    
                    if (existingPartner) {
                        partnerId = existingPartner.id;
                    } else {
                        const partnerRes = await adminApi.createPartner({
                            name: r.partnerName.trim(),
                            email: r.partnerEmail.trim(),
                            phone: r.partnerPhone?.trim() || "",
                            password: r.partnerPassword.trim()
                        });
                        
                        if (!partnerRes.success || !partnerRes.data?.id) {
                            results.push({
                                row: i + 1,
                                partnerName: r.partnerName,
                                email: r.partnerEmail,
                                hotelName: r.hotelName,
                                success: false,
                                message: partnerRes.message || "Failed to register partner account"
                            });
                            continue;
                        }
                        partnerId = partnerRes.data.id;
                    }

                    // 2. Create Hotel under Partner
                    const propRes = await adminApi.createHotel({
                        ownerId: partnerId,
                        name: r.hotelName.trim(),
                        city: r.city?.trim() || "Delhi",
                        address: r.hotelAddress.trim(),
                        pricePerNight: parseFloat(r.price) || 1200,
                        starRating: parseInt(r.stars) || 3,
                        amenities: r.amenities ? r.amenities.split(",").map((s: string) => s.trim()).filter(Boolean) : ["Free Wifi", "AC"]
                    });

                    if (propRes.success) {
                        results.push({
                            row: i + 1,
                            partnerName: r.partnerName,
                            email: r.partnerEmail,
                            hotelName: r.hotelName,
                            success: true,
                            message: "Account & Property created successfully"
                        });
                    } else {
                        results.push({
                            row: i + 1,
                            partnerName: r.partnerName,
                            email: r.partnerEmail,
                            hotelName: r.hotelName,
                            success: false,
                            message: propRes.message || "Failed to register property under partner"
                        });
                    }
                } catch (err: any) {
                    results.push({
                        row: i + 1,
                        partnerName: r.partnerName,
                        email: r.partnerEmail,
                        hotelName: r.hotelName,
                        success: false,
                        message: err.message || "Unexpected server error"
                    });
                }
            }

            setCsvResultsLog(results);
            const successfulCount = results.filter(r => r.success).length;
            setCsvSuccess(`Processed ${results.length} records: ${successfulCount} successfully imported, ${results.length - successfulCount} failed.`);
            
            // Refresh partner list
            const refreshed = await adminApi.getPartners();
            setPartners(refreshed.data || []);
            
            if (successfulCount === results.length) {
                setCsvRows([]);
                setCsvFile(null);
            }
        } catch (err: any) {
            setCsvError(err.message || "An unexpected error occurred during CSV batch processing.");
        } finally {
            setIsCsvImporting(false);
        }
    };

    // ─── Single Partner Registration States ───────────────────────────────────
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [isCreatingPartner, setIsCreatingPartner] = useState(false);
    const [registerError, setRegisterError] = useState("");
    const [registerSuccess, setRegisterSuccess] = useState("");

    // ─── Create Single Property States ────────────────────────────────────────
    const [propOwnerId, setPropOwnerId] = useState("");
    const [propName, setPropName] = useState("");
    const [propCity, setPropCity] = useState("Delhi");
    const [propAddress, setPropAddress] = useState("");
    const [propPrice, setPropPrice] = useState("1200");
    const [propStars, setPropStars] = useState("3");
    const [propAmenities, setPropAmenities] = useState("Free Wifi, AC, Power Backup");
    const [isCreatingProp, setIsCreatingProp] = useState(false);
    const [propError, setPropError] = useState("");
    const [propSuccess, setPropSuccess] = useState("");

    // ─── Bulk Hotel Creation States ──────────────────────────────────────────
    const [bulkOwnerId, setBulkOwnerId] = useState("");
    const [bulkHotels, setBulkHotels] = useState<Array<{
        name: string;
        city: string;
        address: string;
        pricePerNight: string;
        starRating: string;
        amenitiesString: string;
    }>>([
        { name: "", city: "Delhi", address: "", pricePerNight: "1200", starRating: "3", amenitiesString: "Free Wifi, AC" }
    ]);
    const [isBulkCreating, setIsBulkCreating] = useState(false);
    const [bulkError, setBulkError] = useState("");
    const [bulkSuccess, setBulkSuccess] = useState("");

    // ─── Multi-Partner Studio States ─────────────────────────────────────────
    const [studioStep, setStudioStep] = useState<1 | 2 | 3>(1);
    const [studioSelectedIds, setStudioSelectedIds] = useState<number[]>([]);
    const [studioSearch, setStudioSearch] = useState("");
    const [expandedPartnerIds, setExpandedPartnerIds] = useState<number[]>([]);
    const [studioPartnerHotels, setStudioPartnerHotels] = useState<Record<number, Array<{
        name: string;
        city: string;
        address: string;
        pricePerNight: string;
        starRating: string;
        amenitiesString: string;
    }>>>({});
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [studioError, setStudioError] = useState("");
    const [provisionResults, setProvisionResults] = useState<Array<{
        partnerId: number;
        partnerName: string;
        success: boolean;
        count: number;
        hotelNames?: string[];
        message?: string;
    }>>([]);

    // ─── Single Partner Register Handler ──────────────────────────────────────
    const handleRegisterPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegisterError("");
        setRegisterSuccess("");

        if (!name || !email || !password) {
            setRegisterError("Please fill in Name, Email and Password.");
            return;
        }

        setIsCreatingPartner(true);
        try {
            const res = await adminApi.createPartner({ name, email, phone, password });
            if (res.success) {
                setRegisterSuccess(`Partner created successfully! ID: #${res.data?.id}`);
                setName("");
                setEmail("");
                setPhone("");
                setPassword("");
                
                // Refresh list
                const refreshed = await adminApi.getPartners();
                setPartners(refreshed.data || []);
            } else {
                setRegisterError(res.message || "Failed to create partner account.");
            }
        } catch (err: any) {
            setRegisterError(err.message || "An unexpected error occurred.");
        } finally {
            setIsCreatingPartner(false);
        }
    };

    // ─── Create Single Property Handler ──────────────────────────────────────
    const handleCreateSingleProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        setPropError("");
        setPropSuccess("");

        if (!propOwnerId) {
            setPropError("Please select a partner owner first.");
            return;
        }
        if (!propName || !propAddress || !propCity) {
            setPropError("Please provide Hotel Name, City, and Full Address.");
            return;
        }

        setIsCreatingProp(true);
        try {
            const amenitiesArr = propAmenities.split(",").map(a => a.trim()).filter(Boolean);
            const res = await adminApi.createHotel({
                ownerId: parseInt(propOwnerId),
                name: propName,
                city: propCity,
                address: propAddress,
                pricePerNight: parseFloat(propPrice) || 1200,
                starRating: parseInt(propStars) || 3,
                amenities: amenitiesArr
            });

            if (res.success) {
                setPropSuccess(`Property "${propName}" created successfully under partner!`);
                setPropName("");
                setPropAddress("");
                setPropAmenities("Free Wifi, AC, Power Backup");

                // Refresh partners to reflect updated hotel arrays
                const refreshed = await adminApi.getPartners();
                setPartners(refreshed.data || []);
            } else {
                setPropError(res.message || "Failed to create property.");
            }
        } catch (err: any) {
            setPropError(err.message || "An unexpected error occurred.");
        } finally {
            setIsCreatingProp(false);
        }
    };

    // ─── Bulk Hotel Rows Handlers ────────────────────────────────────────────
    const addBulkRow = () => {
        if (bulkHotels.length >= 50) return;
        setBulkHotels([...bulkHotels, { name: "", city: "Delhi", address: "", pricePerNight: "1200", starRating: "3", amenitiesString: "Free Wifi, AC" }]);
    };

    const removeBulkRow = (index: number) => {
        if (bulkHotels.length === 1) return;
        setBulkHotels(bulkHotels.filter((_, i) => i !== index));
    };

    const handleBulkRowChange = (index: number, field: string, value: string) => {
        const updated = [...bulkHotels];
        updated[index] = { ...updated[index], [field]: value };
        setBulkHotels(updated);
    };

    // ─── Bulk Hotel Creation Submit ──────────────────────────────────────────
    const handleBulkCreateHotels = async (e: React.FormEvent) => {
        e.preventDefault();
        setBulkError("");
        setBulkSuccess("");

        if (!bulkOwnerId) {
            setBulkError("Please select an owner (partner) for these hotels.");
            return;
        }

        for (let i = 0; i < bulkHotels.length; i++) {
            const h = bulkHotels[i];
            if (!h.name.trim() || !h.city.trim() || !h.address.trim()) {
                setBulkError(`Hotel #${i + 1} is missing required fields (Name, City, or Address).`);
                return;
            }
        }

        setIsBulkCreating(true);
        try {
            const formattedHotels = bulkHotels.map(h => ({
                name: h.name.trim(),
                city: h.city.trim(),
                address: h.address.trim(),
                pricePerNight: parseFloat(h.pricePerNight) || 1200,
                starRating: parseInt(h.starRating) || 3,
                amenities: h.amenitiesString.split(",").map(s => s.trim()).filter(Boolean)
            }));

            const res = await adminApi.createBulkHotels({
                ownerId: parseInt(bulkOwnerId),
                hotels: formattedHotels
            });

            if (res.success) {
                setBulkSuccess(`Successfully batch-created ${res.count} hotels with default standard rooms!`);
                setBulkHotels([{ name: "", city: "", address: "", pricePerNight: "", starRating: "3", amenitiesString: "" }]);
                
                const refreshed = await adminApi.getPartners();
                setPartners(refreshed.data || []);
            } else {
                setBulkError(res.message || "Failed to batch create hotels.");
            }
        } catch (err: any) {
            setBulkError(err.message || "An unexpected error occurred during batch creation.");
        } finally {
            setIsBulkCreating(false);
        }
    };

    // ─── Studio Handlers ─────────────────────────────────────────────────────
    const toggleSelectPartner = (id: number) => {
        setStudioSelectedIds(prev => 
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const toggleSelectAllFiltered = (filteredIds: number[]) => {
        const allSelected = filteredIds.every(id => studioSelectedIds.includes(id));
        if (allSelected) {
            setStudioSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            setStudioSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
        }
    };

    const proceedToStep2 = () => {
        if (studioSelectedIds.length === 0) {
            setStudioError("Please select at least one partner user.");
            return;
        }
        setStudioError("");

        const newPartnerHotels = { ...studioPartnerHotels };
        studioSelectedIds.forEach(id => {
            if (!newPartnerHotels[id] || newPartnerHotels[id].length === 0) {
                newPartnerHotels[id] = [
                    { name: "", city: "Delhi", address: "", pricePerNight: "1200", starRating: "3", amenitiesString: "Free Wifi, AC" }
                ];
            }
        });
        setStudioPartnerHotels(newPartnerHotels);
        setExpandedPartnerIds([...studioSelectedIds]);
        setStudioStep(2);
    };

    const togglePartnerCardExpand = (id: number) => {
        setExpandedPartnerIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const addStudioHotelRow = (partnerId: number) => {
        const current = studioPartnerHotels[partnerId] || [];
        const partner = partners.find(p => p.id === partnerId);
        const existingCount = partner?.hotel?.length || 0;
        if (existingCount + current.length >= 50) {
            setStudioError(`Partner ${partner?.name} has reached the maximum capacity of 50 properties.`);
            return;
        }
        setStudioPartnerHotels({
            ...studioPartnerHotels,
            [partnerId]: [
                ...current,
                { name: "", city: "Delhi", address: "", pricePerNight: "1200", starRating: "3", amenitiesString: "Free Wifi, AC" }
            ]
        });
    };

    const removeStudioHotelRow = (partnerId: number, index: number) => {
        const current = studioPartnerHotels[partnerId] || [];
        if (current.length === 1) return;
        setStudioPartnerHotels({
            ...studioPartnerHotels,
            [partnerId]: current.filter((_, i) => i !== index)
        });
    };

    const handleStudioRowChange = (partnerId: number, index: number, field: string, value: string) => {
        const current = [...(studioPartnerHotels[partnerId] || [])];
        current[index] = { ...current[index], [field]: value };
        setStudioPartnerHotels({
            ...studioPartnerHotels,
            [partnerId]: current
        });
    };

    const proceedToStep3 = () => {
        setStudioError("");
        for (const pId of studioSelectedIds) {
            const partner = partners.find(p => p.id === pId);
            const hotels = studioPartnerHotels[pId] || [];
            for (let i = 0; i < hotels.length; i++) {
                const h = hotels[i];
                if (!h.name.trim() || !h.city.trim() || !h.address.trim()) {
                    setStudioError(`Hotel #${i + 1} for ${partner?.name} is missing Name, City, or Address.`);
                    return;
                }
            }
        }
        setStudioStep(3);
    };

    const handleStudioProvision = async () => {
        setIsProvisioning(true);
        setStudioError("");
        const results = [];

        try {
            for (const pId of studioSelectedIds) {
                const partner = partners.find(p => p.id === pId);
                const hotels = studioPartnerHotels[pId] || [];

                try {
                    const formatted = hotels.map(h => ({
                        name: h.name.trim(),
                        city: h.city.trim(),
                        address: h.address.trim(),
                        pricePerNight: parseFloat(h.pricePerNight) || 1200,
                        starRating: parseInt(h.starRating) || 3,
                        amenities: h.amenitiesString.split(",").map(s => s.trim()).filter(Boolean)
                    }));

                    const res = await adminApi.createBulkHotels({
                        ownerId: pId,
                        hotels: formatted
                    });

                    if (res.success) {
                        results.push({
                            partnerId: pId,
                            partnerName: partner?.name || `Partner #${pId}`,
                            success: true,
                            count: formatted.length,
                            hotelNames: formatted.map(f => f.name)
                        });
                    } else {
                        results.push({
                            partnerId: pId,
                            partnerName: partner?.name || `Partner #${pId}`,
                            success: false,
                            count: 0,
                            message: res.message || "Failed to provision"
                        });
                    }
                } catch (err: any) {
                    results.push({
                        partnerId: pId,
                        partnerName: partner?.name || `Partner #${pId}`,
                        success: false,
                        count: 0,
                        message: err.message || "Error"
                    });
                }
            }

            setProvisionResults(results);
            const refreshed = await adminApi.getPartners();
            setPartners(refreshed.data || []);
        } catch (err: any) {
            setStudioError(err.message || "Unexpected studio error.");
        } finally {
            setIsProvisioning(false);
        }
    };

    const resetStudio = () => {
        setStudioStep(1);
        setStudioSelectedIds([]);
        setStudioPartnerHotels({});
        setProvisionResults([]);
        setStudioError("");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-[1400px] text-white pb-16">
            {/* Header */}
            <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] p-8 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-y-12 translate-x-12 opacity-5 select-none pointer-events-none">
                    <Users className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10 space-y-2">
                    <h2 className="text-xl font-black uppercase tracking-wider text-white">Partner & Asset Provisioning</h2>
                    <p className="text-xs text-neutral-400 font-medium max-w-xl leading-relaxed">
                        Configure partner credentials, dynamically associate hotel inventory ownership, and provision mock draft categories in bulk.
                    </p>
                </div>
            </div>

            {/* Sub Tabs switcher */}
            <div className="flex border border-[#1f1f1f] gap-1.5 select-none shrink-0 bg-[#0c0c0c] p-2 rounded-2xl shadow-lg overflow-x-auto">
                <button
                    onClick={() => setSubTab("register")}
                    className={cn(
                        "px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all rounded-xl flex items-center gap-2 cursor-pointer whitespace-nowrap",
                        subTab === "register" 
                            ? "bg-white text-black shadow-md" 
                            : "text-neutral-400 hover:bg-[#161616] hover:text-white"
                    )}
                >
                    <Plus className="w-3.5 h-3.5" /> Single Partner
                </button>
                <button
                    onClick={() => setSubTab("createProperty")}
                    className={cn(
                        "px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all rounded-xl flex items-center gap-2 cursor-pointer whitespace-nowrap",
                        subTab === "createProperty" 
                            ? "bg-white text-black shadow-md" 
                            : "text-neutral-400 hover:bg-[#161616] hover:text-white"
                    )}
                >
                    <Plus className="w-3.5 h-3.5" /> Create Property
                </button>
                <button
                    onClick={() => setSubTab("bulk")}
                    className={cn(
                        "px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all rounded-xl flex items-center gap-2 cursor-pointer whitespace-nowrap",
                        subTab === "bulk" 
                            ? "bg-white text-black shadow-md" 
                            : "text-neutral-400 hover:bg-[#161616] hover:text-white"
                    )}
                >
                    <Hotel className="w-3.5 h-3.5" /> Bulk Hotel Setup
                </button>
                <button
                    onClick={() => setSubTab("studio")}
                    className={cn(
                        "px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all rounded-xl flex items-center gap-2 cursor-pointer whitespace-nowrap",
                        subTab === "studio" 
                            ? "bg-white text-black shadow-md" 
                            : "text-neutral-400 hover:bg-[#161616] hover:text-white"
                    )}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Multi-Partner Studio
                </button>
                <button
                    onClick={() => setSubTab("csvImport")}
                    className={cn(
                        "px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all rounded-xl flex items-center gap-2 cursor-pointer whitespace-nowrap",
                        subTab === "csvImport" 
                            ? "bg-white text-black shadow-md" 
                            : "text-neutral-400 hover:bg-[#161616] hover:text-white"
                    )}
                >
                    <Upload className="w-3.5 h-3.5" /> Setup Using CSV
                </button>
            </div>

            {/* ─── REGISTER SINGLE PARTNER ────────────────────────────────────────── */}
            {subTab === "register" && (
                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] rounded-2xl p-7 max-w-lg">
                    <div className="pb-4 border-b border-[#1f1f1f] mb-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Register Single Partner Account</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Create login credentials for a new hotel owner</p>
                    </div>

                    <form onSubmit={handleRegisterPartner} className="space-y-4">
                        {registerError && (
                            <div className="p-3 bg-red-950/80 border border-red-800/40 text-red-300 text-xs font-medium rounded-xl animate-in fade-in">
                                {registerError}
                            </div>
                        )}
                        {registerSuccess && (
                            <div className="p-3 bg-emerald-950/80 border border-emerald-800/40 text-emerald-300 text-xs font-medium rounded-xl animate-in fade-in flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                {registerSuccess}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Owner's full name..."
                                disabled={isCreatingPartner}
                                className="w-full px-4 py-3 bg-[#141414] border border-[#262626] rounded-xl focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all disabled:opacity-55"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Owner's login email..."
                                disabled={isCreatingPartner}
                                className="w-full px-4 py-3 bg-[#141414] border border-[#262626] rounded-xl focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all disabled:opacity-55"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="Contact phone number..."
                                disabled={isCreatingPartner}
                                className="w-full px-4 py-3 bg-[#141414] border border-[#262626] rounded-xl focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all disabled:opacity-55"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Account password..."
                                    disabled={isCreatingPartner}
                                    className="w-full px-4 py-3 bg-[#141414] border border-[#262626] rounded-xl focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all disabled:opacity-55"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isCreatingPartner}
                            className="w-full py-3.5 bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                        >
                            {isCreatingPartner ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-black" /> Registering...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-black" /> Create Partner Account
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* ─── CREATE SINGLE PROPERTY PANEL ───────────────────────────────────── */}
            {subTab === "createProperty" && (
                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] rounded-2xl p-7 flex flex-col md:flex-row gap-8">
                    {/* Left Panel */}
                    <div className="w-full md:w-[40%] space-y-4 shrink-0">
                        <div className="pb-4 border-b border-[#1f1f1f]">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Single Hotel Setup</h3>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Add a new property under a specific partner user</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Select Partner (Owner)</label>
                            <SearchablePartnerSelect
                                partners={partners}
                                selectedId={propOwnerId}
                                onChange={id => {
                                    setPropOwnerId(id);
                                    setPropError("");
                                    setPropSuccess("");
                                }}
                                disabled={isCreatingProp}
                                placeholder="-- Choose Partner User --"
                            />
                        </div>

                        {propOwnerId && (
                            <div className="p-4 bg-[#141414] border border-[#262626] rounded-xl space-y-2">
                                <h4 className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-emerald-400" /> Selected Partner Stats
                                </h4>
                                <p className="text-xs font-bold text-neutral-200">
                                    Currently Owning: <span className="text-emerald-400">{partners.find(p => p.id === parseInt(propOwnerId))?.hotel?.length || 0} / 50 properties</span>
                                </p>
                                <div className="h-1.5 w-full bg-[#262626] rounded-full overflow-hidden mt-1">
                                    <div 
                                        className={cn(
                                            "h-full rounded-full transition-all duration-300", 
                                            (partners.find(p => p.id === parseInt(propOwnerId))?.hotel?.length || 0) >= 50 ? "bg-red-500" : "bg-emerald-500"
                                        )}
                                        style={{ width: `${Math.min(100, ((partners.find(p => p.id === parseInt(propOwnerId))?.hotel?.length || 0) / 50) * 100)}%` }} 
                                    />
                                </div>
                                <p className="text-[10px] text-neutral-400 font-medium leading-relaxed pt-1">
                                    Properties are registered with active draft status. A default standard room will be setup automatically.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Panel */}
                    <div className="flex-1 space-y-4">
                        <form onSubmit={handleCreateSingleProperty} className="space-y-4">
                            {propError && (
                                <div className="p-3 bg-red-950/80 border border-red-800/40 text-red-300 text-xs font-medium rounded-xl animate-in fade-in">
                                    {propError}
                                </div>
                            )}
                            {propSuccess && (
                                <div className="p-3 bg-emerald-950/80 border border-emerald-800/40 text-emerald-300 text-xs font-medium rounded-xl animate-in fade-in flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    {propSuccess}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Hotel Name *</label>
                                    <input
                                        type="text"
                                        value={propName}
                                        onChange={e => setPropName(e.target.value)}
                                        placeholder="Grand Luxury Inn..."
                                        disabled={isCreatingProp || !propOwnerId}
                                        className="w-full px-4 py-3 bg-[#141414] border border-[#262626] rounded-xl focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all disabled:opacity-55"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">City *</label>
                                    <input
                                        type="text"
                                        value={propCity}
                                        onChange={e => setPropCity(e.target.value)}
                                        placeholder="New Delhi..."
                                        disabled={isCreatingProp || !propOwnerId}
                                        className="w-full px-4 py-3 bg-[#141414] border border-[#262626] rounded-xl focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all disabled:opacity-55"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Full Address *</label>
                                <input
                                    type="text"
                                    value={propAddress}
                                    onChange={e => setPropAddress(e.target.value)}
                                    placeholder="Plot No. 12, Sector-4, Dwarka..."
                                    disabled={isCreatingProp || !propOwnerId}
                                    className="w-full px-4 py-3 bg-[#141414] border border-[#262626] rounded-xl focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all disabled:opacity-55"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Default Base Price (₹ / night)</label>
                                    <input
                                        type="number"
                                        value={propPrice}
                                        onChange={e => setPropPrice(e.target.value)}
                                        placeholder="1200"
                                        disabled={isCreatingProp || !propOwnerId}
                                        className="w-full px-4 py-3 bg-[#141414] border border-[#262626] rounded-xl focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all disabled:opacity-55"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Star Rating</label>
                                    <select
                                        value={propStars}
                                        onChange={e => setPropStars(e.target.value)}
                                        disabled={isCreatingProp || !propOwnerId}
                                        className="w-full px-4 py-3 bg-[#141414] border border-[#262626] rounded-xl focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all disabled:opacity-55"
                                    >
                                        <option value="1" className="bg-[#141414]">1 Star</option>
                                        <option value="2" className="bg-[#141414]">2 Star</option>
                                        <option value="3" className="bg-[#141414]">3 Star</option>
                                        <option value="4" className="bg-[#141414]">4 Star</option>
                                        <option value="5" className="bg-[#141414]">5 Star</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Amenities (comma-separated)</label>
                                <input
                                    type="text"
                                    value={propAmenities}
                                    onChange={e => setPropAmenities(e.target.value)}
                                    placeholder="Free Wifi, AC, Swimming Pool, Parking..."
                                    disabled={isCreatingProp || !propOwnerId}
                                    className="w-full px-4 py-3 bg-[#141414] border border-[#262626] rounded-xl focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all disabled:opacity-55"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isCreatingProp || !propOwnerId}
                                className="w-full py-3.5 bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                            >
                                {isCreatingProp ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-black" /> Provisioning...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 text-black" /> Create Property Under Partner
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── BULK HOTEL SETUP ────────────────────────────────────────────────── */}
            {subTab === "bulk" && (
                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] rounded-2xl p-7 space-y-6">
                    <div className="pb-4 border-b border-[#1f1f1f] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bulk Hotel Batch Setup</h3>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Batch import draft properties with default room types</p>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Assign Ownership to</label>
                            <SearchablePartnerSelect
                                partners={partners}
                                selectedId={bulkOwnerId}
                                onChange={id => setBulkOwnerId(id)}
                                disabled={isBulkCreating}
                                placeholder="-- Choose Partner User --"
                                className="w-64"
                            />
                        </div>
                    </div>

                    <form onSubmit={handleBulkCreateHotels} className="space-y-6">
                        {bulkError && (
                            <div className="p-3 bg-red-950/80 border border-red-800/40 text-red-300 text-xs font-medium rounded-xl animate-in fade-in">
                                {bulkError}
                            </div>
                        )}
                        {bulkSuccess && (
                            <div className="p-3 bg-emerald-950/80 border border-emerald-800/40 text-emerald-300 text-xs font-medium rounded-xl animate-in fade-in flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                {bulkSuccess}
                            </div>
                        )}

                        {/* Batch items table */}
                        <div className="overflow-x-auto border border-[#1f1f1f] rounded-xl bg-[#0e0e0e]">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead className="bg-[#111111] border-b border-[#1f1f1f] text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                                    <tr>
                                        <th className="px-4 py-3 w-[8px]">#</th>
                                        <th className="px-4 py-3">Hotel Name *</th>
                                        <th className="px-4 py-3 w-[150px]">City *</th>
                                        <th className="px-4 py-3">Address *</th>
                                        <th className="px-4 py-3 w-[110px]">Price (₹)</th>
                                        <th className="px-4 py-3 w-[80px]">Stars</th>
                                        <th className="px-4 py-3">Amenities</th>
                                        <th className="px-4 py-3 w-[50px] text-center">Delete</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#181818]">
                                    {bulkHotels.map((hotel, index) => (
                                        <tr key={index} className="hover:bg-[#141414] transition-colors">
                                            <td className="px-4 py-3 text-[10px] font-mono text-neutral-500 text-center">{index + 1}</td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    value={hotel.name}
                                                    onChange={e => handleBulkRowChange(index, "name", e.target.value)}
                                                    placeholder="Hotel Name"
                                                    disabled={isBulkCreating}
                                                    className="w-full px-3 py-1.5 bg-[#161616] border border-[#282828] focus:border-neutral-400 outline-none text-xs font-bold text-white rounded-lg transition-all"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    value={hotel.city}
                                                    onChange={e => handleBulkRowChange(index, "city", e.target.value)}
                                                    placeholder="City"
                                                    disabled={isBulkCreating}
                                                    className="w-full px-3 py-1.5 bg-[#161616] border border-[#282828] focus:border-neutral-400 outline-none text-xs font-bold text-white rounded-lg transition-all"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    value={hotel.address}
                                                    onChange={e => handleBulkRowChange(index, "address", e.target.value)}
                                                    placeholder="Full Address"
                                                    disabled={isBulkCreating}
                                                    className="w-full px-3 py-1.5 bg-[#161616] border border-[#282828] focus:border-neutral-400 outline-none text-xs font-bold text-white rounded-lg transition-all"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="number"
                                                    value={hotel.pricePerNight}
                                                    onChange={e => handleBulkRowChange(index, "pricePerNight", e.target.value)}
                                                    placeholder="1200"
                                                    disabled={isBulkCreating}
                                                    className="w-full px-3 py-1.5 bg-[#161616] border border-[#282828] focus:border-neutral-400 outline-none text-xs font-bold text-white rounded-lg transition-all font-mono"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <select
                                                    value={hotel.starRating}
                                                    onChange={e => handleBulkRowChange(index, "starRating", e.target.value)}
                                                    disabled={isBulkCreating}
                                                    className="w-full px-2 py-1.5 bg-[#161616] border border-[#282828] focus:border-neutral-400 outline-none text-xs font-bold text-white rounded-lg transition-all"
                                                >
                                                    <option value="1" className="bg-[#141414]">1 ★</option>
                                                    <option value="2" className="bg-[#141414]">2 ★</option>
                                                    <option value="3" className="bg-[#141414]">3 ★</option>
                                                    <option value="4" className="bg-[#141414]">4 ★</option>
                                                    <option value="5" className="bg-[#141414]">5 ★</option>
                                                </select>
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    value={hotel.amenitiesString}
                                                    onChange={e => handleBulkRowChange(index, "amenitiesString", e.target.value)}
                                                    placeholder="Wifi, AC, Pool..."
                                                    disabled={isBulkCreating}
                                                    className="w-full px-3 py-1.5 bg-[#161616] border border-[#282828] focus:border-neutral-400 outline-none text-xs font-bold text-white rounded-lg transition-all"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeBulkRow(index)}
                                                    disabled={isBulkCreating || bulkHotels.length === 1}
                                                    className="text-red-400 hover:text-red-300 disabled:opacity-30 cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                            <button
                                type="button"
                                onClick={addBulkRow}
                                disabled={isBulkCreating || bulkHotels.length >= 50}
                                className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-emerald-400 hover:underline disabled:opacity-50 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> Add Property Row
                            </button>

                            <button
                                type="submit"
                                disabled={isBulkCreating || !bulkOwnerId || bulkHotels.every(h => !h.name.trim())}
                                className="px-8 py-3.5 bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                            >
                                {isBulkCreating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-black" /> Batch Processing...
                                    </>
                                ) : (
                                    <>
                                        <Hotel className="w-4 h-4 text-black" /> Bulk Register {bulkHotels.length} Hotels
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ─── MULTI-PARTNER STUDIO ────────────────────────────────────────────── */}
            {subTab === "studio" && (
                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] rounded-2xl p-7 space-y-6">
                    {/* Step Progress Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#1f1f1f] pb-4 gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400 animate-pulse" /> Multi-Partner Studio
                            </h3>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">
                                Provision custom inventories across multiple partner accounts simultaneously
                            </p>
                        </div>
                        
                        {/* Steps Indicator */}
                        <div className="flex items-center gap-2 select-none">
                            <span className={cn(
                                "px-3.5 py-1 text-[10px] font-black tracking-wider rounded-lg uppercase transition-all",
                                studioStep === 1 ? "bg-white text-black font-extrabold" : "bg-[#141414] text-neutral-500 border border-[#222]"
                            )}>
                                1. Select
                            </span>
                            <ArrowRight className="w-3 h-3 text-neutral-600" />
                            <span className={cn(
                                "px-3.5 py-1 text-[10px] font-black tracking-wider rounded-lg uppercase transition-all",
                                studioStep === 2 ? "bg-white text-black font-extrabold" : "bg-[#141414] text-neutral-500 border border-[#222]"
                            )}>
                                2. Configure
                            </span>
                            <ArrowRight className="w-3 h-3 text-neutral-600" />
                            <span className={cn(
                                "px-3.5 py-1 text-[10px] font-black tracking-wider rounded-lg uppercase transition-all",
                                studioStep === 3 ? "bg-white text-black font-extrabold" : "bg-[#141414] text-neutral-500 border border-[#222]"
                            )}>
                                3. Provision
                            </span>
                        </div>
                    </div>

                    {studioError && (
                        <div className="p-3 bg-red-950/80 border border-red-800/40 text-red-300 text-xs font-medium rounded-xl animate-in fade-in flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                            <span>{studioError}</span>
                        </div>
                    )}

                    {/* STEP 1: SELECT PARTNERS */}
                    {studioStep === 1 && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <div className="relative w-full sm:w-80">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                                        <Search className="w-3.5 h-3.5" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search partner by name or email..."
                                        value={studioSearch}
                                        onChange={e => setStudioSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-[#262626] rounded-xl focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all placeholder:text-neutral-500"
                                    />
                                </div>

                                <div className="text-[10px] font-black text-neutral-400 uppercase tracking-wider shrink-0 bg-[#141414] px-3.5 py-2 rounded-xl border border-[#262626]">
                                    Selected Partners: <span className="text-emerald-400 font-mono text-xs">{studioSelectedIds.length}</span>
                                </div>
                            </div>

                            {/* Partners Checklist */}
                            <div className="border border-[#1f1f1f] rounded-xl overflow-hidden bg-[#0e0e0e]">
                                <div className="bg-[#111111] border-b border-[#1f1f1f] px-4 py-3 flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={
                                                partners.filter(p => 
                                                    !studioSearch.trim() ||
                                                    p.name?.toLowerCase().includes(studioSearch.toLowerCase()) ||
                                                    p.email?.toLowerCase().includes(studioSearch.toLowerCase())
                                                ).length > 0 &&
                                                partners.filter(p => 
                                                    !studioSearch.trim() ||
                                                    p.name?.toLowerCase().includes(studioSearch.toLowerCase()) ||
                                                    p.email?.toLowerCase().includes(studioSearch.toLowerCase())
                                                ).every(p => studioSelectedIds.includes(p.id))
                                            }
                                            onChange={() => {
                                                const filtered = partners.filter(p => 
                                                    !studioSearch.trim() ||
                                                    p.name?.toLowerCase().includes(studioSearch.toLowerCase()) ||
                                                    p.email?.toLowerCase().includes(studioSearch.toLowerCase())
                                                ).map(p => p.id);
                                                toggleSelectAllFiltered(filtered);
                                            }}
                                            className="w-4 h-4 rounded border-neutral-700 bg-[#181818] cursor-pointer accent-emerald-500"
                                        />
                                        <span>Select All Shown</span>
                                    </div>
                                    <div>Properties owned</div>
                                </div>

                                <div className="max-h-[350px] overflow-y-auto divide-y divide-[#181818]">
                                    {partners.filter(p => 
                                        !studioSearch.trim() ||
                                        p.name?.toLowerCase().includes(studioSearch.toLowerCase()) ||
                                        p.email?.toLowerCase().includes(studioSearch.toLowerCase())
                                    ).length === 0 ? (
                                        <div className="p-8 text-center text-neutral-500 text-xs font-bold uppercase tracking-wider">
                                            No partners found matching search
                                        </div>
                                    ) : (
                                        partners.filter(p => 
                                            !studioSearch.trim() ||
                                            p.name?.toLowerCase().includes(studioSearch.toLowerCase()) ||
                                            p.email?.toLowerCase().includes(studioSearch.toLowerCase())
                                        ).map(p => {
                                            const isSelected = studioSelectedIds.includes(p.id);
                                            const hotelCount = p.hotel?.length || 0;
                                            return (
                                                <div 
                                                    key={p.id} 
                                                    onClick={() => toggleSelectPartner(p.id)}
                                                    className={cn(
                                                        "px-4 py-3 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer select-none",
                                                        isSelected ? "bg-[#161616] text-white" : "hover:bg-[#121212] text-neutral-300"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {}}
                                                            className="w-4 h-4 rounded border-neutral-700 bg-[#181818] cursor-pointer accent-emerald-500"
                                                        />
                                                        <div>
                                                            <div className="font-bold text-white">{p.name}</div>
                                                            <div className="text-[10px] text-neutral-400 font-medium">{p.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border font-mono",
                                                        hotelCount >= 50 
                                                            ? "bg-red-950/80 text-red-300 border-red-800/40" 
                                                            : "bg-[#181818] text-neutral-300 border-[#262626]"
                                                    )}>
                                                        {hotelCount} / 50 Active
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={proceedToStep2}
                                    disabled={studioSelectedIds.length === 0}
                                    className="px-6 py-3 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                                >
                                    Configure Properties <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: CONFIGURE HOTELS PER PARTNER */}
                    {studioStep === 2 && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                {studioSelectedIds.map(partnerId => {
                                    const partner = partners.find(p => p.id === partnerId);
                                    if (!partner) return null;
                                    
                                    const isExpanded = expandedPartnerIds.includes(partnerId);
                                    const hotels = studioPartnerHotels[partnerId] || [];
                                    const currentCount = partner.hotel?.length || 0;
                                    const totalCountAfter = currentCount + hotels.length;

                                    return (
                                        <div key={partnerId} className="border border-[#222222] rounded-xl overflow-hidden bg-[#0e0e0e] shadow-md transition-all">
                                            {/* Card Header */}
                                            <div 
                                                onClick={() => togglePartnerCardExpand(partnerId)}
                                                className="bg-[#121212] border-b border-[#1f1f1f] px-5 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-[#161616] transition-colors"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                                                    )}
                                                    <div>
                                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{partner.name}</h4>
                                                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">{partner.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shrink-0 font-mono",
                                                        totalCountAfter > 50 
                                                            ? "bg-red-950/80 text-red-300 border-red-800/40"
                                                            : "bg-[#181818] text-neutral-300 border-[#282828]"
                                                    )}>
                                                        Inventory: {currentCount} owned + {hotels.length} drafted = {totalCountAfter} / 50
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            {isExpanded && (
                                                <div className="p-5 space-y-4 bg-[#0a0a0a]">
                                                    <div className="divide-y divide-[#181818] border border-[#1f1f1f] rounded-xl bg-[#111111] overflow-hidden">
                                                        {hotels.map((hotel, index) => (
                                                            <div key={index} className="p-4 space-y-3.5 hover:bg-[#141414]">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">
                                                                        Hotel #{index + 1} definition
                                                                    </span>
                                                                    {hotels.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeStudioHotelRow(partnerId, index)}
                                                                            className="text-red-400 hover:text-red-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Hotel Name *</label>
                                                                        <input
                                                                            type="text"
                                                                            value={hotel.name}
                                                                            onChange={e => handleStudioRowChange(partnerId, index, "name", e.target.value)}
                                                                            placeholder="Grand Palace Resort..."
                                                                            className="w-full px-3 py-2 bg-[#161616] border border-[#282828] rounded-lg focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">City *</label>
                                                                        <input
                                                                            type="text"
                                                                            value={hotel.city}
                                                                            onChange={e => handleStudioRowChange(partnerId, index, "city", e.target.value)}
                                                                            placeholder="Mumbai..."
                                                                            className="w-full px-3 py-2 bg-[#161616] border border-[#282828] rounded-lg focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Full Address *</label>
                                                                        <input
                                                                            type="text"
                                                                            value={hotel.address}
                                                                            onChange={e => handleStudioRowChange(partnerId, index, "address", e.target.value)}
                                                                            placeholder="Near Airport Road, Andheri..."
                                                                            className="w-full px-3 py-2 bg-[#161616] border border-[#282828] rounded-lg focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Base Price (₹ / night)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={hotel.pricePerNight}
                                                                            onChange={e => handleStudioRowChange(partnerId, index, "pricePerNight", e.target.value)}
                                                                            placeholder="1200"
                                                                            className="w-full px-3 py-2 bg-[#161616] border border-[#282828] rounded-lg focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all font-mono"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Star Rating</label>
                                                                        <select
                                                                            value={hotel.starRating}
                                                                            onChange={e => handleStudioRowChange(partnerId, index, "starRating", e.target.value)}
                                                                            className="w-full px-3 py-2 bg-[#161616] border border-[#282828] rounded-lg focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all"
                                                                        >
                                                                            <option value="1" className="bg-[#141414]">1 Star</option>
                                                                            <option value="2" className="bg-[#141414]">2 Star</option>
                                                                            <option value="3" className="bg-[#141414]">3 Star</option>
                                                                            <option value="4" className="bg-[#141414]">4 Star</option>
                                                                            <option value="5" className="bg-[#141414]">5 Star</option>
                                                                        </select>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Amenities (comma-separated)</label>
                                                                        <input
                                                                            type="text"
                                                                            value={hotel.amenitiesString}
                                                                            onChange={e => handleStudioRowChange(partnerId, index, "amenitiesString", e.target.value)}
                                                                            placeholder="Free Wifi, AC, Gym..."
                                                                            className="w-full px-3 py-2 bg-[#161616] border border-[#282828] rounded-lg focus:outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => addStudioHotelRow(partnerId)}
                                                        className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-emerald-400 hover:underline cursor-pointer pt-1"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" /> Add another hotel for {partner.name}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Navigation Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-[#1f1f1f]">
                                <button
                                    type="button"
                                    onClick={() => setStudioStep(1)}
                                    className="px-5 py-3 bg-[#141414] border border-[#282828] hover:bg-[#1e1e1e] text-neutral-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Select Partners
                                </button>

                                <button
                                    type="button"
                                    onClick={proceedToStep3}
                                    className="px-6 py-3 bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                                >
                                    Review Summary <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PROVISION & RESULTS */}
                    {studioStep === 3 && (
                        <div className="space-y-6">
                            {provisionResults.length === 0 ? (
                                <div className="space-y-5">
                                    <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-xl p-5 space-y-4">
                                        <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                            Provisioning Specification Summary
                                        </h4>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="border-b border-[#1f1f1f] text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                                                        <th className="py-2.5">Partner</th>
                                                        <th className="py-2.5">Hotels Drafted</th>
                                                        <th className="py-2.5 text-right">Properties Count</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#181818]">
                                                    {studioSelectedIds.map(partnerId => {
                                                        const partner = partners.find(p => p.id === partnerId);
                                                        const hotels = studioPartnerHotels[partnerId] || [];
                                                        return (
                                                            <tr key={partnerId} className="font-bold text-neutral-200">
                                                                <td className="py-3 pr-4">
                                                                    <div className="text-white">{partner?.name}</div>
                                                                    <div className="text-[10px] text-neutral-400 font-medium">{partner?.email}</div>
                                                                </td>
                                                                <td className="py-3">
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {hotels.map((h, i) => (
                                                                            <span key={i} className="px-2 py-0.5 bg-[#161616] text-neutral-300 text-[10px] font-bold rounded-md border border-[#282828]">
                                                                                {h.name || "(Unnamed)"} ({h.city})
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 text-right text-emerald-400 font-mono font-bold">
                                                                    {hotels.length}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="font-bold text-white border-t border-[#1f1f1f] text-[10px] uppercase tracking-wider bg-[#111111] font-mono">
                                                        <td className="py-3 pl-2" colSpan={2}>Total Provision Scope</td>
                                                        <td className="py-3 pr-2 text-right text-emerald-400 text-xs font-bold font-mono">
                                                            {studioSelectedIds.length} Partners / {Object.values(studioPartnerHotels).reduce((acc, h) => acc + h.length, 0)} Hotels
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center justify-between pt-4 border-t border-[#1f1f1f]">
                                        <button
                                            type="button"
                                            disabled={isProvisioning}
                                            onClick={() => setStudioStep(2)}
                                            className="px-5 py-3 bg-[#141414] border border-[#282828] hover:bg-[#1e1e1e] text-neutral-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Edit
                                        </button>

                                        <button
                                            type="button"
                                            disabled={isProvisioning}
                                            onClick={handleStudioProvision}
                                            className="px-6 py-3.5 bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-w-48"
                                        >
                                            {isProvisioning ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin text-black" /> Provisioning Inventory...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 text-black" /> Provision All Drafts
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-xl p-6 space-y-5">
                                        <div className="pb-3 border-b border-[#1f1f1f] flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                                Provisioning Session Complete
                                            </h4>
                                        </div>

                                        <div className="space-y-3">
                                            {provisionResults.map((res, i) => (
                                                <div 
                                                    key={i} 
                                                    className={cn(
                                                        "p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs",
                                                        res.success 
                                                            ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-300" 
                                                            : "bg-red-950/40 border-red-800/40 text-red-300"
                                                    )}
                                                >
                                                    <div>
                                                        <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                                                            <span className={cn(
                                                                "w-2 h-2 rounded-full shrink-0", 
                                                                res.success ? "bg-emerald-400" : "bg-red-400"
                                                            )} />
                                                            {res.partnerName}
                                                        </div>
                                                        {res.success ? (
                                                            <div className="text-[10px] text-emerald-400 font-medium mt-1">
                                                                Successfully provisioned hotels:{" "}
                                                                <span className="font-bold">{res.hotelNames?.join(", ") || "(None)"}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-[10px] text-red-400 font-medium mt-1">
                                                                Error: {res.message}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className={cn(
                                                        "text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shrink-0 sm:text-right",
                                                        res.success 
                                                            ? "bg-emerald-950/80 border-emerald-800/40 text-emerald-400" 
                                                            : "bg-red-950/80 border-red-800/40 text-red-400"
                                                    )}>
                                                        {res.success ? `+${res.count} Hotels` : "Failed"}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={resetStudio}
                                            className="px-6 py-3 bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                                        >
                                            Start New Session <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ─── SETUP USING CSV PANEL ─────────────────────────────────────────── */}
            {subTab === "csvImport" && (
                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] rounded-2xl p-7 space-y-6">
                    <div className="pb-4 border-b border-[#1f1f1f] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Upload className="w-4 h-4 text-white" /> Setup Using CSV
                            </h3>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">
                                Register new partners and their properties in bulk using a CSV file (Max 10 records)
                            </p>
                        </div>
                        
                        <button
                            type="button"
                            onClick={downloadCsvTemplate}
                            className="px-4 py-2.5 border border-[#282828] hover:border-neutral-400 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer bg-[#141414] shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5" /> Download CSV Template
                        </button>
                    </div>

                    {/* Dropzone / Upload area */}
                    <div className="border-2 border-dashed border-[#282828] hover:border-neutral-500 bg-[#0e0e0e] rounded-2xl p-8 text-center transition-colors relative">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="space-y-2 pointer-events-none">
                            <Upload className="w-8 h-8 text-neutral-500 mx-auto" />
                            <p className="text-xs font-bold text-white">
                                {csvFile ? `Selected: ${csvFile.name}` : "Click or drag your CSV file here to upload"}
                            </p>
                            <p className="text-[10px] text-neutral-400 uppercase font-black tracking-wider">
                                CSV columns must map to: Partner Name, Email, Phone, Password, Hotel Name, Address, City, Price, Stars, Amenities
                            </p>
                        </div>
                    </div>

                    {csvError && (
                        <div className="p-3 bg-red-950/80 border border-red-800/40 text-red-300 text-xs font-medium rounded-xl animate-in fade-in">
                            {csvError}
                        </div>
                    )}

                    {csvSuccess && (
                        <div className="p-3 bg-emerald-950/80 border border-emerald-800/40 text-emerald-300 text-xs font-medium rounded-xl animate-in fade-in flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            {csvSuccess}
                        </div>
                    )}

                    {/* Rows Preview Table */}
                    {csvRows.length > 0 && (
                        <form onSubmit={handleCsvImportSubmit} className="space-y-6">
                            <div className="overflow-x-auto border border-[#1f1f1f] rounded-xl bg-[#0e0e0e]">
                                <table className="w-full text-left border-collapse min-w-[1200px]">
                                    <thead className="bg-[#111111] border-b border-[#1f1f1f] text-[9px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                                        <tr>
                                            <th className="px-3 py-3 w-[40px] text-center">#</th>
                                            <th className="px-3 py-3">Partner Name *</th>
                                            <th className="px-3 py-3">Partner Email *</th>
                                            <th className="px-3 py-3 w-[120px]">Partner Phone</th>
                                            <th className="px-3 py-3 w-[150px]">Partner Password *</th>
                                            <th className="px-3 py-3">Hotel Name *</th>
                                            <th className="px-3 py-3">Hotel Address *</th>
                                            <th className="px-3 py-3 w-[120px]">City</th>
                                            <th className="px-3 py-3 w-[90px]">Price (₹)</th>
                                            <th className="px-3 py-3 w-[80px]">Stars</th>
                                            <th className="px-3 py-3 w-[150px]">Amenities</th>
                                            <th className="px-3 py-3 w-[50px] text-center">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#181818]">
                                        {csvRows.map((row, index) => (
                                            <tr key={row.id} className="hover:bg-[#141414] text-xs">
                                                <td className="px-3 py-3 font-mono text-neutral-500 text-center">{index + 1}</td>
                                                
                                                {/* Partner fields */}
                                                <td className="px-1 py-1.5">
                                                    <input
                                                        type="text"
                                                        value={row.partnerName}
                                                        onChange={e => handleCsvRowChange(index, "partnerName", e.target.value)}
                                                        disabled={isCsvImporting}
                                                        className={cn(
                                                            "w-full px-2.5 py-1.5 bg-[#161616] border border-[#282828] rounded-lg outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all",
                                                            !row.partnerName?.trim() && "border-red-500 bg-red-950/20"
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-1 py-1.5">
                                                    <input
                                                        type="email"
                                                        value={row.partnerEmail}
                                                        onChange={e => handleCsvRowChange(index, "partnerEmail", e.target.value)}
                                                        disabled={isCsvImporting}
                                                        className={cn(
                                                            "w-full px-2.5 py-1.5 bg-[#161616] border border-[#282828] rounded-lg outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all",
                                                            (!row.partnerEmail?.trim() || !row.partnerEmail.includes("@")) && "border-red-500 bg-red-950/20"
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-1 py-1.5">
                                                    <input
                                                        type="text"
                                                        value={row.partnerPhone}
                                                        onChange={e => handleCsvRowChange(index, "partnerPhone", e.target.value)}
                                                        disabled={isCsvImporting}
                                                        className="w-full px-2.5 py-1.5 bg-[#161616] border border-[#282828] rounded-lg outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all"
                                                    />
                                                </td>
                                                <td className="px-1 py-1.5">
                                                    <input
                                                        type="text"
                                                        value={row.partnerPassword}
                                                        onChange={e => handleCsvRowChange(index, "partnerPassword", e.target.value)}
                                                        disabled={isCsvImporting}
                                                        className={cn(
                                                            "w-full px-2.5 py-1.5 bg-[#161616] border border-[#282828] rounded-lg outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all",
                                                            (!row.partnerPassword?.trim() || row.partnerPassword.length < 6) && "border-red-500 bg-red-950/20"
                                                        )}
                                                    />
                                                </td>

                                                {/* Hotel fields */}
                                                <td className="px-1 py-1.5">
                                                    <input
                                                        type="text"
                                                        value={row.hotelName}
                                                        onChange={e => handleCsvRowChange(index, "hotelName", e.target.value)}
                                                        disabled={isCsvImporting}
                                                        className={cn(
                                                            "w-full px-2.5 py-1.5 bg-[#161616] border border-[#282828] rounded-lg outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all",
                                                            !row.hotelName?.trim() && "border-red-500 bg-red-950/20"
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-1 py-1.5">
                                                    <input
                                                        type="text"
                                                        value={row.hotelAddress}
                                                        onChange={e => handleCsvRowChange(index, "hotelAddress", e.target.value)}
                                                        disabled={isCsvImporting}
                                                        className={cn(
                                                            "w-full px-2.5 py-1.5 bg-[#161616] border border-[#282828] rounded-lg outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all",
                                                            !row.hotelAddress?.trim() && "border-red-500 bg-red-950/20"
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-1 py-1.5">
                                                    <input
                                                        type="text"
                                                        value={row.city}
                                                        onChange={e => handleCsvRowChange(index, "city", e.target.value)}
                                                        disabled={isCsvImporting}
                                                        className="w-full px-2.5 py-1.5 bg-[#161616] border border-[#282828] rounded-lg outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all"
                                                    />
                                                </td>
                                                <td className="px-1 py-1.5">
                                                    <input
                                                        type="number"
                                                        value={row.price}
                                                        onChange={e => handleCsvRowChange(index, "price", e.target.value)}
                                                        disabled={isCsvImporting}
                                                        className="w-full px-2.5 py-1.5 bg-[#161616] border border-[#282828] rounded-lg outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all font-mono"
                                                    />
                                                </td>
                                                <td className="px-1 py-1.5">
                                                    <select
                                                        value={row.stars}
                                                        onChange={e => handleCsvRowChange(index, "stars", e.target.value)}
                                                        disabled={isCsvImporting}
                                                        className="w-full px-2 py-1.5 bg-[#161616] border border-[#282828] rounded-lg outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all"
                                                    >
                                                        <option value="1" className="bg-[#141414]">1 ★</option>
                                                        <option value="2" className="bg-[#141414]">2 ★</option>
                                                        <option value="3" className="bg-[#141414]">3 ★</option>
                                                        <option value="4" className="bg-[#141414]">4 ★</option>
                                                        <option value="5" className="bg-[#141414]">5 ★</option>
                                                    </select>
                                                </td>
                                                <td className="px-1 py-1.5">
                                                    <input
                                                        type="text"
                                                        value={row.amenities}
                                                        onChange={e => handleCsvRowChange(index, "amenities", e.target.value)}
                                                        disabled={isCsvImporting}
                                                        placeholder="Wifi, AC, TV"
                                                        className="w-full px-2.5 py-1.5 bg-[#161616] border border-[#282828] rounded-lg outline-none focus:border-neutral-400 text-xs font-bold text-white transition-all"
                                                    />
                                                </td>

                                                <td className="px-3 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCsvRow(index)}
                                                        disabled={isCsvImporting}
                                                        className="text-red-400 hover:text-red-300 disabled:opacity-30 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isCsvImporting || csvRows.length === 0}
                                    className="px-8 py-3.5 bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                                >
                                    {isCsvImporting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-black" /> Provisioning Partner Accounts...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 text-black" /> Bulk Import {csvRows.length} Records
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Execution Results Log */}
                    {csvResultsLog.length > 0 && (
                        <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-xl p-5 space-y-4 animate-in fade-in duration-300">
                            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-[#1f1f1f] pb-2 flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-emerald-400" /> CSV Bulk Import Log Report
                            </h4>
                            <div className="space-y-3">
                                {csvResultsLog.map((result, i) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs",
                                            result.success 
                                                ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-300" 
                                                : "bg-red-950/40 border-red-800/40 text-red-300"
                                        )}
                                    >
                                        <div>
                                            <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full shrink-0", 
                                                    result.success ? "bg-emerald-400" : "bg-red-400"
                                                )} />
                                                {result.partnerName || 'Row Details'} ({result.email})
                                            </div>
                                            <div className="text-[10px] text-neutral-400 mt-1">
                                                {result.success ? (
                                                    <>
                                                        Created partner user & associated property <span className="font-bold text-white">"{result.hotelName}"</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        Error: <span className="font-bold text-red-400">{result.message}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shrink-0 sm:text-right",
                                            result.success 
                                                ? "bg-emerald-950/80 border-emerald-800/40 text-emerald-400" 
                                                : "bg-red-950/80 border-red-800/40 text-red-400"
                                        )}>
                                            {result.success ? "Success" : "Failed"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
