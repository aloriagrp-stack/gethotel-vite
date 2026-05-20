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
        const { id, guestName, guestEmail, guestPhone, hotel, room, checkIn, checkOut, totalPrice, amountPaid } = booking;
        const hotelEmail = hotel.email || hotel.user?.email || 'admin@gethotelstays.com';
        
        const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        });

        const payAtHotel = totalPrice - amountPaid;

        // 1. EMAIL TO CUSTOMER (Luxury Stay Ticket)
        const customerMailOptions = {
            from: `"GetHotelStays" <${SMTP_USER}>`,
            to: guestEmail,
            subject: `Booking Confirmed: ${hotel.name}`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                    <!-- Glowing Slate Header -->
                    <div style="background-color: #0f172a; background-image: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 50px 40px; text-align: center;">
                        <span style="font-size: 11px; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 3px; display: block; margin-bottom: 12px;">GETHOTELSTAYS</span>
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Booking Confirmed</h1>
                        <p style="color: #94a3b8; font-size: 14px; font-weight: 500; margin: 10px 0 0 0;">Booking ID: #GH-${id + 10000}</p>
                    </div>
                    
                    <div style="padding: 40px; background-color: #ffffff;">
                        <p style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 10px;">Hi ${guestName},</p>
                        <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 30px; font-weight: 500;">Your luxury reservation has been confirmed. Pack your bags for a remarkable experience at your handpicked destination!</p>
                        
                        <!-- Elegant Stay details Card -->
                        <div style="border: 1px solid #f1f5f9; border-radius: 20px; background-color: #f8fafc; padding: 30px; margin-bottom: 35px;">
                            <span style="font-size: 10px; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 6px;">Your Destination</span>
                            <h2 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0 0 6px 0; text-transform: uppercase;">${hotel.name}</h2>
                            <p style="font-size: 13px; font-weight: 700; color: #64748b; margin: 0 0 25px 0;">📍 ${hotel.address || 'India'}, ${hotel.city || ''}</p>
                            
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                                <tr>
                                    <td style="width: 50%; padding-right: 15px; vertical-align: top;">
                                        <span style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 6px;">Check-In</span>
                                        <strong style="font-size: 14px; font-weight: 800; color: #0f172a;">${formatDate(checkIn)}</strong>
                                    </td>
                                    <td style="width: 50%; padding-left: 15px; border-left: 1px solid #e2e8f0; vertical-align: top;">
                                        <span style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 6px;">Check-Out</span>
                                        <strong style="font-size: 14px; font-weight: 800; color: #0f172a;">${formatDate(checkOut)}</strong>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="border-top: 1px dashed #e2e8f0; padding-top: 20px;">
                                <span style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 4px;">Room Selected</span>
                                <span style="font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase;">${room.name}</span>
                            </div>
                        </div>
                        
                        <!-- Elegant Financial Summary -->
                        <div style="border: 1px solid #f1f5f9; border-radius: 20px; padding: 30px; margin-bottom: 35px; background-color: #ffffff;">
                            <span style="font-size: 10px; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 15px;">Payment Breakdown</span>
                            
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; font-size: 14px; color: #64748b; font-weight: 600;">Total Stay Charges</td>
                                    <td style="padding: 10px 0; font-size: 16px; font-weight: 800; color: #0f172a; text-align: right;">₹${totalPrice.toLocaleString()}</td>
                                </tr>
                                <tr style="border-top: 1px solid #f1f5f9;">
                                    <td style="padding: 15px 0 10px 0; vertical-align: middle;">
                                        <span style="font-size: 14px; color: #10b981; font-weight: 800; display: block;">Paid Online</span>
                                        <span style="font-size: 10px; color: #64748b; font-weight: 600;">18% Booking Fee</span>
                                    </td>
                                    <td style="padding: 15px 0 10px 0; text-align: right; vertical-align: middle;">
                                        <span style="background-color: #ecfdf5; color: #059669; font-size: 14px; font-weight: 900; padding: 6px 12px; border-radius: 10px; display: inline-block;">₹${amountPaid.toLocaleString()} (Paid)</span>
                                    </td>
                                </tr>
                                <tr style="border-top: 1px solid #f1f5f9;">
                                    <td style="padding: 15px 0 0 0; vertical-align: middle;">
                                        <span style="font-size: 14px; color: #3b82f6; font-weight: 800; display: block;">Pay at Hotel</span>
                                        <span style="font-size: 10px; color: #64748b; font-weight: 600;">82% Due at Check-in</span>
                                    </td>
                                    <td style="padding: 15px 0 0 0; text-align: right; vertical-align: middle;">
                                        <span style="background-color: #eff6ff; color: #1d4ed8; font-size: 14px; font-weight: 900; padding: 6px 12px; border-radius: 10px; display: inline-block;">₹${payAtHotel.toLocaleString()} (Due)</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                        <!-- Action CTA Button -->
                        <div style="text-align: center; margin: 40px 0 20px 0;">
                            <a href="https://gethotelstays.com/my-bookings" style="background-color: #0f172a; color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 16px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; box-shadow: 0 10px 20px rgba(15,23,42,0.15); transition: all 0.3s ease;">Manage Booking</a>
                        </div>
                    </div>
                    
                    <!-- Footer Section -->
                    <div style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
                        <p style="font-size: 13px; color: #64748b; margin: 0 0 10px 0; font-weight: 600;">Have questions or need modifications to your stay?</p>
                        <p style="font-size: 12px; color: #94a3b8; margin: 0; font-weight: 500;">Connect with our support team at <a href="mailto:support@gethotelstays.com" style="color: #3b82f6; text-decoration: none; font-weight: 700;">support@gethotelstays.com</a></p>
                    </div>
                </div>
            `
        };

        // 2. EMAIL TO HOTELIER (Partner Alert Details)
        const hotelierMailOptions = {
            from: `"Booking Alert" <${SMTP_USER}>`,
            to: hotelEmail,
            subject: `New Booking Alert: ${guestName} - ${hotel.name}`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                    <!-- Elegant Blue Header -->
                    <div style="background-color: #2563eb; background-image: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
                        <span style="font-size: 10px; font-weight: 900; color: #93c5fd; text-transform: uppercase; letter-spacing: 3px; display: block; margin-bottom: 8px;">GETHOTEL PARTNER</span>
                        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">New Booking Received</h2>
                    </div>
                    
                    <div style="padding: 45px 40px;">
                        <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 8px;">Hi Partner,</p>
                        <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 30px;">You have received a new luxury reservation for <strong>${hotel.name}</strong>. Here are the reservation and payment details:</p>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600;">Booking ID</td>
                                <td style="padding: 12px 0; font-weight: 800; font-size: 14px; color: #0f172a; text-align: right;">#GH-${id + 10000}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600;">Customer Name</td>
                                <td style="padding: 12px 0; font-weight: 800; font-size: 14px; color: #0f172a; text-align: right;">${guestName}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600;">Guest Contact</td>
                                <td style="padding: 12px 0; font-weight: 800; font-size: 14px; color: #0f172a; text-align: right;">${guestPhone || 'N/A'}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600;">Check-In Date</td>
                                <td style="padding: 12px 0; font-weight: 800; font-size: 14px; color: #0f172a; text-align: right;">${formatDate(checkIn)}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600;">Check-Out Date</td>
                                <td style="padding: 12px 0; font-weight: 800; font-size: 14px; color: #0f172a; text-align: right;">${formatDate(checkOut)}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600;">Room Type</td>
                                <td style="padding: 12px 0; font-weight: 800; font-size: 14px; color: #0f172a; text-align: right; text-transform: uppercase;">${room.name}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600;">Total Stays Value</td>
                                <td style="padding: 12px 0; font-weight: 800; font-size: 15px; color: #0f172a; text-align: right;">₹${totalPrice.toLocaleString()}</td>
                            </tr>
                        </table>
                        
                        <!-- Action Alert for Pay at Hotel Collection -->
                        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 16px; padding: 25px; margin-top: 30px;">
                            <h4 style="margin: 0 0 8px 0; color: #b45309; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">⚠️ Payment Collection Action</h4>
                            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #78350f; font-weight: 600;">
                                The customer has successfully paid the 18% Booking Fee (<strong>₹${amountPaid.toLocaleString()}</strong>) online. 
                                Please collect the remaining 82% <strong>₹${payAtHotel.toLocaleString()}</strong> directly from the guest at the hotel during check-in.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer Section -->
                    <div style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
                        <p style="font-size: 12px; color: #94a3b8; margin: 0; font-weight: 600;">GetHotelStays Portal Support: partner@gethotelstays.com</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(customerMailOptions);
        await transporter.sendMail(hotelierMailOptions);
        console.log("Booking emails sent successfully.");
    } catch (error) {
        console.error("Failed to send booking emails:", error);
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
