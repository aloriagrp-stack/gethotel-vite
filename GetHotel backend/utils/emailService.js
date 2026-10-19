const nodemailer = require('nodemailer');

// Explicit hardcoded SMTP credentials for fallback if .env is missing or not loaded by cPanel Passenger
const SMTP_HOST = process.env.EMAIL_HOST || 'mail.gethotelstays.com';
const SMTP_PORT = parseInt(process.env.EMAIL_PORT || '465');
const SMTP_USER = process.env.EMAIL_USER || 'reservation@gethotelstays.com';
const SMTP_PASS = process.env.EMAIL_PASS || 'shriyanshking';
const SMTP_SECURE = process.env.EMAIL_SECURE !== undefined 
    ? (process.env.EMAIL_SECURE === 'true') 
    : (SMTP_PORT === 465);

const transporterOptions = {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
};

const transporter = nodemailer.createTransport(transporterOptions);

/**
 * Send booking confirmation emails to both customer and hotelier
 */
exports.sendBookingEmails = async (booking) => {
    try {
        const id = booking.id;
        const guestName = booking.guestName || `${booking.guestFirstName || ''} ${booking.guestLastName || ''}`.trim() || 'Valued Guest';
        const guestEmail = booking.guestEmail;
        const guestPhone = booking.guestPhone || 'N/A';
        const hotel = booking.hotel || {};
        const room = booking.room || {};
        const checkIn = booking.checkIn;
        const checkOut = booking.checkOut;
        const totalPrice = Number(booking.totalPrice) || 0;
        const amountPaid = Number(booking.amountPaid) || 0;
        const hotelEmail = hotel.email || hotel.user?.email || 'admin@gethotelstays.com';

        const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        });

        const payAtHotel = Math.max(0, totalPrice - amountPaid);

        // 1. Duration & Occupancy Metrics
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const diffMs = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
        const nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
        const days = nights + 1;

        // Calculate Room Quantity from roomDetails JSON or roomCount
        let roomCount = 1;
        try {
            const rawDetails = booking.roomDetails;
            if (rawDetails) {
                const parsed = typeof rawDetails === 'string' ? JSON.parse(rawDetails) : rawDetails;
                if (Array.isArray(parsed) && parsed.length > 0) {
                    roomCount = parsed.reduce((sum, r) => sum + (Number(r.quantity) || 1), 0);
                }
            }
        } catch (e) {
            roomCount = Number(booking.roomCount) || 1;
        }

        const totalGuests = Number(booking.totalGuests) || 2;

        // 2. Financial Metrics: Daily Rate, Subtotal, and GST
        const roomPricePerNight = Number(room.pricePerNight) || 0;
        let gstPercent = 5;
        if (roomPricePerNight > 7500) {
            gstPercent = 18;
        } else if (roomPricePerNight > 0 && roomPricePerNight <= 1000) {
            gstPercent = 0;
        } else {
            gstPercent = 5;
        }

        const totalRoomNights = roomCount * nights;
        let basePricePerNight = roomPricePerNight;
        let calculatedBaseTotal = basePricePerNight * totalRoomNights;
        let calculatedTaxAmount = Math.round(calculatedBaseTotal * (gstPercent / 100));

        // Reconcile with totalPrice if applicable
        if (totalPrice > 0 && Math.abs((calculatedBaseTotal + calculatedTaxAmount) - totalPrice) > 2) {
            calculatedBaseTotal = Math.round(totalPrice / (1 + (gstPercent / 100)));
            calculatedTaxAmount = totalPrice - calculatedBaseTotal;
            basePricePerNight = Math.round(calculatedBaseTotal / totalRoomNights) || basePricePerNight;
        }

        let customerPaymentDetailsHtml = "";
        let hotelierActionHtml = "";

        if (amountPaid === 0) {
            // Pay Full at Hotel
            customerPaymentDetailsHtml = `
                                <tr style="border-top: 1px solid #f1f5f9;">
                                    <td style="padding: 12px 0; vertical-align: middle;">
                                        <span style="font-size: 13px; color: #64748b; font-weight: 700; display: block;">Paid Online</span>
                                    </td>
                                    <td style="padding: 12px 0; text-align: right; vertical-align: middle;">
                                        <span style="background-color: #f1f5f9; color: #64748b; font-size: 13px; font-weight: 800; padding: 4px 10px; border-radius: 8px; display: inline-block;">₹0 (Paid)</span>
                                    </td>
                                </tr>
                                <tr style="border-top: 1px solid #f1f5f9;">
                                    <td style="padding: 12px 0; vertical-align: middle;">
                                        <span style="font-size: 13px; color: #b45309; font-weight: 800; display: block;">Pay at Hotel</span>
                                        <span style="font-size: 10px; color: #64748b; font-weight: 600;">100% Due at Check-in</span>
                                    </td>
                                    <td style="padding: 12px 0; text-align: right; vertical-align: middle;">
                                        <span style="background-color: #fffbeb; color: #b45309; font-size: 14px; font-weight: 900; padding: 4px 10px; border-radius: 8px; display: inline-block;">₹${totalPrice.toLocaleString()} (Due)</span>
                                    </td>
                                </tr>
            `;

            hotelierActionHtml = `
                        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 16px; padding: 22px; margin-top: 25px;">
                            <h4 style="margin: 0 0 8px 0; color: #b45309; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">⚠️ Payment Collection Action</h4>
                            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #78350f; font-weight: 600;">
                                The customer has selected the <strong>Pay Full at Hotel</strong> option. Nothing has been paid online. 
                                Please collect the full 100% amount of <strong>₹${totalPrice.toLocaleString()}</strong> directly from the guest at check-in.
                            </p>
                        </div>
            `;
        } else if (amountPaid >= totalPrice) {
            // Paid Fully Online
            customerPaymentDetailsHtml = `
                                <tr style="border-top: 1px solid #f1f5f9;">
                                    <td style="padding: 12px 0; vertical-align: middle;">
                                        <span style="font-size: 13px; color: #10b981; font-weight: 800; display: block;">Paid Fully Online</span>
                                    </td>
                                    <td style="padding: 12px 0; text-align: right; vertical-align: middle;">
                                        <span style="background-color: #ecfdf5; color: #059669; font-size: 13px; font-weight: 900; padding: 4px 10px; border-radius: 8px; display: inline-block;">₹${amountPaid.toLocaleString()} (Paid)</span>
                                    </td>
                                </tr>
                                <tr style="border-top: 1px solid #f1f5f9;">
                                    <td style="padding: 12px 0; vertical-align: middle;">
                                        <span style="font-size: 13px; color: #3b82f6; font-weight: 800; display: block;">Pay at Hotel</span>
                                        <span style="font-size: 10px; color: #64748b; font-weight: 600;">No balance due</span>
                                    </td>
                                    <td style="padding: 12px 0; text-align: right; vertical-align: middle;">
                                        <span style="background-color: #eff6ff; color: #1d4ed8; font-size: 13px; font-weight: 800; padding: 4px 10px; border-radius: 8px; display: inline-block;">₹0 (Due)</span>
                                    </td>
                                </tr>
            `;

            hotelierActionHtml = `
                        <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 16px; padding: 22px; margin-top: 25px;">
                            <h4 style="margin: 0 0 8px 0; color: #065f46; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">✅ Fully Paid Online</h4>
                            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #065f46; font-weight: 600;">
                                The customer has paid the entire amount (<strong>₹${amountPaid.toLocaleString()}</strong>) online. 
                                No balance payment needs to be collected from the guest at check-in.
                            </p>
                        </div>
            `;
        } else {
            // Paid 12% Deposit Online
            customerPaymentDetailsHtml = `
                                <tr style="border-top: 1px solid #f1f5f9;">
                                    <td style="padding: 12px 0; vertical-align: middle;">
                                        <span style="font-size: 13px; color: #10b981; font-weight: 800; display: block;">Paid Online</span>
                                        <span style="font-size: 10px; color: #64748b; font-weight: 600;">Booking Fee / Deposit</span>
                                    </td>
                                    <td style="padding: 12px 0; text-align: right; vertical-align: middle;">
                                        <span style="background-color: #ecfdf5; color: #059669; font-size: 13px; font-weight: 900; padding: 4px 10px; border-radius: 8px; display: inline-block;">₹${amountPaid.toLocaleString()} (Paid)</span>
                                    </td>
                                </tr>
                                <tr style="border-top: 1px solid #f1f5f9;">
                                    <td style="padding: 12px 0; vertical-align: middle;">
                                        <span style="font-size: 13px; color: #3b82f6; font-weight: 800; display: block;">Pay at Hotel</span>
                                        <span style="font-size: 10px; color: #64748b; font-weight: 600;">Balance Due at Check-in</span>
                                    </td>
                                    <td style="padding: 12px 0; text-align: right; vertical-align: middle;">
                                        <span style="background-color: #eff6ff; color: #1d4ed8; font-size: 13px; font-weight: 800; padding: 4px 10px; border-radius: 8px; display: inline-block;">₹${payAtHotel.toLocaleString()} (Due)</span>
                                    </td>
                                </tr>
            `;

            hotelierActionHtml = `
                        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 16px; padding: 22px; margin-top: 25px;">
                            <h4 style="margin: 0 0 8px 0; color: #b45309; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">⚠️ Payment Collection Action</h4>
                            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #78350f; font-weight: 600;">
                                The customer has paid an online deposit (<strong>₹${amountPaid.toLocaleString()}</strong>). 
                                Please collect the remaining balance of <strong>₹${payAtHotel.toLocaleString()}</strong> directly from the guest at check-in.
                            </p>
                        </div>
            `;
        }

        // =========================================================================
        // 1. EMAIL TO CUSTOMER (Luxury Stay Ticket with Full Breakdown)
        // =========================================================================
        const customerMailOptions = {
            from: `"GetHotelStays" <${SMTP_USER}>`,
            to: guestEmail,
            subject: `Booking Confirmed: ${hotel.name} (#GH-${id + 10000})`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                    <div style="background-color: #0f172a; background-image: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 45px 35px; text-align: center;">
                        <span style="font-size: 11px; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 3px; display: block; margin-bottom: 10px;">GETHOTELSTAYS</span>
                        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Booking Confirmed</h1>
                        <p style="color: #94a3b8; font-size: 13px; font-weight: 500; margin: 8px 0 0 0;">Booking ID: #GH-${id + 10000}</p>
                    </div>
                    
                    <div style="padding: 35px 30px; background-color: #ffffff;">
                        <p style="font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px;">Hi ${guestName},</p>
                        <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 25px;">Your reservation is confirmed! Below are your complete stay and billing details:</p>
                        
                        <!-- Stay Details -->
                        <div style="border: 1px solid #f1f5f9; border-radius: 20px; background-color: #f8fafc; padding: 25px; margin-bottom: 25px;">
                            <span style="font-size: 10px; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 6px;">Your Destination</span>
                            <h2 style="font-size: 20px; font-weight: 900; color: #0f172a; margin: 0 0 4px 0; text-transform: uppercase;">${hotel.name}</h2>
                            <p style="font-size: 12px; font-weight: 700; color: #64748b; margin: 0 0 20px 0;">📍 ${hotel.address || 'India'}, ${hotel.city || ''}</p>
                            
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                <tr>
                                    <td style="width: 50%; padding-right: 15px; vertical-align: top;">
                                        <span style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 4px;">Check-In</span>
                                        <strong style="font-size: 13px; font-weight: 800; color: #0f172a;">${formatDate(checkIn)}</strong>
                                    </td>
                                    <td style="width: 50%; padding-left: 15px; border-left: 1px solid #e2e8f0; vertical-align: top;">
                                        <span style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 4px;">Check-Out</span>
                                        <strong style="font-size: 13px; font-weight: 800; color: #0f172a;">${formatDate(checkOut)}</strong>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="border-top: 1px dashed #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between;">
                                <div>
                                    <span style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 2px;">Room & Stay Duration</span>
                                    <span style="font-size: 14px; font-weight: 800; color: #0f172a;">${room.name} (${roomCount} Room${roomCount > 1 ? 's' : ''})</span>
                                </div>
                                <div style="text-align: right;">
                                    <span style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 2px;">Duration & Occupancy</span>
                                    <span style="font-size: 13px; font-weight: 800; color: #3b82f6;">${nights} Night${nights > 1 ? 's' : ''} / ${days} Days &bull; ${totalGuests} Guest${totalGuests > 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Financial Breakdown -->
                        <div style="border: 1px solid #f1f5f9; border-radius: 20px; padding: 25px; margin-bottom: 25px; background-color: #ffffff;">
                            <span style="font-size: 10px; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 12px;">Tariff & Tax Breakdown</span>
                            
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">Daily Rate per Room</td>
                                    <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">₹${basePricePerNight.toLocaleString()} / night</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">Room Charges (${roomCount} Room &times; ${nights} Night${nights > 1 ? 's' : ''})</td>
                                    <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">₹${calculatedBaseTotal.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">Taxes & GST (${gstPercent}% GST)</td>
                                    <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">₹${calculatedTaxAmount.toLocaleString()}</td>
                                </tr>
                                <tr style="border-top: 1.5px solid #0f172a;">
                                    <td style="padding: 12px 0 8px 0; font-size: 14px; font-weight: 800; color: #0f172a;">Total Stay Amount</td>
                                    <td style="padding: 12px 0 8px 0; font-size: 16px; font-weight: 900; color: #0f172a; text-align: right;">₹${totalPrice.toLocaleString()}</td>
                                </tr>
                                ${customerPaymentDetailsHtml}
                            </table>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0 15px 0;">
                            <a href="https://gethotelstays.com/my-bookings" style="background-color: #0f172a; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block;">Manage Booking</a>
                        </div>
                    </div>
                    
                    <div style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #f1f5f9;">
                        <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0; font-weight: 600;">Need assistance? Contact our 24/7 concierge at <a href="mailto:support@gethotelstays.com" style="color: #3b82f6; text-decoration: none; font-weight: 700;">support@gethotelstays.com</a></p>
                    </div>
                </div>
            `
        };

        // =========================================================================
        // 2. EMAIL TO HOTELIER / PARTNER (Sent from reservation@gethotelstays.com)
        // =========================================================================
        const hotelierMailOptions = {
            from: `"GetHotel Reservations" <${SMTP_USER}>`,
            to: hotelEmail,
            subject: `New Booking Alert: ${guestName} - ${hotel.name} (#GH-${id + 10000})`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                    <div style="background-color: #2563eb; background-image: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
                        <span style="font-size: 10px; font-weight: 900; color: #93c5fd; text-transform: uppercase; letter-spacing: 3px; display: block; margin-bottom: 8px;">GETHOTEL PARTNER NETWORK</span>
                        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">New Booking Received</h2>
                    </div>
                    
                    <div style="padding: 35px 30px;">
                        <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 8px;">Hi Partner,</p>
                        <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 25px;">You have received a new confirmed reservation for <strong>${hotel.name}</strong>. Complete stay and payment details are provided below:</p>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Booking ID</td>
                                <td style="padding: 10px 0; font-weight: 900; font-size: 14px; color: #0f172a; text-align: right;">#GH-${id + 10000}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Customer Name</td>
                                <td style="padding: 10px 0; font-weight: 800; font-size: 14px; color: #0f172a; text-align: right;">${guestName}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Guest Contact</td>
                                <td style="padding: 10px 0; font-weight: 800; font-size: 14px; color: #0f172a; text-align: right;">${guestPhone} <br/><span style="font-size: 11px; color: #64748b;">${guestEmail}</span></td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Stay Dates</td>
                                <td style="padding: 10px 0; font-weight: 800; font-size: 13px; color: #0f172a; text-align: right;">${formatDate(checkIn)} &rarr; ${formatDate(checkOut)}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Stay Duration</td>
                                <td style="padding: 10px 0; font-weight: 800; font-size: 13px; color: #2563eb; text-align: right;">${nights} Night${nights > 1 ? 's' : ''} / ${days} Days</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Rooms & Guests</td>
                                <td style="padding: 10px 0; font-weight: 800; font-size: 13px; color: #0f172a; text-align: right;">${roomCount} Room${roomCount > 1 ? 's' : ''} &bull; ${totalGuests} Guest${totalGuests > 1 ? 's' : ''}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Room Type</td>
                                <td style="padding: 10px 0; font-weight: 800; font-size: 13px; color: #0f172a; text-align: right; text-transform: uppercase;">${room.name}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Daily Room Rate</td>
                                <td style="padding: 10px 0; font-weight: 700; font-size: 13px; color: #0f172a; text-align: right;">₹${basePricePerNight.toLocaleString()} / night</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Applicable Taxes (${gstPercent}% GST)</td>
                                <td style="padding: 10px 0; font-weight: 700; font-size: 13px; color: #0f172a; text-align: right;">₹${calculatedTaxAmount.toLocaleString()}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Total Stay Charges</td>
                                <td style="padding: 10px 0; font-weight: 900; font-size: 16px; color: #0f172a; text-align: right;">₹${totalPrice.toLocaleString()}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Paid Online by Guest</td>
                                <td style="padding: 10px 0; font-weight: 800; font-size: 14px; color: #16a34a; text-align: right;">₹${amountPaid.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">To Collect at Check-in</td>
                                <td style="padding: 10px 0; font-weight: 900; font-size: 15px; color: #b45309; text-align: right;">₹${payAtHotel.toLocaleString()}</td>
                            </tr>
                        </table>
                        
                        ${hotelierActionHtml}
                    </div>
                    
                    <div style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #f1f5f9;">
                        <p style="font-size: 12px; color: #94a3b8; margin: 0; font-weight: 600;">GetHotelStays Partner Helpdesk: reservation@gethotelstays.com</p>
                    </div>
                </div>
            `
        };

        // =========================================================================
        // DISPATCH PARTNER EMAIL & TRACK REAL-TIME DELIVERY STATUS
        // =========================================================================
        let partnerDelivery = {
            delivered: false,
            messageId: null,
            response: null,
            error: null,
            recipient: hotelEmail,
            timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };

        try {
            const partnerResult = await transporter.sendMail(hotelierMailOptions);
            partnerDelivery.delivered = true;
            partnerDelivery.messageId = partnerResult.messageId;
            partnerDelivery.response = partnerResult.response;
            console.log(`[SMTP SUCCESS] Partner email successfully delivered to ${hotelEmail} (MsgID: ${partnerResult.messageId})`);
        } catch (partnerErr) {
            partnerDelivery.delivered = false;
            partnerDelivery.error = partnerErr.message || String(partnerErr);
            console.error(`[SMTP ERROR] Partner booking email FAILED for ${hotelEmail}:`, partnerErr);
        }

        // Send Customer Email
        transporter.sendMail(customerMailOptions).catch(err => {
            console.error("Failed to send customer confirmation email:", err);
        });

        // Audit log in Booking internalNotes for admin visibility
        if (id) {
            try {
                const prisma = require('../config/db');
                const auditLine = `\n[Partner Email Audit - ${partnerDelivery.timestamp}]: ${hotelEmail} -> ${partnerDelivery.delivered ? 'DELIVERED (Accepted by SMTP)' : 'FAILED (' + partnerDelivery.error + ')'}`;
                const currentBooking = await prisma.booking.findUnique({ where: { id }, select: { internalNotes: true } });
                await prisma.booking.update({
                    where: { id },
                    data: {
                        internalNotes: (currentBooking?.internalNotes || '') + auditLine
                    }
                });
            } catch (auditDbErr) {
                console.warn("Could not save email audit to booking notes:", auditDbErr.message);
            }
        }

        // =========================================================================
        // 3. EMAIL TO ALORIA GROUP HQ (With Partner Delivery Verification)
        // =========================================================================
        const aloriaEmail = process.env.ALORIA_GROUP_EMAIL || process.env.ADMIN_EMAIL || 'aloriagrp@gmail.com';
        const supportSender = process.env.SUPPORT_EMAIL || 'support@gethotelstays.com';
        const controlHubUrl = (process.env.FRONTEND_URL || 'https://gethotelstays.com') + '/controlhub/bookings';

        if (aloriaEmail) {
            // Visual badge for partner delivery
            const partnerDeliveryBadgeHtml = partnerDelivery.delivered
                ? `
                    <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 16px; padding: 18px 20px; margin-bottom: 25px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="vertical-align: middle;">
                                    <span style="font-size: 10px; font-weight: 900; color: #16a34a; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 3px;">Partner Email Delivery</span>
                                    <strong style="font-size: 15px; color: #15803d; font-weight: 900;">✅ Successfully Delivered to Hotelier</strong>
                                </td>
                                <td style="text-align: right; vertical-align: middle;">
                                    <span style="background-color: #dcfce7; color: #15803d; font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 8px;">ACCEPTED BY SMTP</span>
                                </td>
                            </tr>
                        </table>
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #bbf7d0; font-size: 12px; color: #166534; line-height: 1.5;">
                            <strong>Recipient:</strong> ${hotelEmail}<br/>
                            <strong>Dispatched From:</strong> ${SMTP_USER} (Reservation Desk)<br/>
                            <strong>SMTP Server Response:</strong> <code style="font-family: monospace; font-size: 11px; background: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #bbf7d0;">${partnerDelivery.response || '250 OK - Queued'}</code>
                        </div>
                    </div>
                `
                : `
                    <div style="background-color: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 16px; padding: 18px 20px; margin-bottom: 25px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="vertical-align: middle;">
                                    <span style="font-size: 10px; font-weight: 900; color: #dc2626; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 3px;">Partner Email Delivery</span>
                                    <strong style="font-size: 15px; color: #b91c1c; font-weight: 900;">❌ Delivery FAILED to Hotelier</strong>
                                </td>
                                <td style="text-align: right; vertical-align: middle;">
                                    <span style="background-color: #fee2e2; color: #b91c1c; font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 8px;">NOT DELIVERED</span>
                                </td>
                            </tr>
                        </table>
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #fecaca; font-size: 12px; color: #991b1b; line-height: 1.5;">
                            <strong>Target Recipient:</strong> ${hotelEmail}<br/>
                            <strong>Error Detail:</strong> <code style="font-family: monospace; font-size: 11px; background: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #fecaca;">${partnerDelivery.error}</code><br/>
                            <strong style="color: #7f1d1d; display: block; margin-top: 6px;">⚠️ Action Required: Please call hotelier at ${hotel.phone || hotel.user?.phone || 'registered partner phone'} to notify them manually!</strong>
                        </div>
                    </div>
                `;

            const aloriaSubject = partnerDelivery.delivered
                ? `🛎️ [New Booking Received] #GH-${id + 10000} | ${hotel.name} | ₹${totalPrice.toLocaleString()} (Partner: ✅ Delivered)`
                : `🚨 [ACTION REQUIRED: Partner Mail Failed] #GH-${id + 10000} | ${hotel.name} | ₹${totalPrice.toLocaleString()}`;

            const aloriaMailOptions = {
                from: `"GetHotel Support" <${supportSender}>`,
                to: aloriaEmail,
                subject: aloriaSubject,
                html: `
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                        <div style="background-color: #0f172a; background-image: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 35px; text-align: center;">
                            <span style="font-size: 11px; font-weight: 900; color: #38bdf8; text-transform: uppercase; letter-spacing: 3px; display: block; margin-bottom: 8px;">GETHOTELSTAYS • HQ OPERATIONS</span>
                            <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.5px;">New Booking Received</h2>
                            <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0 0;">gethotelstays.com Automated Alert</p>
                        </div>

                        <div style="padding: 35px 30px;">
                            ${partnerDeliveryBadgeHtml}

                            <!-- Full Booking Breakdown Table -->
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Booking ID</td>
                                    <td style="padding: 10px 0; font-weight: 900; font-size: 14px; color: #0f172a; text-align: right;">#GH-${id + 10000}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Hotel / Property</td>
                                    <td style="padding: 10px 0; font-weight: 800; font-size: 14px; color: #0f172a; text-align: right;">${hotel.name} <span style="font-size: 12px; color: #64748b; display: block;">📍 ${hotel.city || 'India'}</span></td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Partner Contact</td>
                                    <td style="padding: 10px 0; font-weight: 700; font-size: 13px; color: #0f172a; text-align: right;">${hotelEmail}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Guest Details</td>
                                    <td style="padding: 10px 0; font-weight: 800; font-size: 14px; color: #0f172a; text-align: right;">${guestName} <span style="font-size: 12px; font-weight: 600; color: #64748b; display: block;">📞 ${guestPhone} &bull; ${guestEmail}</span></td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Check-In & Check-Out</td>
                                    <td style="padding: 10px 0; font-weight: 700; font-size: 13px; color: #0f172a; text-align: right;">${formatDate(checkIn)} &rarr; ${formatDate(checkOut)}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Duration</td>
                                    <td style="padding: 10px 0; font-weight: 800; font-size: 13px; color: #0284c7; text-align: right;">${nights} Night${nights > 1 ? 's' : ''} / ${days} Days</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Rooms & Guests</td>
                                    <td style="padding: 10px 0; font-weight: 800; font-size: 13px; color: #0f172a; text-align: right;">${roomCount} Room${roomCount > 1 ? 's' : ''} &bull; ${totalGuests} Guest${totalGuests > 1 ? 's' : ''}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Room Type</td>
                                    <td style="padding: 10px 0; font-weight: 800; font-size: 13px; color: #0f172a; text-align: right; text-transform: uppercase;">${room.name}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Daily Rate per Room</td>
                                    <td style="padding: 10px 0; font-weight: 700; font-size: 13px; color: #0f172a; text-align: right;">₹${basePricePerNight.toLocaleString()} / night</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Taxes (${gstPercent}% GST)</td>
                                    <td style="padding: 10px 0; font-weight: 700; font-size: 13px; color: #0f172a; text-align: right;">₹${calculatedTaxAmount.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Total Stay Charges</td>
                                    <td style="padding: 10px 0; font-weight: 900; font-size: 16px; color: #0f172a; text-align: right;">₹${totalPrice.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Paid Online</td>
                                    <td style="padding: 10px 0; font-weight: 800; font-size: 13px; color: #16a34a; text-align: right;">₹${amountPaid.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Due at Hotel</td>
                                    <td style="padding: 10px 0; font-weight: 800; font-size: 13px; color: #d97706; text-align: right;">₹${payAtHotel.toLocaleString()}</td>
                                </tr>
                            </table>

                            <div style="text-align: center; margin: 30px 0 10px 0;">
                                <a href="${controlHubUrl}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 13px; display: inline-block; letter-spacing: 0.5px;">View in ControlHub Admin</a>
                            </div>
                        </div>

                        <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #f1f5f9;">
                            <p style="font-size: 11px; color: #94a3b8; margin: 0; font-weight: 600;">GetHotelStays Enterprise Automated Notification System &bull; Aloria Group</p>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(aloriaMailOptions).catch(err => {
                console.error("Error sending booking email to Aloria Group:", err);
            });
        }

        console.log("Booking email dispatch cycle completed.");
    } catch (error) {
        console.error("Failed to process booking emails:", error);
    }
};

exports.sendOtpEmail = async (email, name, otp) => {
    try {
        const mailOptions = {
            from: `"GetHotelStays Security" <${SMTP_USER}>`,
            to: email,
            subject: `Your GetHotelStays OTP: ${otp}`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                    <div style="background-color: #0f172a; padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Verify Your Email</h1>
                    </div>
                    <div style="padding: 40px;">
                        <p style="font-size: 16px; font-weight: 800; color: #0f172a;">Hi ${name},</p>
                        <p style="font-size: 14px; color: #64748b; font-weight: 500; margin-bottom: 30px;">Please use the following 6-digit One-Time Password (OTP) to complete your account registration:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="background-color: #f1f5f9; color: #3b82f6; font-size: 32px; font-weight: 900; padding: 15px 30px; border-radius: 16px; letter-spacing: 8px;">${otp}</span>
                        </div>
                        <p style="font-size: 12px; font-weight: 600; color: #94a3b8; text-align: center;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}`);
    } catch (error) {
        console.error("Failed to send OTP email:", error);
        throw error;
    }
};

exports.sendResetEmail = async (email, name, resetUrl) => {
    try {
        const mailOptions = {
            from: `"GetHotelStays Security" <${SMTP_USER}>`,
            to: email,
            subject: `Reset Your GetHotelStays Password`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                    <div style="background-color: #0f172a; padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Reset Password</h1>
                    </div>
                    <div style="padding: 40px;">
                        <p style="font-size: 16px; font-weight: 800; color: #0f172a;">Hi ${name},</p>
                        <p style="font-size: 14px; color: #64748b; font-weight: 500; margin-bottom: 30px;">You are receiving this email because you (or someone else) requested a password reset for your account. Please click the button below to set a new password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background-color: #3b82f6; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; display: inline-block; box-shadow: 0 5px 15px rgba(59,130,246,0.3);">Reset Password</a>
                        </div>
                        <p style="font-size: 12px; font-weight: 600; color: #94a3b8; text-align: center;">This link is valid for 15 minutes. If you did not request this, please ignore this email.</p>
                        <p style="font-size: 11px; font-weight: 500; color: #cbd5e1; text-align: center; word-break: break-all; margin-top: 20px;">If the button above does not work, copy and paste this link: ${resetUrl}</p>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
    } catch (error) {
        console.error("Failed to send password reset email:", error);
        throw error;
    }
};
