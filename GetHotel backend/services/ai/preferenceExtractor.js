const logger = require('./logger');

/**
 * Preference Extractor Service
 * Analyzes conversation memory and booking data to learn user travel preferences.
 * Called after every conversation turn for logged-in users.
 *
 * @module preferenceExtractor
 */

/**
 * Default empty profile shape.
 * @returns {object}
 */
function emptyProfile() {
    return {
        preferredCities: [],
        budgetRange: { min: null, max: null },
        preferredAmenities: [],
        travelType: null,
        roomPreference: null,
        specialNotes: [],
        lastDestination: null,
        avgSpend: null,
        bookingCount: 0
    };
}

/**
 * Merges a new city into the preferredCities list (max 10, no dupes).
 * @param {string[]} existing
 * @param {string|null} city
 * @returns {string[]}
 */
function mergeCity(existing = [], city) {
    if (!city || typeof city !== 'string') return existing;
    const normalized = city.trim().charAt(0).toUpperCase() + city.trim().slice(1).toLowerCase();
    if (!normalized) return existing;

    // Move to front if already known (recency signal)
    const filtered = existing.filter(c => c.toLowerCase() !== normalized.toLowerCase());
    filtered.unshift(normalized);
    return filtered.slice(0, 10);
}

/**
 * Merges amenities into the preferred list (max 15, no dupes, case-insensitive).
 * @param {string[]} existing
 * @param {string[]} newAmenities
 * @returns {string[]}
 */
function mergeAmenities(existing = [], newAmenities = []) {
    const seen = new Set(existing.map(a => a.toLowerCase()));
    const merged = [...existing];
    for (const amenity of newAmenities) {
        const lower = (amenity || '').toLowerCase().trim();
        if (lower && !seen.has(lower)) {
            seen.add(lower);
            merged.push(lower);
        }
    }
    return merged.slice(0, 15);
}

/**
 * Updates budget range based on new price observation.
 * @param {{ min: number|null, max: number|null }} existing
 * @param {number|null} price
 * @returns {{ min: number|null, max: number|null }}
 */
function updateBudgetRange(existing = { min: null, max: null }, price) {
    if (!price || typeof price !== 'number' || price <= 0) return existing;

    const min = existing.min !== null ? Math.min(existing.min, price) : price;
    const max = existing.max !== null ? Math.max(existing.max, price) : price;
    return { min, max };
}

/**
 * Adds a special note (max 10, no exact dupes).
 * @param {string[]} existing
 * @param {string} note
 * @returns {string[]}
 */
function addSpecialNote(existing = [], note) {
    if (!note || typeof note !== 'string') return existing;
    const trimmed = note.trim();
    if (!trimmed) return existing;
    if (existing.some(n => n.toLowerCase() === trimmed.toLowerCase())) return existing;
    return [...existing, trimmed].slice(-10);
}

/**
 * Extracts travel type from conversation memory or user query text.
 * @param {string} text
 * @returns {string|null}
 */
function inferTravelType(text = '') {
    const lower = text.toLowerCase();
    if (/couple|romantic|honeymoon|anniversary|girlfriend|boyfriend|wife|husband/i.test(lower)) return 'couple';
    if (/family|kids|children|parents|relatives/i.test(lower)) return 'family';
    if (/business|work|meeting|conference|corporate/i.test(lower)) return 'business';
    if (/solo|alone|myself|akela/i.test(lower)) return 'solo';
    if (/friends|group|gang|dost/i.test(lower)) return 'friends';
    if (/luxury|premium|5\s*star|villa/i.test(lower)) return 'luxury';
    if (/budget|cheap|affordable|sasta/i.test(lower)) return 'budget';
    return null;
}

/**
 * Extracts room type preference from text.
 * @param {string} text
 * @returns {string|null}
 */
function inferRoomPreference(text = '') {
    const lower = text.toLowerCase();
    if (/suite|penthouse/i.test(lower)) return 'suite';
    if (/deluxe|premium/i.test(lower)) return 'deluxe';
    if (/standard|normal|basic/i.test(lower)) return 'standard';
    if (/double|twin/i.test(lower)) return 'double';
    if (/king|queen/i.test(lower)) return 'king';
    return null;
}

/**
 * Extracts preferred amenities from user query text.
 * @param {string} text
 * @returns {string[]}
 */
function extractAmenitiesFromText(text = '') {
    const lower = text.toLowerCase();
    const amenities = [];
    const amenityKeywords = {
        'pool': /pool|swimming/i,
        'breakfast': /breakfast|nashta/i,
        'wifi': /wifi|wi-fi|internet/i,
        'parking': /parking|car/i,
        'gym': /gym|fitness/i,
        'spa': /spa|massage/i,
        'restaurant': /restaurant|dining/i,
        'ac': /\bac\b|air.?condition/i,
        'bar': /\bbar\b|lounge/i,
        'room service': /room.?service/i,
        'sea view': /sea.?view|ocean.?view|beach.?view/i,
        'mountain view': /mountain.?view|hill.?view/i,
        'balcony': /balcony|terrace/i,
        'pet friendly': /pet|dog|cat/i,
        'couple friendly': /couple.?friendly|unmarried/i
    };

    for (const [name, regex] of Object.entries(amenityKeywords)) {
        if (regex.test(lower)) {
            amenities.push(name);
        }
    }
    return amenities;
}

