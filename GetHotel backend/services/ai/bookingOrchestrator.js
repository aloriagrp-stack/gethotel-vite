const prisma = require('../../config/db');
const { sendBookingEmails } = require('../../utils/emailService');
const Razorpay = require('razorpay');
const logger = require('./logger');

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

/**
 * Booking Orchestrator Service
 * Handles in-chat booking detection, guest details parsing, database reservation creation,
 * GST calculation, and Razorpay payment order setup.
 *
 * @param {{ reply: string, userId: number|null, messages: Array, memory: object }} params
 * @returns {Promise<null | {
 *   booking: object|null,
 *   order: object|null,
 *   action: { type: string, [key: string]: any }|null,
 *   modifiedReply: string|null
 * }>}
 */
async function processAiBookingConfirmation({ reply, userId, messages, memory }) {
    try {
        const lastUserContent = (messages && messages.length > 0 ? (messages[messages.length - 1].content || messages[messages.length - 1].text || '') : '').toLowerCase();

        // Strict payment/checkout signal — only trigger when AI or user explicitly asks for payment or deposit
        const isExplicitPaymentRequest = /12%\s+deposit|pay\s+online\s+now|checkout\s+link|razorpay|complete\s+your\s+payment/i.test(reply) ||
                                        /pay\s+deposit|checkout\s+now|make\s+payment|book\s+now\s+id/i.test(lastUserContent);
        if (!isExplicitPaymentRequest) return null;

        logger.info('BookingOrch', 'Detected explicit booking payment signal');

        // Parse Hotel ID from markdown link: [Name](/hotel/ID), /hotel/ID, or active memory
        const hotelLinkMatch = reply.match(/\[([^\]]+)\]\(\/hotel\/(\d+)\)/) || reply.match(/\/hotel\/(\d+)/);
        let hotelId = null;
        let hotelName = 'GetHotel Partner';
        if (hotelLinkMatch) {
            hotelName = hotelLinkMatch[1] || 'GetHotel Partner';
            hotelId = parseInt(hotelLinkMatch[2] || hotelLinkMatch[1]);
        } else if (memory && memory.selectedHotelId) {
            hotelId = parseInt(memory.selectedHotelId);
        }

        // If no explicit hotel ID is associated, DO NOT generate a random fallback payment card!
        if (!hotelId) {
            logger.debug('BookingOrch', 'No explicit hotel ID found for payment, skipping checkout action');
            return null;
        }

        // Authenticate guest — block anonymous reservations
        if (!userId) {
            logger.info('BookingOrch', 'Blocked booking: user not authenticated');
            return {
                booking: null,
                order: null,
                action: { type: 'REQUIRE_SIGN_IN' },
                modifiedReply: "Please sign in to confirm your booking and complete your reservation! 🔑"
            };
        }

        // 2. Parse Email (from reply or history)
        let guestEmail = null;
        const emailMatch = reply.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (emailMatch) {
            guestEmail = emailMatch[1].trim();
        } else if (messages) {
            for (let i = messages.length - 1; i >= 0; i--) {
                const content = messages[i].content || messages[i].text || '';
                const histEmail = content.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
                if (histEmail) {
                    guestEmail = histEmail[1].trim();
                    break;
                }
            }
        }

        if (!guestEmail) {
            logger.debug('BookingOrch', 'No email found in reply or history, skipping booking creation');
            return null;
        }

        // Fetch hotel from database — resolve room-to-hotel fallback
        let hotelDb = await prisma.hotel.findUnique({ where: { id: hotelId } });

        if (!hotelDb) {
            // Maybe the ID is actually a roomId — try resolving
            const roomDb = await prisma.room.findUnique({ where: { id: hotelId }, select: { hotelId: true } });
            if (roomDb) {
                hotelId = roomDb.hotelId;
                hotelDb = await prisma.hotel.findUnique({ where: { id: hotelId } });
            }
            if (!hotelDb) {
                logger.warn('BookingOrch', 'Hotel not found in DB for resolved ID', { hotelId });
                return null;
            }
        }

        hotelName = hotelDb.name;

        // 4. Parse Guest Name
        let guestName = 'Valued Guest';
        const nameMatch = reply.match(/(?:Guest\s+)?Name:\s*([^\n\r*]+)/i);
        if (nameMatch) {
            guestName = nameMatch[1].trim();
        } else {
            const greetingMatch = reply.match(/confirm ho gayi hai,\s*([A-Za-z]+)/i);
            if (greetingMatch) {
                guestName = greetingMatch[1].trim();
            }
        }
        const nameParts = guestName.split(/\s+/);
        const guestFirstName = nameParts[0] || 'Valued';
        const guestLastName = nameParts.slice(1).join(' ') || 'Guest';

        // 5. Parse Phone
        let guestPhone = '9999999999';
        const phoneMatch = reply.match(/(?:Phone|Mobile|Contact)(?:\s+Number)?:\s*([^\n\r*]+)/i);
        if (phoneMatch) {
            guestPhone = phoneMatch[1].trim();
        }

        // 6. Parse Dates (Check-In & Check-Out)
        let checkInDate = new Date();
        let checkOutDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const dateMatch = reply.match(/(?:Dates?|Stay):\s*([^\n\r*]+)/i) || reply.match(/(?:in|on)\s+(\d+(?:st|nd|rd|th)?\s+[A-Za-z]+)/i);
        if (dateMatch) {
            const rawDates = dateMatch[1];
            const dateParts = rawDates.split(/[–-]/);
            if (dateParts[0]) {
                const parsedIn = Date.parse(dateParts[0].trim().replace(/(st|nd|rd|th)/g, ''));
                if (!isNaN(parsedIn)) checkInDate = new Date(parsedIn);
            }
            if (dateParts[1]) {
                const parsedOut = Date.parse(dateParts[1].trim().replace(/(st|nd|rd|th)/g, ''));
                if (!isNaN(parsedOut)) checkOutDate = new Date(parsedOut);
            } else {
                checkOutDate = new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000);
            }
        }

        // Normalize dates to midnight for idempotent de-duplication
        checkInDate.setHours(0, 0, 0, 0);
        checkOutDate.setHours(0, 0, 0, 0);

        // 7. Parse Room Type and find roomId
        let roomTypeName = 'Standard Room';
        const roomMatch = reply.match(/(?:Room|Room Type):\s*([^\n\r*]+)/i);
        if (roomMatch) {
            roomTypeName = roomMatch[1].trim();
        }

        let roomId = memory?.selectedRoomId || null;
        if (!roomId && hotelId) {
            const searchKeyword = roomTypeName.replace(/(room|double|deluxe|suite)/gi, '').trim().toLowerCase();
            const dbRoom = await prisma.room.findFirst({
                where: {
                    hotelId: hotelId,
                    name: { contains: searchKeyword }
                }
            });
            if (dbRoom) {
                roomId = dbRoom.id;
            } else {
                const firstRoom = await prisma.room.findFirst({
                    where: { hotelId: hotelId }
                });
                if (firstRoom) {
                    roomId = firstRoom.id;
                }
            }
        }

        // 8. DB-grounded Dynamic Pricing Calculation
        let pricePerNight = 2500;
        let resolvedRoomId = roomId;
        let resolvedHotelId = hotelId || memory?.selectedHotelId;

        if (resolvedRoomId) {
            const roomDb = await prisma.room.findUnique({
                where: { id: resolvedRoomId },
                include: {
                    dailyrate: {
                        where: { date: { gte: new Date(new Date().setHours(0,0,0,0)) } },
                        orderBy: { date: 'asc' },
                        take: 1
                    }
                }
            });
            if (roomDb) {
                pricePerNight = roomDb.pricePerNight;
                if (roomDb.dailyrate && roomDb.dailyrate.length > 0 && roomDb.dailyrate[0].price < pricePerNight) {
                    pricePerNight = roomDb.dailyrate[0].price;
                }
                if (!resolvedHotelId) resolvedHotelId = roomDb.hotelId;
            }
        } else if (resolvedHotelId) {
            const hotelDbForPrice = await prisma.hotel.findUnique({ where: { id: resolvedHotelId } });
            if (hotelDbForPrice) {
                pricePerNight = hotelDbForPrice.pricePerNight;
            }
        }

        const nights = Math.max(1, Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
        const subtotalPrice = pricePerNight * nights;

        let gstRate = 0.12;
        if (pricePerNight <= 1000) {
            gstRate = 0;
        } else if (pricePerNight <= 7500) {
            gstRate = 0.12;
        } else {
            gstRate = 0.18;
        }
        const calculatedTaxes = Math.round(subtotalPrice * gstRate);
        const totalPrice = subtotalPrice + calculatedTaxes;

        // 9. Parse Payment Method (3 choices: 12% deposit, 100% full online, or pay at hotel)
        const historyText = (messages || []).map(m => (m.content || m.text || '').toLowerCase()).join(' ');
        const fullText = `${reply} ${lastUserContent} ${historyText}`.toLowerCase();

        const isExplicitPayAtHotel = /pay\s+at\s+hotel|hotel\s+pe|hotel\s+par|hotel\s+check-in\s+pay|pay\s+100%\s+at\s+hotel/i.test(lastUserContent) || /pay\s+at\s+hotel/i.test(reply);
        const isFullOnline = /100%|full\s+pay|full\s+online|entire\s+amount/i.test(lastUserContent) || /100%\s+online|full\s+pay\s+online/i.test(fullText);
        const isDepositOnline = /12%|deposit|pay\s+online|online/i.test(lastUserContent) || /12%\s+deposit|pay\s+online/i.test(fullText) || !isExplicitPayAtHotel;
        const isOnlinePayment = !isExplicitPayAtHotel || isDepositOnline || isFullOnline;

        // 10. Resolve user ID for DB relation
        let targetUserId = userId;
        if (!targetUserId) {
            const existingUser = await prisma.user.findUnique({ where: { email: guestEmail } });
            if (existingUser) {
                targetUserId = existingUser.id;
            }
        }

        // 11. Idempotent de-duplication: look for matching booking in last 5 minutes
        const dedupeWindow = new Date(Date.now() - 5 * 60 * 1000);
        let booking = await prisma.booking.findFirst({
            where: {
                guestEmail: guestEmail,
                hotelId: hotelId,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                createdAt: { gte: dedupeWindow }
            }
        });

        if (booking) {
            logger.info('BookingOrch', 'De-duplicate hit — reusing existing booking', { bookingId: booking.id });
        } else {
            booking = await prisma.booking.create({
                data: {
                    user: targetUserId ? { connect: { id: targetUserId } } : undefined,
                    hotel: { connect: { id: hotelId } },
                    room: roomId ? { connect: { id: roomId } } : undefined,
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    totalPrice: totalPrice,
                    totalGuests: 1,
                    status: isOnlinePayment ? 'held' : 'confirmed',
                    paymentStatus: isFullOnline ? 'paid' : (isDepositOnline ? 'partial' : 'pending'),
                    amountPaid: 0,
                    guestFirstName,
                    guestLastName,
                    guestEmail,
                    guestPhone,
                    roomDetails: JSON.stringify([{ id: roomId, quantity: 1 }]),
                    internalNotes: `AI_BOOKING: ${isFullOnline ? 'Full 100% Online Payment' : (isDepositOnline ? 'Online 12% Deposit' : 'Pay at Hotel confirmed')}`
                }
            });
            logger.info('BookingOrch', 'Booking created', { bookingId: booking.id, hotelId, status: booking.status });
        }

        if (isOnlinePayment) {
            let onlineDeposit = totalPrice;
            let remainingAtHotel = 0;
            if (!isFullOnline) {
                onlineDeposit = Math.max(1, Math.round(totalPrice * 0.12));
                remainingAtHotel = Math.max(0, totalPrice - onlineDeposit);
            }
            const amountToPay = Math.max(100, Math.round(onlineDeposit * 100)); // paisa

            let order = null;
            if (razorpay) {
                try {
                    const options = {
                        amount: amountToPay,
                        currency: 'INR',
                        receipt: `receipt_booking_${booking.id}`,
                    };
                    order = await razorpay.orders.create(options);
                    logger.info('BookingOrch', 'Razorpay order created', { orderId: order.id, bookingId: booking.id, amountToPay });

                    await prisma.booking.update({
                        where: { id: booking.id },
                        data: { razorpayOrderId: order.id }
                    });
                } catch (rzpErr) {
                    logger.error('BookingOrch', 'Razorpay order creation failed', { error: rzpErr.message, bookingId: booking.id });
                }
            }

            const paymentTitle = isFullOnline ? "Full 100% Online Payment" : "12% Online Deposit";
            const modifiedReply = `Excellent! I have setup your ${paymentTitle} window right here in our chat.\n\n• **Base Price**: ₹${subtotalPrice.toLocaleString()}\n• **Taxes & GST (12%)**: ₹${calculatedTaxes.toLocaleString()}\n• **Total Reservation Price**: ₹${totalPrice.toLocaleString()}\n\n• **Amount Payable Now**: ₹${onlineDeposit.toLocaleString()}\n• **Balance Payable at Check-in**: ₹${remainingAtHotel.toLocaleString()}\n\nPayment window open kar raha hoon...`;
            const action = {
                type: 'RAZORPAY_PAYMENT',
                bookingId: booking.id,
                razorpayOrderId: order ? order.id : `order_mock_${booking.id}`,
                amount: amountToPay,
                currency: 'INR',
                keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_default',
                guestName: `${guestFirstName} ${guestLastName}`,
                guestEmail,
                guestPhone,
                hotelName,
                hotelId,
                depositAmount: onlineDeposit,
                balanceAmount: remainingAtHotel,
                isFullPayment: isFullOnline
            };

            return { booking, order, action, modifiedReply };
        } else {
            // Pay at Hotel — ONLY send confirmation emails when Pay at Hotel is explicitly confirmed
            const fullBooking = await prisma.booking.findUnique({
                where: { id: booking.id },
                include: {
                    hotel: {
                        include: { user: true }
                    },
                    room: true
                }
            });
            sendBookingEmails(fullBooking).catch(err => {
                logger.error('BookingOrch', 'sendBookingEmails failed', { error: err.message, bookingId: booking.id });
            });

            const payAtHotelReply = `🎉 **Booking Confirmed!**\n\nYour reservation at **${hotelName}** is confirmed!\n• **Booking ID**: #${booking.id}\n• **Guest Name**: ${guestFirstName} ${guestLastName}\n• **Total Amount**: ₹${totalPrice.toLocaleString()} (Includes ₹${calculatedTaxes.toLocaleString()} GST)\n• **Payment Method**: Pay 100% at check-in\n\nConfirmation receipt has been delivered to **${guestEmail}**! 📧`;

            return { booking, action: null, modifiedReply: payAtHotelReply };
        }

    } catch (e) {
        logger.error('BookingOrch', 'Unhandled error in booking confirmation', { error: e.message, stack: e.stack?.split('\n').slice(0, 3).join(' | ') });
        return null;
    }
}

module.exports = {
    processAiBookingConfirmation
};
