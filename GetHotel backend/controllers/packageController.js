const prisma = require('../config/db');
const tourAiService = require('../services/ai/tourAiService');

// Ensure table exists on first load
const ensureTableExists = async () => {
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS tour_packages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                destination VARCHAR(255) NOT NULL,
                duration VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                original_price DECIMAL(10,2) DEFAULT NULL,
                discount_percent VARCHAR(50) DEFAULT NULL,
                rating DECIMAL(3,1) DEFAULT 4.8,
                reviews_count INT DEFAULT 45,
                badge VARCHAR(50) DEFAULT 'Bestseller',
                included_stay VARCHAR(255) DEFAULT NULL,
                transport VARCHAR(255) DEFAULT NULL,
                image TEXT DEFAULT NULL,
                gallery LONGTEXT DEFAULT NULL,
                overview LONGTEXT DEFAULT NULL,
                inclusions LONGTEXT DEFAULT NULL,
                exclusions LONGTEXT DEFAULT NULL,
                itinerary LONGTEXT DEFAULT NULL,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE tour_packages ADD COLUMN exclusions LONGTEXT DEFAULT NULL;`);
        } catch (e) {
            // Column already exists
        }
        try {
            await prisma.$executeRawUnsafe(`DELETE FROM tour_packages WHERE price = 145000 OR slug LIKE '%palace-on-wheels%';`);
        } catch (e) {}
    } catch (err) {
        console.error('[PackageController] Table initialization error:', err.message);
    }
};

// Initialize table
ensureTableExists();

// Helper to generate clean SEO Slugs
function createPackageSlug(title) {
    if (!title) return "tour-package-" + Date.now();
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

// Format package DB row to JSON object
function formatPackage(row) {
    if (!row) return null;
    return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        destination: row.destination,
        duration: row.duration,
        price: parseFloat(row.price),
        originalPrice: row.original_price ? parseFloat(row.original_price) : null,
        discountPercent: row.discount_percent || null,
        rating: parseFloat(row.rating || 4.8),
        reviewsCount: parseInt(row.reviews_count || 45, 10),
        badge: row.badge || "Bestseller",
        includedStay: row.included_stay || "",
        transport: row.transport || "",
        image: row.image || "",
        gallery: typeof row.gallery === "string" ? JSON.parse(row.gallery || "[]") : (row.gallery || []),
        overview: row.overview || "",
        inclusions: typeof row.inclusions === "string" ? JSON.parse(row.inclusions || "[]") : (row.inclusions || []),
        exclusions: typeof row.exclusions === "string" ? JSON.parse(row.exclusions || "[]") : (row.exclusions || []),
        itinerary: typeof row.itinerary === "string" ? JSON.parse(row.itinerary || "[]") : (row.itinerary || []),
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

// GET all tour packages
exports.getAllPackages = async (req, res) => {
    try {
        await ensureTableExists();
        const { search, destination, includeInactive } = req.query;

        let query = "SELECT * FROM tour_packages WHERE 1=1";
        const params = [];

        if (!includeInactive || includeInactive === "false") {
            query += " AND is_active = 1";
        }

        if (destination) {
            query += " AND (destination LIKE ? OR title LIKE ?)";
            params.push(`%${destination}%`, `%${destination}%`);
        }

        if (search) {
            query += " AND (title LIKE ? OR destination LIKE ? OR overview LIKE ?)";
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += " ORDER BY id DESC";

        const rows = await prisma.$queryRawUnsafe(query, ...params);
        const packages = (rows || []).map(formatPackage);

        return res.json({
            success: true,
            data: packages,
            count: packages.length
        });
    } catch (err) {
        console.error("Error in getAllPackages:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET single tour package by ID or Slug
exports.getPackageByIdOrSlug = async (req, res) => {
    try {
        await ensureTableExists();
        const { id } = req.params;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, message: "Valid package identifier is required" });
        }

        const trimmedId = id.trim().toLowerCase();
        // Strict Security Validation: allow ONLY positive integers or safe lowercase alphanumeric slug strings
        const isNumeric = /^\d+$/.test(trimmedId);
        const isSafeSlug = /^[a-z0-9_-]+$/.test(trimmedId);

        if (!isNumeric && !isSafeSlug) {
            // Reject any attempted injection or malformed payload immediately
            return res.status(400).json({ success: false, message: "Invalid characters in package identifier" });
        }

        let rows = [];
        if (isNumeric) {
            const numericId = parseInt(trimmedId, 10);
            rows = await prisma.$queryRawUnsafe(
                "SELECT * FROM tour_packages WHERE id = ? LIMIT 1",
                numericId
            );
        } else {
            // Parameterized query matching slug or title safely
            rows = await prisma.$queryRawUnsafe(
                "SELECT * FROM tour_packages WHERE slug = ? OR LOWER(title) = ? LIMIT 1",
                trimmedId,
                trimmedId.replace(/-/g, ' ')
            );

            // Fallback: If exact match failed, check if the slug is a normalized prefix/suffix
            if (!rows || rows.length === 0) {
                const searchPattern = `%${trimmedId}%`;
                rows = await prisma.$queryRawUnsafe(
                    "SELECT * FROM tour_packages WHERE slug LIKE ? OR LOWER(title) LIKE ? LIMIT 1",
                    searchPattern,
                    `%${trimmedId.replace(/-/g, ' ')}%`
                );
            }
        }

        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "Tour package not found" });
        }

        return res.json({
            success: true,
            data: formatPackage(rows[0])
        });
    } catch (err) {
        console.error("Error in getPackageByIdOrSlug:", err);
        return res.status(500).json({ success: false, message: "Internal server error retrieving tour package" });
    }
};

// POST create new tour package (Admin)
exports.createPackage = async (req, res) => {
    try {
        await ensureTableExists();
        const {
            title,
            slug,
            destination,
            duration,
            price,
            originalPrice,
            discountPercent,
            rating,
            reviewsCount,
            badge,
            includedStay,
            transport,
            image,
            gallery,
            overview,
            inclusions,
            itinerary,
            isActive
        } = req.body;

        if (!title || !destination || !duration || !price) {
            return res.status(400).json({ success: false, message: "Title, destination, duration, and price are required" });
        }

        const pkgSlug = slug ? createPackageSlug(slug) : createPackageSlug(title);
        const galleryJson = JSON.stringify(Array.isArray(gallery) ? gallery : (image ? [image] : []));
        const inclusionsJson = JSON.stringify(Array.isArray(inclusions) ? inclusions : []);
        const itineraryJson = JSON.stringify(Array.isArray(itinerary) ? itinerary : []);

        const insertQuery = `
            INSERT INTO tour_packages 
            (title, slug, destination, duration, price, original_price, discount_percent, rating, reviews_count, badge, included_stay, transport, image, gallery, overview, inclusions, itinerary, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await prisma.$executeRawUnsafe(
            insertQuery,
            title,
            pkgSlug,
            destination,
            duration,
            parseFloat(price),
            originalPrice ? parseFloat(originalPrice) : null,
            discountPercent || null,
            rating ? parseFloat(rating) : 4.8,
            reviewsCount ? parseInt(reviewsCount, 10) : 45,
            badge || "Bestseller",
            includedStay || "",
            transport || "",
            image || "",
            galleryJson,
            overview || "",
            inclusionsJson,
            itineraryJson,
            isActive !== undefined ? (isActive ? 1 : 0) : 1
        );

        const newRows = await prisma.$queryRawUnsafe("SELECT * FROM tour_packages WHERE slug = ? LIMIT 1", pkgSlug);

        return res.status(201).json({
            success: true,
            message: "Tour package created successfully",
            data: formatPackage(newRows[0])
        });
    } catch (err) {
        console.error("Error in createPackage:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// PUT update tour package (Admin)
exports.updatePackage = async (req, res) => {
    try {
        await ensureTableExists();
        const { id } = req.params;
        const {
            title,
            slug,
            destination,
            duration,
            price,
            originalPrice,
            discountPercent,
            rating,
            reviewsCount,
            badge,
            includedStay,
            transport,
            image,
            gallery,
            overview,
            inclusions,
            itinerary,
            isActive
        } = req.body;

        const checkRows = await prisma.$queryRawUnsafe("SELECT * FROM tour_packages WHERE id = ? LIMIT 1", parseInt(id, 10));
        if (!checkRows || checkRows.length === 0) {
            return res.status(404).json({ success: false, message: "Tour package not found" });
        }

        const existing = checkRows[0];
        const pkgSlug = slug ? createPackageSlug(slug) : (title ? createPackageSlug(title) : existing.slug);
        const galleryJson = gallery !== undefined ? JSON.stringify(gallery) : existing.gallery;
        const inclusionsJson = inclusions !== undefined ? JSON.stringify(inclusions) : existing.inclusions;
        const itineraryJson = itinerary !== undefined ? JSON.stringify(itinerary) : existing.itinerary;

        const updateQuery = `
            UPDATE tour_packages SET
                title = ?,
                slug = ?,
                destination = ?,
                duration = ?,
                price = ?,
                original_price = ?,
                discount_percent = ?,
                rating = ?,
                reviews_count = ?,
                badge = ?,
                included_stay = ?,
                transport = ?,
                image = ?,
                gallery = ?,
                overview = ?,
                inclusions = ?,
                itinerary = ?,
                is_active = ?
            WHERE id = ?
        `;

        await prisma.$executeRawUnsafe(
            updateQuery,
            title !== undefined ? title : existing.title,
            pkgSlug,
            destination !== undefined ? destination : existing.destination,
            duration !== undefined ? duration : existing.duration,
            price !== undefined ? parseFloat(price) : existing.price,
            originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : existing.original_price,
            discountPercent !== undefined ? discountPercent : existing.discount_percent,
            rating !== undefined ? parseFloat(rating) : existing.rating,
            reviewsCount !== undefined ? parseInt(reviewsCount, 10) : existing.reviews_count,
            badge !== undefined ? badge : existing.badge,
            includedStay !== undefined ? includedStay : existing.included_stay,
            transport !== undefined ? transport : existing.transport,
            image !== undefined ? image : existing.image,
            galleryJson,
            overview !== undefined ? overview : existing.overview,
            inclusionsJson,
            itineraryJson,
            isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active,
            parseInt(id, 10)
        );

        const updatedRows = await prisma.$queryRawUnsafe("SELECT * FROM tour_packages WHERE id = ? LIMIT 1", parseInt(id, 10));

        return res.json({
            success: true,
            message: "Tour package updated successfully",
            data: formatPackage(updatedRows[0])
        });
    } catch (err) {
        console.error("Error in updatePackage:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE tour package (Admin)
exports.deletePackage = async (req, res) => {
    try {
        await ensureTableExists();
        const { id } = req.params;

        await prisma.$executeRawUnsafe("DELETE FROM tour_packages WHERE id = ?", parseInt(id, 10));

        return res.json({
            success: true,
            message: "Tour package deleted successfully"
        });
    } catch (err) {
        console.error("Error in deletePackage:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Upload image file endpoint (Admin)
const { processBase64Image } = require('../middleware/imageUpload');
exports.uploadImage = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ success: false, message: "Image base64 data required" });
        }
        const uploadedPath = await processBase64Image(image);
        return res.json({
            success: true,
            url: uploadedPath
        });
    } catch (err) {
        console.error("Image upload error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST Bulk Import Tour Packages via JSON (Admin)
exports.importPackagesJson = async (req, res) => {
    try {
        await ensureTableExists();
        const { jsonText, packages, products, tours, defaultPrice, defaultBadge } = req.body;
        let items = [];

        if (Array.isArray(packages) && packages.length > 0) {
            items = packages;
        } else if (Array.isArray(products) && products.length > 0) {
            items = products;
        } else if (Array.isArray(tours) && tours.length > 0) {
            items = tours;
        } else if (jsonText) {
            try {
                const parsed = typeof jsonText === 'string' ? JSON.parse(jsonText) : jsonText;
                if (Array.isArray(parsed)) {
                    items = parsed;
                } else if (parsed && typeof parsed === 'object') {
                    if (Array.isArray(parsed.products)) {
                        items = parsed.products;
                    } else if (Array.isArray(parsed.packages)) {
                        items = parsed.packages;
                    } else if (Array.isArray(parsed.tours)) {
                        items = parsed.tours;
                    } else if (Array.isArray(parsed.data)) {
                        items = parsed.data;
                    } else if (Array.isArray(parsed.tour_packages)) {
                        items = parsed.tour_packages;
                    } else if (parsed.title || parsed.tour_name || parsed.name) {
                        items = [parsed];
                    }
                }
            } catch (e) {
                return res.status(400).json({ success: false, message: "Invalid JSON format: " + e.message });
            }
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "No valid tour package objects found in JSON." });
        }

        let importedCount = 0;
        const results = [];

        for (const item of items) {
            try {
                const title = item.title || item.tour_name || item.name || "Untitled Exotic Tour Package";
                
                let destination = "India";
                if (item.destination) {
                    destination = typeof item.destination === 'string' ? item.destination : (Array.isArray(item.destination) ? item.destination.join(", ") : String(item.destination));
                } else if (item.destinations) {
                    destination = typeof item.destinations === 'string' ? item.destinations : (Array.isArray(item.destinations) ? item.destinations.join(", ") : String(item.destinations));
                } else if (item.city) {
                    destination = String(item.city);
                }

                const duration = item.duration || item.days_nights || "5 Days / 4 Nights";
                
                let price = 0;
                if (item.price !== undefined && item.price !== null && !isNaN(parseFloat(item.price))) {
                    price = parseFloat(item.price);
                } else if (defaultPrice !== undefined && !isNaN(parseFloat(defaultPrice))) {
                    price = parseFloat(defaultPrice);
                }

                let originalPrice = null;
                if (item.originalPrice || item.original_price) {
                    originalPrice = parseFloat(item.originalPrice || item.original_price);
                } else if (price > 0) {
                    originalPrice = Math.round(price * 1.25);
                }

                const discountPercent = item.discountPercent || item.discount_percent || (price > 0 && originalPrice > price ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF` : null);
                
                const randomId = Math.floor(1000 + Math.random() * 9000);
                const pkgSlug = createPackageSlug(item.slug || title) + "-" + randomId;
                
                // Process images
                let mainImage = item.image || item.coverImage || item.thumbnail || item.cover_image || "";
                if (mainImage && mainImage.startsWith("data:image")) {
                    mainImage = await processBase64Image(mainImage);
                }

                let gallery = Array.isArray(item.gallery) ? item.gallery : (mainImage ? [mainImage] : []);
                const processedGallery = [];
                for (let gImg of gallery) {
                    if (typeof gImg === 'string' && gImg.startsWith("data:image")) {
                        const saved = await processBase64Image(gImg);
                        processedGallery.push(saved);
                    } else if (typeof gImg === 'string') {
                        processedGallery.push(gImg);
                    }
                }

                const galleryJson = JSON.stringify(processedGallery);
                const inclusionsJson = JSON.stringify(Array.isArray(item.inclusions) ? item.inclusions : (typeof item.inclusions === 'string' ? item.inclusions.split('\n').map(s => s.trim()).filter(Boolean) : []));
                const exclusionsJson = JSON.stringify(Array.isArray(item.exclusions) ? item.exclusions : (typeof item.exclusions === 'string' ? item.exclusions.split('\n').map(s => s.trim()).filter(Boolean) : []));
                
                let itineraryData = [];
                if (Array.isArray(item.itinerary)) {
                    itineraryData = item.itinerary;
                } else if (typeof item.itinerary === 'string') {
                    try {
                        itineraryData = JSON.parse(item.itinerary);
                    } catch {
                        itineraryData = [{ day: 1, title: "Day 1", details: item.itinerary }];
                    }
                }
                const itineraryJson = JSON.stringify(itineraryData);

                const badge = item.badge || item.category || defaultBadge || "Bestseller";
                const includedStay = item.included_stay || item.includedStay || item.stay || "Hotel Stay Included";
                const transport = item.transport || item.vehicle || "Private AC Transfers Included";
                const overview = item.overview || item.about_the_tour || item.description || item.about || `${title} covering ${destination}.`;

                const insertQuery = `
                    INSERT INTO tour_packages 
                    (title, slug, destination, duration, price, original_price, discount_percent, rating, reviews_count, badge, included_stay, transport, image, gallery, overview, inclusions, exclusions, itinerary, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                await prisma.$executeRawUnsafe(
                    insertQuery,
                    title,
                    pkgSlug,
                    destination,
                    duration,
                    price,
                    originalPrice,
                    discountPercent,
                    item.rating ? parseFloat(item.rating) : 4.8,
                    item.reviewsCount ? parseInt(item.reviewsCount, 10) : 45,
                    badge,
                    includedStay,
                    transport,
                    mainImage,
                    galleryJson,
                    overview,
                    inclusionsJson,
                    exclusionsJson,
                    itineraryJson,
                    item.isActive !== undefined ? (item.isActive ? 1 : 0) : 1
                );

                importedCount++;
                results.push({ title, status: "imported" });
            } catch (e) {
                console.warn("[Package JSON Import Error]:", e.message);
            }
        }

        return res.json({
            success: true,
            message: `Successfully imported ${importedCount} tour package(s) via JSON!`,
            count: importedCount,
            results
        });

    } catch (err) {
        console.error("Error in importPackagesJson:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET Tour Hero Section Config (Public)
exports.getHeroConfig = async (req, res) => {
    try {
        const row = await prisma.homepage_config.findUnique({
            where: { key: 'tour_hero_config' }
        });

        if (row && row.value) {
            try {
                const parsed = JSON.parse(row.value);
                return res.json({ success: true, data: parsed });
            } catch (e) {
                /* fall through to null */
            }
        }

        // No banner configured by super admin yet — return null so the frontend
        // shows "Not Available" instead of fabricated default images.
        return res.json({ success: true, data: null });
    } catch (err) {
        console.error("Error in getHeroConfig:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// PUT Update Tour Hero Section Config (Admin)
exports.updateHeroConfig = async (req, res) => {
    try {
        const { title, subtitle, heroImages, banners } = req.body;
        const payload = {
            title: title || "Explore Handcrafted Tour Packages",
            subtitle: subtitle || "Unforgettable journeys designed for your dream vacation across India & global destinations",
            heroImages: Array.isArray(heroImages) ? heroImages : [],
            banners: Array.isArray(banners) ? banners : []
        };

        const strValue = JSON.stringify(payload);
        await prisma.homepage_config.upsert({
            where: { key: 'tour_hero_config' },
            update: { value: strValue },
            create: { key: 'tour_hero_config', value: strValue }
        });

        return res.json({
            success: true,
            message: "Tour Hero Section Configuration updated successfully!",
            data: payload
        });
    } catch (err) {
        console.error("Error in updateHeroConfig:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST AI Tour Suggestion / Parsing (Admin)
exports.aiSuggestTours = async (req, res) => {
    try {
        const { prompt, rawText, jsonText, destinationHint } = req.body;
        const tours = await tourAiService.generateOrParseTours({ prompt, rawText, jsonText, destinationHint });
        return res.json({
            success: true,
            data: tours,
            count: tours.length,
            message: `Successfully generated ${tours.length} tour package draft(s)`
        });
    } catch (err) {
        console.error("Error in aiSuggestTours:", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to generate tours" });
    }
};

