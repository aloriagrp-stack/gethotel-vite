const { extractDestination } = require('./hotelSearchService');

/**
 * State Manager Service
 * Parses conversation state and memory from message history
 */

function extractSessionState(messages = []) {
    const destination = extractDestination(messages);
    
    let selectedHotelId = null;
    let selectedRoomId = null;
    let guestName = null;
    let guestPhone = null;
    let guestEmail = null;
    let paymentMethod = null;
    let bookingConfirmed = false;
    let paymentPending = false;
    let paymentSuccess = false;

    // Scan history messages from newest to oldest for /hotel/ID links
    for (let i = messages.length - 1; i >= 0; i--) {
        const content = messages[i].content || messages[i].text || '';

        if (!selectedHotelId) {
            const hotelMatch = content.match(/\/hotel\/(\d+)/) || 
                               content.match(/\[SELECTED HOTEL:[^\]]*ID:\s*(\d+)/i) ||
                               content.match(/\broom\s+categories\s+for.*?\(\s*id\s*[:=]?\s*(\d+)\)/i) ||
                               content.match(/\broom\s+categories\s+for.*?\bid\s*[:=]?\s*(\d+)\b/i) ||
                               (content.match(/\b(?:hotel|hotelid|id)\s*[:=]?\s*(\d+)\b/i) && !/\broom\s+(?:id|category|type|selection|name|number)/i.test(content)) ||
                               (content.match(/\(\s*id\s*:\s*(\d+)\s*\)/i) && !/\broom\s+(?:id|category|type|selection|name|number)/i.test(content));
            if (hotelMatch) {
                selectedHotelId = parseInt(hotelMatch[1]);
            }
        }

        if (!selectedRoomId) {
            const roomMatch = content.match(/\[SELECTED ROOM:[^\]]*ID:\s*(\d+)/i) ||
                              content.match(/\b(?:room|roomid)\s*[:=]?\s*(\d+)/i) || 
                              content.match(/\broom(?:\s+id)?[:#\s-]*(\d+)\b/i) ||
                              (content.match(/\b(?:hotel|hotelid|id)\s*[:=]?\s*(\d+)\b/i) && /\broom\s+(?:id|category|type|selection|name|number)/i.test(content)) ||
                              (content.match(/\(\s*id\s*:\s*(\d+)\s*\)/i) && /\broom\s+(?:id|category|type|selection|name|number)/i.test(content));
            if (roomMatch) {
                selectedRoomId = parseInt(roomMatch[1]);
            } else if (
                /\[SELECTED ROOM:/i.test(content) ||
                /\b(chosen|selected|reserved|booked|reserve|book|booking|confirm|confirmed|yehi|this room)\b/i.test(content) ||
                /^\s*(standard|deluxe|suite|executive|king|queen|double|single)\s+(room|suite)/i.test(content)
            ) {
                selectedRoomId = 1;
            }
        }

        if (!guestEmail) {
            const emailMatch = content.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
            if (emailMatch) {
                guestEmail = emailMatch[1].trim();
            }
        }

        if (!guestPhone) {
            const phoneMatch = content.match(/(?:\+91[\s-]?)?[6-9]\d{9}\b/);
            if (phoneMatch) {
                guestPhone = phoneMatch[0].trim();
            }
        }

        if (!guestName) {
            const nameMatch = content.match(/\b(?:my name is|guest name is|name is|i am)\s+([a-zA-Z][a-zA-Z\s.'-]{1,80})/i);
            if (nameMatch) {
                guestName = nameMatch[1].trim();
            } else if (
                i > 0 && 
                messages[i - 1] && 
                (messages[i - 1].role === 'ai' || messages[i - 1].sender === 'ai' || messages[i - 1].role === 'model') &&
                /full name|your name|guest name/i.test(messages[i - 1].content || messages[i - 1].text || '')
            ) {
                const cleanedName = content.replace(/\[SELECTED ROOM:[^\]]*\]|\[SELECTED HOTEL:[^\]]*\]/gi, '').trim();
                if (cleanedName && !/\b(hi|hello|hey|yes|no|cancel)\b/i.test(cleanedName) && !/\d{5,}/.test(cleanedName)) {
                    guestName = cleanedName;
                }
            }
        }

        if (!paymentMethod) {
            if (/\b(pay at hotel|pay on arrival|hotel payment)\b/i.test(content)) {
                paymentMethod = 'pay_at_hotel';
            } else if (/\b(online payment|pay online|razorpay|upi|card)\b/i.test(content)) {
                paymentMethod = 'online';
            }
        }

        if (!bookingConfirmed && /booking\s+(confirmed|success|complete)|reservation\s+(confirmed|success)/i.test(content)) {
            bookingConfirmed = true;
        }

        if (!paymentPending && /payment\s+(pending|started|initiated)|razorpay/i.test(content)) {
            paymentPending = true;
        }

        if (!paymentSuccess && /payment\s+(success|verified|captured|complete)|paid\s+(online|successfully)/i.test(content)) {
            paymentSuccess = true;
        }

        if (selectedHotelId && selectedRoomId && guestName && guestPhone && guestEmail && paymentMethod && bookingConfirmed && paymentPending && paymentSuccess) break;
    }

    return {
        destination,
        selectedHotelId,
        selectedRoomId,
        guestName,
        guestPhone,
        guestEmail,
        paymentMethod,
        bookingConfirmed,
        paymentPending,
        paymentSuccess
    };
}

module.exports = {
    extractSessionState
};