/**
 * Main extraction function. Takes conversation memory + optional booking/hotel data
 * and returns an updated preference profile merged with existing profile.
 *
 * @param {{ existingProfile: object, conversationMemory: object, messages: Array, hotelData: object|null }} params
 * @returns {object} Updated preference profile
 */
function extractAndMergePreferences({ existingProfile = null, conversationMemory = {}, messages = [], hotelData = null }) {
    const profile = existingProfile ? { ...existingProfile } : emptyProfile();

    try {
        // 1. Learn destination
        if (conversationMemory.destination) {
            profile.preferredCities = mergeCity(profile.preferredCities, conversationMemory.destination);
            profile.lastDestination = conversationMemory.destination;
        }

        // 2. Scan messages for travel type, room preference, amenities
        const allText = messages
            .filter(m => (m.role || m.sender) === 'user')
            .map(m => m.content || m.text || '')
            .join(' ');

        const travelType = inferTravelType(allText);
        if (travelType) profile.travelType = travelType;

        const roomPref = inferRoomPreference(allText);
        if (roomPref) profile.roomPreference = roomPref;

        const textAmenities = extractAmenitiesFromText(allText);
        if (textAmenities.length > 0) {
            profile.preferredAmenities = mergeAmenities(profile.preferredAmenities, textAmenities);
        }

        // 3. Learn from hotel/booking data if available
        if (hotelData) {
            // Budget from actual booking price
            if (hotelData.pricePerNight) {
                profile.budgetRange = updateBudgetRange(profile.budgetRange, hotelData.pricePerNight);
                profile.avgSpend = profile.budgetRange.max; // rough approximation
            }

            // Hotel city
            if (hotelData.city) {
                profile.preferredCities = mergeCity(profile.preferredCities, hotelData.city);
                profile.lastDestination = hotelData.city;
            }

            // Hotel amenities
            let hotelAmenities = [];
            try {
                hotelAmenities = typeof hotelData.amenities === 'string'
                    ? JSON.parse(hotelData.amenities)
                    : (hotelData.amenities || []);
            } catch { /* ignore parse errors */ }

            if (Array.isArray(hotelAmenities) && hotelAmenities.length > 0) {
                profile.preferredAmenities = mergeAmenities(profile.preferredAmenities, hotelAmenities);
            }

            profile.bookingCount = (profile.bookingCount || 0) + 1;
        }

        // 4. Extract special notes from conversation
        const specialRequestMatch = allText.match(/special\s+request[s]?\s*[:\-]?\s*(.{3,100})/i);
        if (specialRequestMatch) {
            profile.specialNotes = addSpecialNote(profile.specialNotes, specialRequestMatch[1].trim());
        }

        // Check for late checkout preference
        if (/late\s*check\s*out|late\s*checkout/i.test(allText)) {
            profile.specialNotes = addSpecialNote(profile.specialNotes, 'prefers late checkout');
        }

        // Check for early check-in preference
        if (/early\s*check\s*in|early\s*checkin/i.test(allText)) {
            profile.specialNotes = addSpecialNote(profile.specialNotes, 'prefers early check-in');
        }

        logger.debug('PreferenceExtractor', 'Extracted preferences', {
            cities: profile.preferredCities.length,
            amenities: profile.preferredAmenities.length,
            travelType: profile.travelType,
            bookingCount: profile.bookingCount
        });

    } catch (err) {
        logger.warn('PreferenceExtractor', 'Error during extraction, returning existing profile', { error: err.message });
    }

    return profile;
}

/**
 * Formats a user profile into a human-readable string for the system prompt.
 * @param {object} profile
 * @returns {string}
 */
function formatProfileForPrompt(profile) {
    if (!profile) return '';

    const lines = [];

    if (profile.preferredCities?.length > 0) {
        lines.push(`- Favourite destinations: ${profile.preferredCities.join(', ')}`);
    }
    if (profile.budgetRange?.min !== null && profile.budgetRange?.max !== null) {
        lines.push(`- Budget range: ₹${profile.budgetRange.min.toLocaleString()} - ₹${profile.budgetRange.max.toLocaleString()} per night`);
    }
    if (profile.preferredAmenities?.length > 0) {
        lines.push(`- Must-have amenities: ${profile.preferredAmenities.join(', ')}`);
    }
    if (profile.travelType) {
        lines.push(`- Travel style: ${profile.travelType}`);
    }
    if (profile.roomPreference) {
        lines.push(`- Room preference: ${profile.roomPreference}`);
    }
    if (profile.lastDestination) {
        lines.push(`- Last visited: ${profile.lastDestination}`);
    }
    if (profile.bookingCount > 0) {
        lines.push(`- Total past bookings: ${profile.bookingCount}`);
    }
    if (profile.specialNotes?.length > 0) {
        lines.push(`- Special notes: ${profile.specialNotes.join('; ')}`);
    }

    return lines.join('\n');
}

module.exports = {
    emptyProfile,
    extractAndMergePreferences,
    formatProfileForPrompt
};
