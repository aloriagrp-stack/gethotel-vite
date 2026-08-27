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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 text-left text-xs font-bold transition-all disabled:opacity-55 flex justify-between items-center cursor-pointer select-none"
            >
                <span className="truncate">
                    {selectedPartner ? `${selectedPartner.name} (${selectedPartner.email})` : placeholder}
                </span>
                <span className="text-slate-400 ml-2">▼</span>
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
                    
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-sm z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="p-2 border-b border-slate-100 bg-slate-50">
                            <input
                                type="text"
                                placeholder="Type to search partner..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-sm outline-none focus:border-slate-400 text-xs font-bold"
                                autoFocus
                            />
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <div className="p-3 text-center text-slate-400 text-[10px] font-bold uppercase">
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
                                            "w-full text-left px-4 py-2.5 text-xs font-bold transition-colors hover:bg-slate-50 block truncate cursor-pointer",
                                            p.id.toString() === selectedId ? "bg-slate-50 text-brand-600" : "text-slate-750"
                                        )}
                                    >
                                        {p.name} <span className="text-[10px] text-slate-400 font-medium">({p.email})</span>
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
                    const missingList = missingRequired.map(f => friendlyNames[f] || f).join(', ');
                    setCsvError(`Missing required column headers: ${missingList}. Please ensure these columns are in your CSV file.`);
                    return;
                }

                const rows = dataRows.map((cols, rowIndex) => {
                    const rowObj: any = {
                        id: rowIndex + 1,
                        partnerName: "",
                        partnerEmail: "",
                        partnerPhone: "",
                        partnerPassword: "",
                        hotelName: "",
                        hotelAddress: "",
                        city: "New Delhi",
                        price: "1200",
                        stars: "3",
                        amenities: ""
                    };

                    cols.forEach((val, colIndex) => {
                        const fieldName = headerMap[colIndex];
                        if (fieldName) {
                            rowObj[fieldName] = val;
                        }
                    });

                    return rowObj;
                });

                setCsvRows(rows);
                setCsvSuccess(`Successfully parsed ${rows.length} rows. Please review and edit the details below before importing.`);

            } catch (err: any) {
                setCsvError("Failed to parse CSV file: " + err.message);
            }
        };
        reader.readAsText(file);
    };

    const downloadCsvTemplate = () => {
        const headers = [
            "Partner Name", 
            "Partner Email", 
            "Partner Phone", 
            "Partner Password", 
            "Hotel Name", 
            "Hotel Address", 
            "City", 
            "Price", 
            "Stars", 
            "Amenities"
        ];
        const sampleRow = [
            "John Doe", 
            "john.doe@example.com", 
            "9876543210", 
            "SecurePass123", 
            "The Royal Orchid Resort", 
            "12 Mall Road, Near City Center", 
            "Shimla", 
            "3500", 
            "4", 
            "Wifi, AC, Free Breakfast, Parking"
        ];
        
        const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "gethotel_partner_import_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCsvRowChange = (index: number, field: string, value: string) => {
        const updated = [...csvRows];
        updated[index] = { ...updated[index], [field]: value };
        setCsvRows(updated);
    };

    const removeCsvRow = (index: number) => {
        setCsvRows(csvRows.filter((_, i) => i !== index));
    };

    const validateCsvRows = () => {
        for (let i = 0; i < csvRows.length; i++) {
            const row = csvRows[i];
            if (!row.partnerName?.trim()) return `Row ${i + 1}: Partner Name is required.`;
            if (!row.partnerEmail?.trim() || !row.partnerEmail.includes("@")) return `Row ${i + 1}: Valid Partner Email is required.`;
            if (!row.partnerPassword?.trim() || row.partnerPassword.length < 6) return `Row ${i + 1}: Partner Password must be at least 6 characters.`;
            if (!row.hotelName?.trim()) return `Row ${i + 1}: Hotel Name is required.`;
            if (!row.hotelAddress?.trim()) return `Row ${i + 1}: Hotel Address is required.`;
        }
        return null;
    };

    const handleCsvImportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCsvError("");
        setCsvSuccess("");
        setCsvResultsLog([]);

        if (csvRows.length === 0) {
            setCsvError("No data rows to import. Please upload a CSV file first.");
            return;
        }

        const valError = validateCsvRows();
        if (valError) {
            setCsvError(valError);
            return;
        }

        setIsCsvImporting(true);
        try {
            const formattedRows = csvRows.map(row => ({
                partnerName: row.partnerName.trim(),
                partnerEmail: row.partnerEmail.trim(),
                partnerPhone: row.partnerPhone?.trim() || "",
                partnerPassword: row.partnerPassword,
                hotelName: row.hotelName.trim(),
                hotelAddress: row.hotelAddress.trim(),
                city: row.city?.trim() || "New Delhi",
                price: parseFloat(row.price) || 1200,
                stars: parseInt(row.stars) || 3,
                amenities: row.amenities
            }));

            const res = await adminApi.createBulkPartnersWithHotels({ rows: formattedRows });

            if (res.success && Array.isArray(res.results)) {
                setCsvResultsLog(res.results);
                const total = res.results.length;
                const successCount = res.results.filter((r: any) => r.success).length;
                
                if (successCount === total) {
                    setCsvSuccess(`Successfully provisioned all ${successCount} partners and hotels!`);
                    setCsvRows([]);
                    setCsvFile(null);
                } else if (successCount > 0) {
                    setCsvSuccess(`Import partially completed. Created ${successCount} of ${total} entries. Please check the status log below for details.`);
                } else {
                    setCsvError("Failed to import. All entries encountered errors. See log details below.");
                }

                const refreshed = await adminApi.getPartners();
                setPartners(refreshed.data || []);
            } else {
                setCsvError(res.message || "Failed to process bulk import.");
            }
        } catch (err: any) {
            setCsvError(err.message || "An unexpected error occurred during import.");
        } finally {
            setIsCsvImporting(false);
        }
    };

    // Single Partner Registration States
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [isCreatingPartner, setIsCreatingPartner] = useState(false);
    const [registerError, setRegisterError] = useState("");
    const [registerSuccess, setRegisterSuccess] = useState("");

    // Create Single Property States
    const [propOwnerId, setPropOwnerId] = useState<string>("");
    const [propName, setPropName] = useState("");
    const [propCity, setPropCity] = useState("");
    const [propAddress, setPropAddress] = useState("");
    const [propPrice, setPropPrice] = useState("");
    const [propStars, setPropStars] = useState("3");
    const [propAmenities, setPropAmenities] = useState("");
    const [isCreatingProp, setIsCreatingProp] = useState(false);
    const [propError, setPropError] = useState("");
    const [propSuccess, setPropSuccess] = useState("");

    // Bulk Hotels States
    const [bulkOwnerId, setBulkOwnerId] = useState<string>("");
    const [bulkHotels, setBulkHotels] = useState<Array<{
        name: string;
        city: string;
        address: string;
        pricePerNight: string;
        starRating: string;
        amenitiesString: string;
    }>>([{ name: "", city: "", address: "", pricePerNight: "", starRating: "3", amenitiesString: "" }]);
    const [isBulkCreating, setIsBulkCreating] = useState(false);
    const [bulkError, setBulkError] = useState("");
    const [bulkSuccess, setBulkSuccess] = useState("");

    // Multi-Partner Studio States
    const [studioStep, setStudioStep] = useState<1 | 2 | 3>(1);
    const [studioSelectedIds, setStudioSelectedIds] = useState<number[]>([]);
    const [studioPartnerHotels, setStudioPartnerHotels] = useState<Record<number, Array<{
        name: string;
        city: string;
        address: string;
        pricePerNight: string;
        starRating: string;
        amenitiesString: string;
    }>>>({});
    const [expandedPartnerIds, setExpandedPartnerIds] = useState<number[]>([]);
    const [studioSearch, setStudioSearch] = useState("");
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [provisionResults, setProvisionResults] = useState<Array<{
        partnerName: string;
        success: boolean;
        count?: number;
        hotelNames?: string[];
        message?: string;
    }>>([]);
    const [studioError, setStudioError] = useState("");

    const toggleSelectPartner = (id: number) => {
        setStudioSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(x => x !== id);
            } else {
                return [...prev, id];
            }
        });
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
            setStudioError("Please select at least one partner.");
            return;
        }
        setStudioError("");
        
        // Initialize partnerHotels mapping
        setStudioPartnerHotels(prev => {
            const updated = { ...prev };
            studioSelectedIds.forEach(id => {
                if (!updated[id] || updated[id].length === 0) {
                    updated[id] = [{ name: "", city: "", address: "", pricePerNight: "", starRating: "3", amenitiesString: "" }];
                }
            });
            // Remove non-selected partners to keep state clean
            Object.keys(updated).forEach(k => {
                const id = parseInt(k);
                if (!studioSelectedIds.includes(id)) {
                    delete updated[id];
                }
            });
            return updated;
        });
        setExpandedPartnerIds(studioSelectedIds);
        setStudioStep(2);
    };

    const addStudioHotelRow = (partnerId: number) => {
        const partner = partners.find(p => p.id === partnerId);
        const currentCount = partner?.hotel?.length || 0;
        const draftingCount = studioPartnerHotels[partnerId]?.length || 0;
        if (currentCount + draftingCount >= 50) {
            alert(`Capacity limit reached. This partner cannot have more than 50 properties in total (existing: ${currentCount}, drafting: ${draftingCount}).`);
            return;
        }
        setStudioPartnerHotels(prev => ({
            ...prev,
            [partnerId]: [...(prev[partnerId] || []), { name: "", city: "", address: "", pricePerNight: "", starRating: "3", amenitiesString: "" }]
        }));
    };

    const removeStudioHotelRow = (partnerId: number, index: number) => {
        setStudioPartnerHotels(prev => {
            const rows = prev[partnerId] || [];
            if (rows.length === 1) return prev; // Keep at least one row
            return {
                ...prev,
                [partnerId]: rows.filter((_, i) => i !== index)
            };
        });
    };

    const handleStudioRowChange = (partnerId: number, index: number, field: string, value: string) => {
        setStudioPartnerHotels(prev => {
            const rows = [...(prev[partnerId] || [])];
            rows[index] = { ...rows[index], [field]: value };
            return {
                ...prev,
                [partnerId]: rows
            };
        });
    };

    const togglePartnerCardExpand = (id: number) => {
        setExpandedPartnerIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const proceedToStep3 = () => {
        setStudioError("");
        for (const partnerId of studioSelectedIds) {
            const hotels = studioPartnerHotels[partnerId] || [];
            if (hotels.length === 0) {
                setStudioError("Please add at least one hotel for each selected partner.");
                return;
            }
            const partnerName = partners.find(p => p.id === partnerId)?.name || `Partner #${partnerId}`;
            for (let i = 0; i < hotels.length; i++) {
                const h = hotels[i];
                if (!h.name.trim() || !h.city.trim() || !h.address.trim()) {
                    setStudioError(`Hotel #${i + 1} under "${partnerName}" is missing required fields (Name, City, or Address).`);
                    return;
                }
            }
        }
        setStudioStep(3);
    };

    const handleStudioProvision = async () => {
        setIsProvisioning(true);
        setStudioError("");
        setProvisionResults([]);
        
        const results: Array<{
            partnerName: string;
            success: boolean;
            count?: number;
            hotelNames?: string[];
            message?: string;
        }> = [];

        for (const partnerId of studioSelectedIds) {
            const hotels = studioPartnerHotels[partnerId] || [];
            if (hotels.length === 0) continue;
            
            const partner = partners.find(p => p.id === partnerId);
            const partnerName = partner?.name || `Partner #${partnerId}`;
            
            try {
                const formattedHotels = hotels.map(h => ({
                    name: h.name.trim(),
                    city: h.city.trim(),
                    address: h.address.trim(),
                    pricePerNight: parseFloat(h.pricePerNight) || 1200,
                    starRating: parseInt(h.starRating) || 3,
                    amenities: h.amenitiesString.split(",").map(s => s.trim()).filter(Boolean)
                }));
                
                const res = await adminApi.createBulkHotels({
                    ownerId: partnerId,
                    hotels: formattedHotels
                });
                
                if (res.success) {
                    results.push({
                        partnerName,
                        success: true,
                        count: res.count || formattedHotels.length,
                        hotelNames: formattedHotels.map(h => h.name)
                    });
                } else {
                    results.push({
                        partnerName,
                        success: false,
                        message: res.message || "Failed to create hotels for this partner."
                    });
                }
            } catch (err: any) {
                results.push({
                    partnerName,
                    success: false,
                    message: err.message || "An unexpected error occurred."
                });
            }
        }
        
        setProvisionResults(results);
        
        // Refresh parent partners list
        try {
            const refreshed = await adminApi.getPartners();
            setPartners(refreshed.data || []);
        } catch (err) {
            console.error("Failed to refresh partners", err);
        }
        setIsProvisioning(false);
    };

    const resetStudio = () => {
        setStudioSelectedIds([]);
        setStudioPartnerHotels({});
        setStudioSearch("");
        setProvisionResults([]);
        setStudioError("");
        setStudioStep(1);
    };


    // ─── Single Partner Register Submit ──────────────────────────────────────
    const handleRegisterPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegisterError("");
        setRegisterSuccess("");

        if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
            setRegisterError("All fields are required.");
            return;
        }

        setIsCreatingPartner(true);
        try {
            const res = await adminApi.createQuickPartner({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: password,
                phone: phone.trim()
            });

            if (res.success) {
                setRegisterSuccess(`Partner ${name} registered successfully!`);
                setName("");
                setEmail("");
                setPassword("");
                setPhone("");
                
                // Refresh parent partners list
                const refreshed = await adminApi.getPartners();
                setPartners(refreshed.data || []);
            } else {
                setRegisterError(res.message || "Failed to create partner login.");
            }
        } catch (err: any) {
            setRegisterError(err.message || "An unexpected error occurred.");
        } finally {
            setIsCreatingPartner(false);
        }
    };

    // ─── Create Single Property Submit ───────────────────────────────────────
    const handleCreateSingleProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        setPropError("");
        setPropSuccess("");

        if (!propOwnerId) {
            setPropError("Please select an owner (partner) first.");
            return;
        }

        if (!propName.trim() || !propCity.trim() || !propAddress.trim()) {
            setPropError("Property Name, City, and Address are required.");
            return;
        }

        const partner = partners.find(p => p.id === parseInt(propOwnerId));
        const currentCount = partner?.hotel?.length || 0;
        if (currentCount >= 50) {
            setPropError("This partner has already reached the maximum limit of 50 properties.");
            return;
        }

        setIsCreatingProp(true);
        try {
            const res = await adminApi.createBulkHotels({
                ownerId: parseInt(propOwnerId),
                hotels: [{
                    name: propName.trim(),
                    city: propCity.trim(),
                    address: propAddress.trim(),
                    pricePerNight: parseFloat(propPrice) || 1200,
                    starRating: parseInt(propStars) || 3,
                    amenities: propAmenities.split(",").map(s => s.trim()).filter(Boolean)
                }]
            });

            if (res.success) {
                setPropSuccess(`Property "${propName}" successfully created under partner!`);
                setPropName("");
                setPropCity("");
                setPropAddress("");
                setPropPrice("");
                setPropStars("3");
                setPropAmenities("");
                
                // Refresh parent partners list
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

    // ─── Bulk Hotel Row Management ──────────────────────────────────────────
    const addBulkRow = () => {
        if (bulkHotels.length >= 50) {
            alert("Limit reached: You can create up to 50 hotels in bulk per transaction.");
            return;
        }
        setBulkHotels([...bulkHotels, { name: "", city: "", address: "", pricePerNight: "", starRating: "3", amenitiesString: "" }]);
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

        // Validate
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
                
                // Refresh parent partners list
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

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-slate-900 text-white p-8 border border-slate-800 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-y-12 translate-x-12 opacity-10 select-none pointer-events-none">
                    <Users className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10 space-y-2">
                    <h2 className="text-xl font-black uppercase tracking-wider">Partner & Asset Provisioning</h2>
                    <p className="text-xs text-slate-400 font-medium max-w-xl leading-relaxed">
                        Configure partner credentials, dynamically associate hotel inventory ownership, and provision mock draft categories in bulk.
                    </p>
                </div>
            </div>

            {/* Sub Tabs switcher */}
            <div className="flex border-b border-slate-200 gap-1 select-none shrink-0 bg-white p-2 shadow-sm rounded-sm overflow-x-auto">
                <button
                    onClick={() => setSubTab("register")}
                    className={cn(
                        "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center gap-2 cursor-pointer whitespace-nowrap",
                        subTab === "register" 
                            ? "bg-slate-900 text-white shadow-md" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                >
                    <Plus className="w-3.5 h-3.5" /> Single Partner
                </button>
                <button
                    onClick={() => setSubTab("createProperty")}
                    className={cn(
                        "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center gap-2 cursor-pointer whitespace-nowrap",
                        subTab === "createProperty" 
                            ? "bg-slate-900 text-white shadow-md" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                >
                    <Plus className="w-3.5 h-3.5" /> Create Property
                </button>
                <button
                    onClick={() => setSubTab("bulk")}
                    className={cn(
                        "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center gap-2 cursor-pointer whitespace-nowrap",
                        subTab === "bulk" 
                            ? "bg-slate-900 text-white shadow-md" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                >
                    <Hotel className="w-3.5 h-3.5" /> Bulk Hotel Setup
                </button>
                <button
                    onClick={() => setSubTab("studio")}
                    className={cn(
                        "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center gap-2 cursor-pointer whitespace-nowrap",
                        subTab === "studio" 
                            ? "bg-slate-900 text-white shadow-md" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Multi-Partner Studio
                </button>
                <button
                    onClick={() => setSubTab("csvImport")}
                    className={cn(
                        "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center gap-2 cursor-pointer whitespace-nowrap",
                        subTab === "csvImport" 
                            ? "bg-slate-900 text-white shadow-md" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                >
                    <Upload className="w-3.5 h-3.5" /> Setup Using CSV
                </button>
            </div>

            {/* ─── REGISTER SINGLE PARTNER ────────────────────────────────────────── */}
            {subTab === "register" && (
                <div className="bg-white border border-slate-200 shadow-sm rounded-sm p-6 max-w-lg">
                    <div className="pb-4 border-b border-slate-100 mb-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Register Single Partner Account</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Create login credentials for a new hotel owner</p>
                    </div>

                    <form onSubmit={handleRegisterPartner} className="space-y-4">
                        {registerError && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs font-medium rounded-sm animate-in fade-in">
                                {registerError}
                            </div>
                        )}
                        {registerSuccess && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium rounded-sm animate-in fade-in flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                {registerSuccess}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Owner's full name..."
                                disabled={isCreatingPartner}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-bold transition-all disabled:opacity-55"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Owner's login email..."
                                disabled={isCreatingPartner}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-450 focus:bg-white text-xs font-bold transition-all disabled:opacity-55"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="Contact phone number..."
                                disabled={isCreatingPartner}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-bold transition-all disabled:opacity-55"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Account password..."
                                    disabled={isCreatingPartner}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-bold transition-all disabled:opacity-55"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 cursor-pointer"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isCreatingPartner}
                            className="w-full py-3.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isCreatingPartner ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" /> Create Partner Account
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* ─── CREATE SINGLE PROPERTY PANEL ───────────────────────────────────── */}
            {subTab === "createProperty" && (
                <div className="bg-white border border-slate-200 shadow-sm rounded-sm p-6 flex flex-col md:flex-row gap-8">
                    {/* Left Panel - Partner Info & Status */}
                    <div className="w-full md:w-[40%] space-y-4 shrink-0">
                        <div className="pb-4 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Single Hotel Setup</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Add a new property under a specific partner user</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Partner (Owner)</label>
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
                            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-sm space-y-2">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5" /> Selected Partner Stats
                                </h4>
                                <p className="text-xs font-bold text-slate-800">
                                    Currently Owning: <span className="text-brand-600">{partners.find(p => p.id === parseInt(propOwnerId))?.hotel?.length || 0} / 50 properties</span>
                                </p>
                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1">
                                    <div 
                                        className={cn(
                                            "h-full rounded-full transition-all duration-300", 
                                            (partners.find(p => p.id === parseInt(propOwnerId))?.hotel?.length || 0) >= 50 ? "bg-red-500" : "bg-brand-500"
                                        )}
                                        style={{ width: `${Math.min(100, ((partners.find(p => p.id === parseInt(propOwnerId))?.hotel?.length || 0) / 50) * 100)}%` }} 
                                    />
                                </div>
                                <p className="text-[10px] text-slate-550 font-medium leading-relaxed pt-1">
                                    Properties are registered with active draft status. A default "Standard Room" and wallet balance tracking will be setup automatically.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Create Property Form */}
                    <div className="flex-1 space-y-4">
                        <form onSubmit={handleCreateSingleProperty} className="space-y-4">
                            {propError && (
                                <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs font-medium rounded-sm animate-in fade-in">
                                    {propError}
                                </div>
                            )}
                            {propSuccess && (
                                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium rounded-sm animate-in fade-in flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    {propSuccess}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hotel Name *</label>
                                    <input
                                        type="text"
                                        value={propName}
                                        onChange={e => setPropName(e.target.value)}
                                        placeholder="Grand Luxury Inn..."
                                        disabled={isCreatingProp || !propOwnerId}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-bold transition-all disabled:opacity-55"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City *</label>
                                    <input
                                        type="text"
                                        value={propCity}
                                        onChange={e => setPropCity(e.target.value)}
                                        placeholder="New Delhi..."
                                        disabled={isCreatingProp || !propOwnerId}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-bold transition-all disabled:opacity-55"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Address *</label>
                                <input
                                    type="text"
                                    value={propAddress}
                                    onChange={e => setPropAddress(e.target.value)}
                                    placeholder="Plot No. 12, Sector-4, Dwarka..."
                                    disabled={isCreatingProp || !propOwnerId}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-bold transition-all disabled:opacity-55"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Base Price (₹ per night)</label>
                                    <input
                                        type="number"
                                        value={propPrice}
                                        onChange={e => setPropPrice(e.target.value)}
                                        placeholder="1200"
                                        disabled={isCreatingProp || !propOwnerId}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-bold transition-all disabled:opacity-55"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Star Rating</label>
                                    <select
                                        value={propStars}
                                        onChange={e => setPropStars(e.target.value)}
                                        disabled={isCreatingProp || !propOwnerId}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 text-xs font-bold transition-all disabled:opacity-55"
                                    >
                                        <option value="1">1 Star</option>
                                        <option value="2">2 Star</option>
                                        <option value="3">3 Star</option>
                                        <option value="4">4 Star</option>
                                        <option value="5">5 Star</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amenities (comma-separated)</label>
                                <input
                                    type="text"
                                    value={propAmenities}
                                    onChange={e => setPropAmenities(e.target.value)}
                                    placeholder="Free Wifi, AC, Swimming Pool, Parking..."
                                    disabled={isCreatingProp || !propOwnerId}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-bold transition-all disabled:opacity-55"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isCreatingProp || !propOwnerId}
                                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                            >
                                {isCreatingProp ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Provisioning...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" /> Create Property Under Partner
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── BULK HOTEL SETUP ────────────────────────────────────────────────── */}
            {subTab === "bulk" && (
                <div className="bg-white border border-slate-200 shadow-sm rounded-sm p-6 space-y-6">
                    <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Bulk Hotel Batch setup</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Batch import draft properties with default room types</p>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Ownership to</label>
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
                            <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs font-medium rounded-sm animate-in fade-in">
                                {bulkError}
                            </div>
                        )}
                        {bulkSuccess && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium rounded-sm animate-in fade-in flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                {bulkSuccess}
                            </div>
                        )}

                        {/* Batch items table */}
                        <div className="overflow-x-auto border border-slate-200 rounded-sm">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-450 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-4 py-3 w-[8px]">#</th>
                                        <th className="px-4 py-3">Hotel Name *</th>
                                        <th className="px-4 py-3 w-[150px]">City *</th>
                                        <th className="px-4 py-3">Address *</th>
                                        <th className="px-4 py-3 w-[110px]">Price (₹)</th>
                                        <th className="px-4 py-3 w-[80px]">Stars</th>
                                        <th className="px-4 py-3">Amenities (Comma separated)</th>
                                        <th className="px-4 py-3 w-[50px] text-center">Delete</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-150">
                                    {bulkHotels.map((hotel, index) => (
                                        <tr key={index} className="hover:bg-slate-50/40">
                                            <td className="px-4 py-3 text-[10px] font-bold text-slate-400 text-center">{index + 1}</td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    value={hotel.name}
                                                    onChange={e => handleBulkRowChange(index, "name", e.target.value)}
                                                    placeholder="Hotel Name"
                                                    disabled={isBulkCreating}
                                                    className="w-full px-2 py-1.5 bg-slate-50 border border-transparent focus:border-slate-350 focus:bg-white outline-none text-xs font-bold transition-all disabled:opacity-50"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    value={hotel.city}
                                                    onChange={e => handleBulkRowChange(index, "city", e.target.value)}
                                                    placeholder="City"
                                                    disabled={isBulkCreating}
                                                    className="w-full px-2 py-1.5 bg-slate-50 border border-transparent focus:border-slate-350 focus:bg-white outline-none text-xs font-bold transition-all disabled:opacity-50"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    value={hotel.address}
                                                    onChange={e => handleBulkRowChange(index, "address", e.target.value)}
                                                    placeholder="Full Address"
                                                    disabled={isBulkCreating}
                                                    className="w-full px-2 py-1.5 bg-slate-50 border border-transparent focus:border-slate-350 focus:bg-white outline-none text-xs font-bold transition-all disabled:opacity-50"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="number"
                                                    value={hotel.pricePerNight}
                                                    onChange={e => handleBulkRowChange(index, "pricePerNight", e.target.value)}
                                                    placeholder="1200"
                                                    disabled={isBulkCreating}
                                                    className="w-full px-2 py-1.5 bg-slate-50 border border-transparent focus:border-slate-350 focus:bg-white outline-none text-xs font-bold transition-all disabled:opacity-50"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <select
                                                    value={hotel.starRating}
                                                    onChange={e => handleBulkRowChange(index, "starRating", e.target.value)}
                                                    disabled={isBulkCreating}
                                                    className="w-full px-1 py-1.5 bg-slate-50 border border-transparent focus:border-slate-350 focus:bg-white outline-none text-xs font-bold transition-all disabled:opacity-50"
                                                >
                                                    <option value="1">1 ★</option>
                                                    <option value="2">2 ★</option>
                                                    <option value="3">3 ★</option>
                                                    <option value="4">4 ★</option>
                                                    <option value="5">5 ★</option>
                                                </select>
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    value={hotel.amenitiesString}
                                                    onChange={e => handleBulkRowChange(index, "amenitiesString", e.target.value)}
                                                    placeholder="Wifi, AC, Pool, Parking..."
                                                    disabled={isBulkCreating}
                                                    className="w-full px-2 py-1.5 bg-slate-50 border border-transparent focus:border-slate-350 focus:bg-white outline-none text-xs font-bold transition-all disabled:opacity-50"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeBulkRow(index)}
                                                    disabled={isBulkCreating || bulkHotels.length === 1}
                                                    className="text-red-500 hover:text-red-700 disabled:opacity-30 cursor-pointer"
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
                                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-650 hover:text-brand-700 disabled:opacity-50 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> Add Property Row
                            </button>

                            <button
                                type="submit"
                                disabled={isBulkCreating || !bulkOwnerId || bulkHotels.every(h => !h.name.trim())}
                                className="px-8 py-3.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                            >
                                {isBulkCreating ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Batch Processing...
                                    </>
                                ) : (
                                    <>
                                        <Hotel className="w-3.5 h-3.5" /> Bulk Register {bulkHotels.length} Hotels
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ─── MULTI-PARTNER STUDIO ────────────────────────────────────────────── */}
            {subTab === "studio" && (
                <div className="bg-white border border-slate-200 shadow-sm rounded-sm p-6 space-y-6">
                    {/* Step Progress Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Zap className="w-4 h-4 text-brand-600 animate-pulse" /> Multi-Partner Studio
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                Provision custom inventories across multiple partner accounts simultaneously
                            </p>
                        </div>
                        
                        {/* Steps Indicator */}
                        <div className="flex items-center gap-2 select-none">
                            <span className={cn(
                                "px-3 py-1 text-[9px] font-black tracking-widest rounded-full uppercase transition-all",
                                studioStep === 1 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                            )}>
                                1. Select
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className={cn(
                                "px-3 py-1 text-[9px] font-black tracking-widest rounded-full uppercase transition-all",
                                studioStep === 2 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                            )}>
                                2. Configure
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className={cn(
                                "px-3 py-1 text-[9px] font-black tracking-widest rounded-full uppercase transition-all",
                                studioStep === 3 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                            )}>
                                3. Provision
                            </span>
                        </div>
                    </div>

                    {studioError && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs font-medium rounded-sm animate-in fade-in flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-650 shrink-0" />
                            <span>{studioError}</span>
                        </div>
                    )}

                    {/* STEP 1: SELECT PARTNERS */}
                    {studioStep === 1 && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                {/* Search input */}
                                <div className="relative w-full sm:w-80">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Search className="w-3.5 h-3.5" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search partner by name or email..."
                                        value={studioSearch}
                                        onChange={e => setStudioSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-bold transition-all"
                                    />
                                </div>

                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 bg-slate-50 px-3 py-1.5 rounded-sm border border-slate-150">
                                    Selected Partners: <span className="text-brand-650 font-black">{studioSelectedIds.length}</span>
                                </div>
                            </div>

                            {/* Partners Checklist */}
                            <div className="border border-slate-200 rounded-sm overflow-hidden">
                                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-[10px] font-black text-slate-450 uppercase tracking-widest">
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
                                            className="w-3.5 h-3.5 rounded-sm border-slate-300 focus:ring-slate-450 cursor-pointer accent-slate-900"
                                        />
                                        <span>Select All Shown</span>
                                    </div>
                                    <div>Properties owned</div>
                                </div>

                                <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-150">
                                    {partners.filter(p => 
                                        !studioSearch.trim() ||
                                        p.name?.toLowerCase().includes(studioSearch.toLowerCase()) ||
                                        p.email?.toLowerCase().includes(studioSearch.toLowerCase())
                                    ).length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
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
                                                        isSelected ? "bg-slate-50/70 text-brand-650" : "hover:bg-slate-50/40 text-slate-700"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {}} // click handled by parent div
                                                            className="w-3.5 h-3.5 rounded-sm border-slate-300 focus:ring-slate-450 cursor-pointer accent-slate-900"
                                                        />
                                                        <div>
                                                            <div className="font-bold">{p.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-medium">{p.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm border",
                                                        hotelCount >= 50 
                                                            ? "bg-red-50 text-red-700 border-red-100" 
                                                            : "bg-slate-100 text-slate-650 border-slate-200"
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
                                    className="px-6 py-3 bg-slate-900 hover:bg-black disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
                                        <div key={partnerId} className="border border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm transition-all">
                                            {/* Card Header */}
                                            <div 
                                                onClick={() => togglePartnerCardExpand(partnerId)}
                                                className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                                                    )}
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{partner.name}</h4>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{partner.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm border shrink-0",
                                                        totalCountAfter > 50 
                                                            ? "bg-red-50 text-red-700 border-red-100"
                                                            : "bg-slate-100 text-slate-650 border-slate-200"
                                                    )}>
                                                        Inventory: {currentCount} owned + {hotels.length} drafted = {totalCountAfter} / 50
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            {isExpanded && (
                                                <div className="p-5 space-y-4 bg-slate-50/20">
                                                    <div className="divide-y divide-slate-150/80 border border-slate-200 rounded-sm bg-white overflow-hidden shadow-sm">
                                                        {hotels.map((hotel, index) => (
                                                            <div key={index} className="p-4 space-y-3.5 hover:bg-slate-50/30">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                                        Hotel #{index + 1} definition
                                                                    </span>
                                                                    {hotels.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeStudioHotelRow(partnerId, index)}
                                                                            className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Hotel Name *</label>
                                                                        <input
                                                                            type="text"
                                                                            value={hotel.name}
                                                                            onChange={e => handleStudioRowChange(partnerId, index, "name", e.target.value)}
                                                                            placeholder="Grand Palace Resort..."
                                                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-bold transition-all"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest">City *</label>
                                                                        <input
                                                                            type="text"
                                                                            value={hotel.city}
                                                                            onChange={e => handleStudioRowChange(partnerId, index, "city", e.target.value)}
                                                                            placeholder="Mumbai..."
                                                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-bold transition-all"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Full Address *</label>
                                                                        <input
                                                                            type="text"
                                                                            value={hotel.address}
                                                                            onChange={e => handleStudioRowChange(partnerId, index, "address", e.target.value)}
                                                                            placeholder="Near Airport Road, Andheri..."
                                                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-bold transition-all"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Base Price (₹ / night)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={hotel.pricePerNight}
                                                                            onChange={e => handleStudioRowChange(partnerId, index, "pricePerNight", e.target.value)}
                                                                            placeholder="1200"
                                                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-bold transition-all"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Star Rating</label>
                                                                        <select
                                                                            value={hotel.starRating}
                                                                            onChange={e => handleStudioRowChange(partnerId, index, "starRating", e.target.value)}
                                                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 text-xs font-bold transition-all"
                                                                        >
                                                                            <option value="1">1 Star</option>
                                                                            <option value="2">2 Star</option>
                                                                            <option value="3">3 Star</option>
                                                                            <option value="4">4 Star</option>
                                                                            <option value="5">5 Star</option>
                                                                        </select>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Amenities (comma-separated)</label>
                                                                        <input
                                                                            type="text"
                                                                            value={hotel.amenitiesString}
                                                                            onChange={e => handleStudioRowChange(partnerId, index, "amenitiesString", e.target.value)}
                                                                            placeholder="Free Wifi, AC, Gym..."
                                                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-bold transition-all"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => addStudioHotelRow(partnerId)}
                                                        className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-brand-650 hover:text-brand-700 cursor-pointer pt-1"
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
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setStudioStep(1)}
                                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 cursor-pointer"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Select Partners
                                </button>

                                <button
                                    type="button"
                                    onClick={proceedToStep3}
                                    className="px-6 py-3 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
                                /* REVIEW AND SUBMIT BEFORE PROVISIONING */
                                <div className="space-y-5">
                                    <div className="bg-slate-50 border border-slate-200 rounded-sm p-5 space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Provisioning Specification Summary
                                        </h4>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-200 text-[10px] font-black text-slate-450 uppercase tracking-widest">
                                                        <th className="py-2.5">Partner</th>
                                                        <th className="py-2.5">Hotels Drafted</th>
                                                        <th className="py-2.5 text-right">Properties Count</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {studioSelectedIds.map(partnerId => {
                                                        const partner = partners.find(p => p.id === partnerId);
                                                        const hotels = studioPartnerHotels[partnerId] || [];
                                                        return (
                                                            <tr key={partnerId} className="font-bold text-slate-700">
                                                                <td className="py-3 pr-4">
                                                                    <div>{partner?.name}</div>
                                                                    <div className="text-[10px] text-slate-400 font-medium">{partner?.email}</div>
                                                                </td>
                                                                <td className="py-3">
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {hotels.map((h, i) => (
                                                                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-650 text-[10px] font-bold rounded-sm border border-slate-200">
                                                                                {h.name || "(Unnamed)"} ({h.city})
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 text-right text-brand-650 font-black">
                                                                    {hotels.length}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="font-black text-slate-800 border-t-2 border-slate-200 text-[10px] uppercase tracking-widest bg-slate-50/50">
                                                        <td className="py-3 pl-2" colSpan={2}>Total Provision Scope</td>
                                                        <td className="py-3 pr-2 text-right text-brand-650 text-xs font-black">
                                                            {studioSelectedIds.length} Partners / {Object.values(studioPartnerHotels).reduce((acc, h) => acc + h.length, 0)} Hotels
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <button
                                            type="button"
                                            disabled={isProvisioning}
                                            onClick={() => setStudioStep(2)}
                                            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Edit
                                        </button>

                                        <button
                                            type="button"
                                            disabled={isProvisioning}
                                            onClick={handleStudioProvision}
                                            className="px-6 py-3.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-w-48"
                                        >
                                            {isProvisioning ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Provisioning Inventory...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-450" /> Provision All Drafts
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* PROVISION RESULTS DISPLAY */
                                <div className="space-y-5">
                                    <div className="bg-slate-50 border border-slate-200 rounded-sm p-6 space-y-5">
                                        <div className="pb-3 border-b border-slate-200 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                                                Provisioning Session Complete
                                            </h4>
                                        </div>

                                        <div className="space-y-4">
                                            {provisionResults.map((res, i) => (
                                                <div 
                                                    key={i} 
                                                    className={cn(
                                                        "p-4 rounded-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs",
                                                        res.success 
                                                            ? "bg-emerald-50/40 border-emerald-100 text-emerald-900" 
                                                            : "bg-red-50/40 border-red-100 text-red-900"
                                                    )}
                                                >
                                                    <div>
                                                        <div className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                            {res.success ? (
                                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                                            ) : (
                                                                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                                            )}
                                                            {res.partnerName}
                                                        </div>
                                                        {res.success ? (
                                                            <div className="text-[10px] text-emerald-700 font-medium mt-1">
                                                                Successfully provisioned hotels:{" "}
                                                                <span className="font-bold">{res.hotelNames?.join(", ") || "(None)"}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-[10px] text-red-700 font-medium mt-1">
                                                                Error: {res.message}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm border shrink-0 sm:text-right",
                                                        res.success 
                                                            ? "bg-emerald-100/60 border-emerald-200 text-emerald-800" 
                                                            : "bg-red-100/60 border-red-200 text-red-800"
                                                    )}>
                                                        {res.success ? `+${res.count} Hotels` : "Failed"}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={resetStudio}
                                            className="px-6 py-3 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
                        <div className="bg-white border border-slate-200 shadow-sm rounded-sm p-6 space-y-6">
                            <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                        <Upload className="w-4 h-4 text-slate-800" /> Setup Using CSV
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                        Register new partners and their properties in bulk using a CSV file (Max 10 records)
                                    </p>
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={downloadCsvTemplate}
                                    className="px-4 py-2 border border-slate-250 hover:border-slate-400 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 cursor-pointer bg-slate-50 shadow-sm"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download CSV Template
                                </button>
                            </div>

                            {/* Dropzone / Upload area */}
                            <div className="border-2 border-dashed border-slate-200 hover:border-slate-350 bg-slate-50/50 rounded-sm p-8 text-center transition-colors relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="space-y-2 pointer-events-none">
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                                    <p className="text-xs font-bold text-slate-700">
                                        {csvFile ? `Selected: ${csvFile.name}` : "Click or drag your CSV file here to upload"}
                                    </p>
                                    <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider">
                                        CSV columns must match or map to: Partner Name, Email, Phone, Password, Hotel Name, Address, City, Price, Stars, Amenities
                                    </p>
                                </div>
                            </div>

                            {csvError && (
                                <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs font-medium rounded-sm animate-in fade-in">
                                    {csvError}
                                </div>
                            )}

                            {csvSuccess && (
                                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium rounded-sm animate-in fade-in flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    {csvSuccess}
                                </div>
                            )}

                            {/* Rows Preview Table */}
                            {csvRows.length > 0 && (
                                <form onSubmit={handleCsvImportSubmit} className="space-y-6">
                                    <div className="overflow-x-auto border border-slate-200 rounded-sm shadow-sm bg-white">
                                        <table className="w-full text-left border-collapse min-w-[1200px]">
                                            <thead className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-450 uppercase tracking-widest">
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
                                            <tbody className="divide-y divide-slate-150">
                                                {csvRows.map((row, index) => (
                                                    <tr key={row.id} className="hover:bg-slate-50/40 text-xs">
                                                        <td className="px-3 py-3 font-bold text-slate-400 text-center">{index + 1}</td>
                                                        
                                                        {/* Partner fields */}
                                                        <td className="px-1 py-1.5">
                                                            <input
                                                                type="text"
                                                                value={row.partnerName}
                                                                onChange={e => handleCsvRowChange(index, "partnerName", e.target.value)}
                                                                disabled={isCsvImporting}
                                                                className={cn(
                                                                    "w-full px-2 py-1.5 bg-slate-50 border border-transparent rounded-sm outline-none focus:border-slate-350 focus:bg-white text-xs font-bold transition-all",
                                                                    !row.partnerName?.trim() && "border-red-300 bg-red-50/20"
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
                                                                    "w-full px-2 py-1.5 bg-slate-50 border border-transparent rounded-sm outline-none focus:border-slate-350 focus:bg-white text-xs font-bold transition-all",
                                                                    (!row.partnerEmail?.trim() || !row.partnerEmail.includes("@")) && "border-red-300 bg-red-50/20"
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-1 py-1.5">
                                                            <input
                                                                type="text"
                                                                value={row.partnerPhone}
                                                                onChange={e => handleCsvRowChange(index, "partnerPhone", e.target.value)}
                                                                disabled={isCsvImporting}
                                                                className="w-full px-2 py-1.5 bg-slate-50 border border-transparent rounded-sm outline-none focus:border-slate-350 focus:bg-white text-xs font-bold transition-all"
                                                            />
                                                        </td>
                                                        <td className="px-1 py-1.5">
                                                            <input
                                                                type="text"
                                                                value={row.partnerPassword}
                                                                onChange={e => handleCsvRowChange(index, "partnerPassword", e.target.value)}
                                                                disabled={isCsvImporting}
                                                                className={cn(
                                                                    "w-full px-2 py-1.5 bg-slate-50 border border-transparent rounded-sm outline-none focus:border-slate-350 focus:bg-white text-xs font-bold transition-all",
                                                                    (!row.partnerPassword?.trim() || row.partnerPassword.length < 6) && "border-red-300 bg-red-50/20"
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
                                                                    "w-full px-2 py-1.5 bg-slate-50 border border-transparent rounded-sm outline-none focus:border-slate-350 focus:bg-white text-xs font-bold transition-all",
                                                                    !row.hotelName?.trim() && "border-red-300 bg-red-50/20"
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
                                                                    "w-full px-2 py-1.5 bg-slate-50 border border-transparent rounded-sm outline-none focus:border-slate-350 focus:bg-white text-xs font-bold transition-all",
                                                                    !row.hotelAddress?.trim() && "border-red-300 bg-red-50/20"
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-1 py-1.5">
                                                            <input
                                                                type="text"
                                                                value={row.city}
                                                                onChange={e => handleCsvRowChange(index, "city", e.target.value)}
                                                                disabled={isCsvImporting}
                                                                className="w-full px-2 py-1.5 bg-slate-50 border border-transparent rounded-sm outline-none focus:border-slate-350 focus:bg-white text-xs font-bold transition-all"
                                                            />
                                                        </td>
                                                        <td className="px-1 py-1.5">
                                                            <input
                                                                type="number"
                                                                value={row.price}
                                                                onChange={e => handleCsvRowChange(index, "price", e.target.value)}
                                                                disabled={isCsvImporting}
                                                                className="w-full px-2 py-1.5 bg-slate-50 border border-transparent rounded-sm outline-none focus:border-slate-350 focus:bg-white text-xs font-bold transition-all"
                                                            />
                                                        </td>
                                                        <td className="px-1 py-1.5">
                                                            <select
                                                                value={row.stars}
                                                                onChange={e => handleCsvRowChange(index, "stars", e.target.value)}
                                                                disabled={isCsvImporting}
                                                                className="w-full px-1 py-1.5 bg-slate-50 border border-transparent rounded-sm outline-none focus:border-slate-350 focus:bg-white text-xs font-bold transition-all"
                                                            >
                                                                <option value="1">1 ★</option>
                                                                <option value="2">2 ★</option>
                                                                <option value="3">3 ★</option>
                                                                <option value="4">4 ★</option>
                                                                <option value="5">5 ★</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-1 py-1.5">
                                                            <input
                                                                type="text"
                                                                value={row.amenities}
                                                                onChange={e => handleCsvRowChange(index, "amenities", e.target.value)}
                                                                disabled={isCsvImporting}
                                                                placeholder="Wifi, AC, TV"
                                                                className="w-full px-2 py-1.5 bg-slate-50 border border-transparent rounded-sm outline-none focus:border-slate-350 focus:bg-white text-xs font-bold transition-all"
                                                            />
                                                        </td>

                                                        <td className="px-3 py-3 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeCsvRow(index)}
                                                                disabled={isCsvImporting}
                                                                className="text-red-500 hover:text-red-700 disabled:opacity-30 cursor-pointer"
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
                                            className="px-8 py-3.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                                        >
                                            {isCsvImporting ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Provisioning Partner Accounts...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-3.5 h-3.5" /> Bulk Import {csvRows.length} Records
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Execution Results Log */}
                            {csvResultsLog.length > 0 && (
                                <div className="bg-slate-50 border border-slate-200 rounded-sm p-5 space-y-4 animate-in fade-in duration-300">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-250 pb-2 flex items-center gap-1.5">
                                        <Info className="w-3.5 h-3.5" /> CSV Bulk Import Log Report
                                    </h4>
                                    <div className="space-y-3">
                                        {csvResultsLog.map((result, i) => (
                                            <div 
                                                key={i} 
                                                className={cn(
                                                    "p-3.5 rounded-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs",
                                                    result.success 
                                                        ? "bg-emerald-50/40 border-emerald-100 text-emerald-900" 
                                                        : "bg-red-50/40 border-red-100 text-red-900"
                                                )}
                                            >
                                                <div>
                                                    <div className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                        <span className={cn(
                                                            "w-2 h-2 rounded-full shrink-0", 
                                                            result.success ? "bg-emerald-500" : "bg-red-500"
                                                        )} />
                                                        {result.partnerName || 'Row Details'} ({result.email})
                                                    </div>
                                                    <div className="text-[10px] text-slate-550 mt-1">
                                                        {result.success ? (
                                                            <>
                                                                Created partner user & associated property <span className="font-bold">"{result.hotelName}"</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                Error: <span className="font-bold text-red-700">{result.message}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border shrink-0 sm:text-right",
                                                    result.success 
                                                        ? "bg-emerald-100/50 border-emerald-250 text-emerald-800" 
                                                        : "bg-red-100/50 border-red-250 text-red-800"
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
