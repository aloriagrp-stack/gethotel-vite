const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const decodeUnicode = str => str.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => String.fromCharCode(parseInt(grp, 16)));

const parseBookingComHtml = (html) => {
    // 1. Parse Facility Map
    const facilityMap = {};
    const instanceRegex = /"__typename":"Instance","id":(\d+),"title":"([^"]+)"/g;
    let instMatch;
    while ((instMatch = instanceRegex.exec(html)) !== null) {
        const id = instMatch[1];
        const title = decodeUnicode(instMatch[2].replace(/\\"/g, '"').replace(/\\'/g, "'"));
        facilityMap[id] = title;
    }

    // 2. Parse b_rooms_available_and_soldout for prices & capacity
    const roomInfoByName = {};
    const priceMatch = html.match(/b_rooms_available_and_soldout:\s*(\[[\s\S]*?\]),\s*b_/);
    console.log('[Test Script] priceMatch found:', !!priceMatch);
    if (priceMatch) {
        try {
            console.log('[Test Script] Raw price JSON snippet:', priceMatch[1].slice(0, 1000));
            const data = JSON.parse(priceMatch[1]);
            console.log('[Test Script] b_rooms_available_and_soldout elements count:', data.length);
            data.forEach(r => {
                const roomName = r.b_name;
                if (roomName) {
                    const normName = roomName.toLowerCase().trim();
                    let minPrice = Infinity;
                    let maxPersons = 2;
                    
                    if (r.b_blocks && r.b_blocks.length > 0) {
                        r.b_blocks.forEach(b => {
                            if (b.b_max_persons && b.b_max_persons > maxPersons) {
                                maxPersons = b.b_max_persons;
                            }
                            
                            let blockPrice = null;
                            if (b.b_stay_prices && b.b_stay_prices.length > 0) {
                                const oneNight = b.b_stay_prices.find(sp => sp.b_stays === 1);
                                if (oneNight && oneNight.b_raw_price) {
                                    blockPrice = parseFloat(oneNight.b_raw_price);
                                }
                            }
                            
                            if (!blockPrice) {
                                blockPrice = parseFloat(b.b_raw_price);
                            }
                            
                            if (!blockPrice && b.b_avg_price_per_night_eur) {
                                blockPrice = parseFloat(b.b_avg_price_per_night_eur) * 90; // Convert EUR to INR
                            }
                            
                            if (blockPrice && blockPrice < minPrice) {
                                minPrice = blockPrice;
                            }
                        });
                    }
                    
                    roomInfoByName[normName] = {
                        price: minPrice !== Infinity ? Math.round(minPrice) : null,
                        maxOccupancy: maxPersons
                    };
                }
            });
        } catch (e) {
            console.warn("[Booking.com Price Parser Error]:", e.message);
        }
    }
    
    console.log('[Test Script] roomInfoByName map:', JSON.stringify(roomInfoByName, null, 2));

    // 3. Parse RoomPhoto definitions to get URIs
    const photoMap = {};
    const photoRegex = /"RoomPhoto:(\d+)":/g;
    let photoMatch;
    while ((photoMatch = photoRegex.exec(html)) !== null) {
        const photoId = photoMatch[1];
        const startIndex = photoMatch.index + photoMatch[0].length;
        
        let braceCount = 0;
        let endIndex = startIndex;
        for (let i = startIndex; i < html.length; i++) {
            if (html[i] === '{') braceCount++;
            if (html[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                    endIndex = i + 1;
                    break;
                }
            }
        }
        
        try {
            const photoJson = JSON.parse(html.slice(startIndex, endIndex));
            if (photoJson.photoUri) {
                let uri = photoJson.photoUri.replace(/\\u0026/g, '&').replace(/u0026/g, '&').replace(/\\/g, '');
                if (!uri.startsWith('http') && !uri.startsWith('//')) {
                    uri = `https://cf.bstatic.com${uri}`;
                }
                photoMap[photoId] = uri;
            }
        } catch (e) {}
    }

    // 4. Parse RoomTranslation definitions to get name & description
    const roomTranslations = {};
    const rtRegex = /"RoomTranslation:(\d+)":/g;
    let rtMatch;
    while ((rtMatch = rtRegex.exec(html)) !== null) {
        const roomId = rtMatch[1];
        const startIndex = rtMatch.index + rtMatch[0].length;
        
        let braceCount = 0;
        let endIndex = startIndex;
        for (let i = startIndex; i < html.length; i++) {
            if (html[i] === '{') braceCount++;
            if (html[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                    endIndex = i + 1;
                    break;
                }
            }
        }
        
        try {
            const rtJson = JSON.parse(html.slice(startIndex, endIndex));
            roomTranslations[roomId] = {
                name: decodeUnicode(rtJson.name),
                description: rtJson.description ? decodeUnicode(rtJson.description) : ''
            };
        } catch (e) {}
    }

    // 5. Parse RoomData definitions to tie photos, amenities, etc.
    const rooms = [];
    const rdRegex = /"RoomData:(\d+)":/g;
    let rdMatch;
    while ((rdMatch = rdRegex.exec(html)) !== null) {
        const roomId = rdMatch[1];
        const startIndex = rdMatch.index + rdMatch[0].length;
        
        let braceCount = 0;
        let endIndex = startIndex;
        for (let i = startIndex; i < html.length; i++) {
            if (html[i] === '{') braceCount++;
            if (html[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                    endIndex = i + 1;
                    break;
                }
            }
        }
        
        try {
            const rdJson = JSON.parse(html.slice(startIndex, endIndex));
            const translation = roomTranslations[roomId] || { name: `Room ${roomId}`, description: '' };
            
            const rimgMatches = [];
            if (rdJson.roomPhotos && Array.isArray(rdJson.roomPhotos)) {
                rdJson.roomPhotos.forEach(rp => {
                    if (rp.__ref) {
                        const pid = rp.__ref.replace('RoomPhoto:', '');
                        if (photoMap[pid]) {
                            rimgMatches.push(photoMap[pid]);
                        }
                    }
                });
            }
            
            const roomAmenities = [];
            if (rdJson.amenities && Array.isArray(rdJson.amenities)) {
                rdJson.amenities.forEach(am => {
                    if (am.__ref) {
                        const refStr = am.__ref;
                        const idMatch = refStr.match(/"id":(\d+)/) || refStr.match(/id\\":(\d+)/);
                        if (idMatch) {
                            const fid = idMatch[1];
                            if (facilityMap[fid]) {
                                roomAmenities.push(facilityMap[fid]);
                            }
                        }
                    }
                });
            }

            const name = translation.name;
            const description = translation.description;
            const normName = name.toLowerCase().trim();
            
            let price = null;
            let maxOccupancy = 2;
            
            if (roomInfoByName[normName]) {
                price = roomInfoByName[normName].price;
                maxOccupancy = roomInfoByName[normName].maxOccupancy;
            } else {
                const matchKey = Object.keys(roomInfoByName).find(k => k.includes(normName) || normName.includes(k));
                if (matchKey) {
                    price = roomInfoByName[matchKey].price;
                    maxOccupancy = roomInfoByName[matchKey].maxOccupancy;
                }
            }
            
            let sizeM2 = 24;
            if (normName.includes('suite')) sizeM2 = 65;
            else if (normName.includes('deluxe') || normName.includes('classic')) sizeM2 = 32;
            else if (normName.includes('family') || normName.includes('triple')) sizeM2 = 45;
            else if (normName.includes('single')) sizeM2 = 18;

            const capacityAdults = maxOccupancy;
            
            rooms.push({
                name,
                description,
                sizeM2,
                capacityAdults,
                maxOccupancy,
                amenities: roomAmenities,
                images: rimgMatches.slice(0, 5),
                price
            });
        } catch (e) {
            console.warn(`Error parsing RoomData for ID ${roomId}:`, e.message);
        }
    }

    return { rooms };
};

const runTest = async () => {
    try {
        const testUrl = 'https://www-booking-com.translate.goog/hotel/in/natraj-yes-please.html?_x_tr_sl=auto&_x_tr_tl=en&checkin=2026-06-16&checkout=2026-06-17&group_adults=2&no_rooms=1&group_children=0&selected_currency=INR';
        console.log('[Test Script] Fetching HTML from translate proxy...');
        const response = await fetch(testUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        const html = await response.text();
        console.log('[Test Script] HTML Length:', html.length);
        
        const priceMatch = html.match(/b_rooms_available_and_soldout:\s*(\[[\s\S]*?\]),\s*b_/);
        let rawPriceData = null;
        if (priceMatch) {
            try {
                rawPriceData = JSON.parse(priceMatch[1]);
            } catch (err) {}
        }
        
        const parsed = parseBookingComHtml(html);
        
        const outputData = {
            rawPriceData,
            parsedRooms: parsed.rooms
        };
        
        const outPath = path.join(__dirname, 'test_parse_output.json');
        fs.writeFileSync(outPath, JSON.stringify(outputData, null, 2));
        console.log('[Test Script] Saved output to:', outPath);
    } catch (e) {
        console.error(e);
    }
};

runTest();
