const prisma = require('../config/db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Submit a partner registration request
// @route   POST /api/partner/request
// @access  Public
// @desc    Submit a partner registration request
// @route   POST /api/partner/request
// @access  Public
exports.submitPartnerRequest = async (req, res, next) => {
    try {
        const { 
            hotelName, hotelUsername, tagline, description, address, city, 
            pricePerNight, userName, userEmail, userPhone, partnerPassword,
            propertyType, totalRooms, hotelAmenities, hotelImages, minPrice, maxPrice, rooms
        } = req.body;

        // 1. Check if email already exists in User table AND is already a partner
        const existingUser = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (existingUser && existingUser.role === 'hotel_admin') {
            return res.status(400).json({ 
                success: false, 
                error: 'This Email is already in use by a registered Partner.' 
            });
        }

        // 2. Check if there's already a pending/approved request with this email OR phone
        const existingRequest = await prisma.partnerrequest.findFirst({
            where: {
                OR: [
                    { userEmail: userEmail },
                    { userPhone: userPhone }
                ]
            }
        });

        if (existingRequest) {
            const isEmailMatch = existingRequest.userEmail === userEmail;
            return res.status(400).json({ 
                success: false, 
                error: isEmailMatch 
                    ? 'This Email is already in use.' 
                    : 'This Phone Number is already in use.'
            });
        }

        // 3. Create or Update User Account to hotel_admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(partnerPassword, salt);

        let targetUser = existingUser;
        if (!targetUser) {
            targetUser = await prisma.user.create({
                data: {
                    name: userName || "Partner",
                    email: userEmail,
                    password: hashedPassword,
                    role: 'hotel_admin'
                }
            });
        } else {
            targetUser = await prisma.user.update({
                where: { email: userEmail },
                data: {
                    name: userName || targetUser.name,
                    password: hashedPassword,
                    role: 'hotel_admin'
                }
            });
        }

        // 4. Serialize rich onboarding details into description
        const extraPayload = {
            propertyType: propertyType || 'Boutique & City Hotel',
            totalRooms: totalRooms ? parseInt(totalRooms) : 1,
            hotelAmenities: Array.isArray(hotelAmenities) ? hotelAmenities : [],
            hotelImages: Array.isArray(hotelImages) ? hotelImages : [],
            minPrice: minPrice ? parseFloat(minPrice) : (parseFloat(pricePerNight) || 0),
            maxPrice: maxPrice ? parseFloat(maxPrice) : ((parseFloat(pricePerNight) || 0) * 2),
            rooms: Array.isArray(rooms) ? rooms : [],
            summary: description || `Welcome to ${hotelName || 'our hotel'}.`
        };

        const serializedDescription = JSON.stringify(extraPayload);

        // 5. Create Partner Request linked to User
        const partnerRequest = await prisma.partnerrequest.create({
            data: {
                hotelName: hotelName || "Unnamed Hotel",
                hotelUsername: hotelUsername || `hotel_${Date.now()}`,
                tagline: tagline || "",
                description: serializedDescription,
                address: address || "",
                city: city || "",
                pricePerNight: isNaN(parseFloat(pricePerNight)) ? 0 : parseFloat(pricePerNight),
                userName: userName || "Partner",
                userEmail: userEmail || "",
                userPhone: userPhone || "",
                partnerPassword: partnerPassword || "", // Kept for admin reference
                status: 'pending',
                updatedAt: new Date()
            }
        });

        // 6. Generate Token
        const token = jwt.sign({ id: targetUser.id }, process.env.JWT_SECRET || 'gethotel_default_secret', {
            expiresIn: '30d',
        });

        const cookieOptions = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        };

        // 7. Send Immediate Submission Confirmation Email to Host
        try {
            const SMTP_HOST = process.env.EMAIL_HOST || 'mail.gethotelstays.com';
            const SMTP_PORT = parseInt(process.env.EMAIL_PORT || '465');
            const SMTP_USER = process.env.EMAIL_USER || 'reservation@gethotelstays.com';
            const SMTP_PASS = process.env.EMAIL_PASS || 'shriyanshking';
            const SMTP_SECURE = process.env.EMAIL_SECURE !== undefined 
                ? (process.env.EMAIL_SECURE === 'true') 
                : (SMTP_PORT === 465);

            const transporter = nodemailer.createTransport({
                host: SMTP_HOST,
                port: SMTP_PORT,
                secure: SMTP_SECURE,
                auth: { user: SMTP_USER, pass: SMTP_PASS },
                tls: { rejectUnauthorized: false }
            });

            const emailSubject = `Application Received: Listing for ${hotelName || 'Your Property'} | GetHotelStays`;
            const emailHtml = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px 24px; background: #ffffff; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px;">
                    <div style="border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px;">
                        <span style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">GetHotelStays<span style="color: #2563eb;">.</span></span>
                        <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1.5px; margin-top: 4px;">Host & Partner Onboarding</span>
                    </div>

                    <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Application Received — Under Review</h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px;">Dear <b>${userName || 'Property Partner'}</b>,</p>
                    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
                        Thank you for listing <b>${hotelName || 'your property'}</b> on GetHotelStays. Your registration details, room inventory, photos, and AI pricing guardrails have been received and are currently under review by our operations desk.
                    </p>

                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">Submission Summary</h3>
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; width: 42%;">Property Name:</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${hotelName || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b;">City & Location:</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${city || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b;">Host Email:</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${userEmail}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b;">Host Phone:</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${userPhone}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b;">AI Dynamic Pricing:</td>
                                <td style="padding: 6px 0; color: #2563eb; font-weight: 700;">₹${extraPayload.minPrice} (Floor) — ₹${extraPayload.maxPrice} (Ceiling)</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b;">Rooms Configured:</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${extraPayload.rooms.length || 1} Room Type(s)</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b;">Review Status:</td>
                                <td style="padding: 6px 0; color: #d97706; font-weight: 800;">🟡 Under Verification (Review in Progress)</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                        <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #1e40af;">What Happens Next?</h4>
                        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #1e3a8a;">
                            Our review team typically verifies property documentation and photo assets within <b>2 to 4 business hours</b>. Once approved, you will receive an activation email and your hotel will immediately go live on GetHotelStays with our automated AI Dynamic Pricing Engine enabled.
                        </p>
                    </div>

                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                        Need urgent assistance? Reply directly to this email or reach our Partner Operations team at <a href="mailto:support@gethotelstays.com" style="color: #2563eb;">support@gethotelstays.com</a>.<br/>
                        © ${new Date().getFullYear()} GetHotelStays.com. All rights reserved.
                    </p>
                </div>
            `;

            await transporter.sendMail({
                from: `"GetHotelStays Partner Desk" <${SMTP_USER}>`,
                to: userEmail,
                subject: emailSubject,
                html: emailHtml
            });

            // Send notification to Admin operations
            try {
                await transporter.sendMail({
                    from: `"GetHotelStays Alert" <${SMTP_USER}>`,
                    to: process.env.SUPPORT_EMAIL || 'support@gethotelstays.com',
                    subject: `[New Partner Submission] ${hotelName || 'Property'} by ${userName || 'Partner'} (${city || 'N/A'})`,
                    text: `A new property listing has been submitted by ${userName} (${userEmail}, ${userPhone}) for ${hotelName} in ${city}. Please review and approve in Admin Central.`
                });
            } catch (admErr) {
                // ignore
            }
        } catch (emailErr) {
            console.error('Submission confirmation email error:', emailErr);
        }

        res.status(201)
            .cookie('token', token, cookieOptions)
            .json({
                success: true,
                token,
                data: partnerRequest,
                message: 'Your property registration has been received and is currently under review.'
            });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all partner requests
// @route   GET /api/partner/requests
// @access  Private/Admin
exports.getPartnerRequests = async (req, res, next) => {
    try {
        const requests = await prisma.partnerrequest.findMany({
            orderBy: { createdAt: 'desc' }
        });
        console.log('Admin requested partner requests. Found:', requests.length);
        res.status(200).json({ success: true, data: requests });
    } catch (err) {
        console.error('Error fetching partner requests:', err);
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Approve a partner request
// @route   PUT /api/partner/requests/:id/approve
// @access  Private/Admin
exports.approvePartnerRequest = async (req, res, next) => {
    try {
        const requestId = parseInt(req.params.id);
        const partnerRequest = await prisma.partnerrequest.findUnique({
            where: { id: requestId }
        });

        if (!partnerRequest) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        if (partnerRequest.status === 'approved') {
            return res.status(400).json({ success: false, error: 'Request already approved' });
        }

        // Parse structured extra data from description if available
        let structured = {};
        try {
            structured = JSON.parse(partnerRequest.description);
        } catch (e) {
            structured = { summary: partnerRequest.description };
        }

        // Use Prisma transaction to ensure hotel is created, rooms added, and status updated
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get existing user
            const user = await tx.user.findUnique({
                where: { email: partnerRequest.userEmail }
            });

            if (!user) {
                throw new Error("User associated with this request not found.");
            }

            // 2. Create the Hotel associated with this user
            const createdHotel = await tx.hotel.create({
                data: {
                    name: partnerRequest.hotelName || "Unnamed Hotel",
                    hotelUsername: partnerRequest.hotelUsername || `hotel_${Date.now()}`,
                    tagline: partnerRequest.tagline || "",
                    description: structured.summary || partnerRequest.description || "Welcome to our hotel.",
                    address: partnerRequest.address || "",
                    city: partnerRequest.city || "",
                    pricePerNight: partnerRequest.pricePerNight || 0,
                    thumbnail: (structured.hotelImages && structured.hotelImages[0]) ? structured.hotelImages[0] : "",
                    images: JSON.stringify(structured.hotelImages || []),
                    amenities: JSON.stringify(structured.hotelAmenities || []),
                    userId: user.id,
                    isActive: true
                }
            });

            // 3. Create rooms if configured by the partner
            if (Array.isArray(structured.rooms) && structured.rooms.length > 0) {
                for (const rm of structured.rooms) {
                    await tx.room.create({
                        data: {
                            name: rm.name || "Deluxe Room",
                            hotelId: createdHotel.id,
                            pricePerNight: parseFloat(rm.price) || partnerRequest.pricePerNight || 0,
                            maxOccupancy: parseInt(rm.occupancy) || 2,
                            bedConfiguration: rm.bedType || "King Bed",
                            totalInventory: parseInt(rm.inventory) || 1,
                            amenities: JSON.stringify(rm.amenities || []),
                            images: JSON.stringify(rm.images || []),
                            status: 'active'
                        }
                    });
                }
            } else {
                // Create at least 1 default room if none were explicitly passed
                await tx.room.create({
                    data: {
                        name: "Standard Room",
                        hotelId: createdHotel.id,
                        pricePerNight: partnerRequest.pricePerNight || 0,
                        maxOccupancy: 2,
                        bedConfiguration: "King Bed",
                        totalInventory: 1,
                        status: 'active'
                    }
                });
            }

            // 4. Update request status
            return await tx.partnerrequest.update({
                where: { id: requestId },
                data: { status: 'approved' }
            });
        });

        // 5. Send Approval & Live Activation email to the partner
        try {
            const SMTP_HOST = process.env.EMAIL_HOST || 'mail.gethotelstays.com';
            const SMTP_PORT = parseInt(process.env.EMAIL_PORT || '465');
            const SMTP_USER = process.env.EMAIL_USER || 'reservation@gethotelstays.com';
            const SMTP_PASS = process.env.EMAIL_PASS || 'shriyanshking';
            const SMTP_SECURE = process.env.EMAIL_SECURE !== undefined 
                ? (process.env.EMAIL_SECURE === 'true') 
                : (SMTP_PORT === 465);

            const transporter = nodemailer.createTransport({
                host: SMTP_HOST,
                port: SMTP_PORT,
                secure: SMTP_SECURE,
                auth: { user: SMTP_USER, pass: SMTP_PASS },
                tls: { rejectUnauthorized: false }
            });

            const minP = structured.minPrice || partnerRequest.pricePerNight || 0;
            const maxP = structured.maxPrice || 'Competitive Peak';

            const mailOptions = {
                from: `"GetHotelStays Partner Desk" <${SMTP_USER}>`,
                to: partnerRequest.userEmail,
                subject: `Congratulations! ${partnerRequest.hotelName} is Approved & LIVE on GetHotelStays!`,
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px 24px; background: #ffffff; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px;">
                        <div style="border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px;">
                            <span style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">GetHotelStays<span style="color: #2563eb;">.</span></span>
                            <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #059669; letter-spacing: 1.5px; margin-top: 4px;">Property Verified & Activated</span>
                        </div>

                        <h2 style="font-size: 22px; font-weight: 800; color: #059669; margin-top: 0; margin-bottom: 12px;">🎉 Congratulations! Your Property is Live</h2>
                        <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px;">Hello <b>${partnerRequest.userName}</b>,</p>
                        <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
                            Your property <b>${partnerRequest.hotelName}</b> has been reviewed, approved, and is now officially <b>LIVE</b> on GetHotelStays. You are now ready to receive confirmed guest reservations!
                        </p>

                        <!-- AI Agent Feature Card -->
                        <div style="background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                            <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 800; color: #1e40af; display: flex; items-center;">
                                🤖 AI Dynamic Pricing Agent Activated
                            </h4>
                            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #1e3a8a;">
                                Our smart AI agent has been initialized for your property. It will continuously optimize your room pricing competitively to maximize your bookings and occupancy, while strictly respecting your minimum safety floor of <b>₹${minP}</b> and ceiling of <b>₹${maxP}</b>.
                            </p>
                        </div>

                        <!-- Credentials Box -->
                        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 24px 0;">
                            <h4 style="margin-top: 0; margin-bottom: 12px; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b;">Partner Portal Credentials</h4>
                            <p style="margin: 0 0 8px 0; font-size: 13px;"><b>Login Email:</b> ${partnerRequest.userEmail}</p>
                            <p style="margin: 0 0 8px 0; font-size: 13px;"><b>Status:</b> <span style="color: #059669; font-weight: bold;">Verified & Live</span></p>
                            <p style="margin: 0; font-size: 13px;"><b>Commission:</b> Flat 12% on completed stays (No hidden fees)</p>
                        </div>

                        <div style="margin: 32px 0; text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'https://gethotelstays.com'}/partner" style="background: #2563eb; color: #ffffff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                                Access Partner Dashboard →
                            </a>
                        </div>

                        <p style="margin-top: 32px; color: #64748b; font-size: 12px; line-height: 1.6; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                            Warm regards,<br/>
                            <b>The GetHotelStays Partner Operations Team</b><br/>
                            Support: reservation@gethotelstays.com | https://gethotelstays.com
                        </p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
        } catch (emailErr) {
            console.error('Approval email error:', emailErr);
        }

        res.status(200).json({ 
            success: true, 
            message: 'Partner request approved, hotel & rooms created, and activation email sent successfully.' 
        });

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Decline partner request
// @route   PUT /api/partner/requests/:id/decline
// @access  Private (Super Admin)
exports.declinePartnerRequest = async (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        
        const partnerRequest = await prisma.partnerrequest.findUnique({
            where: { id: requestId }
        });

        if (!partnerRequest) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        if (partnerRequest.status !== 'pending') {
            return res.status(400).json({ success: false, error: `Request already ${partnerRequest.status}` });
        }

        const result = await prisma.partnerrequest.update({
            where: { id: requestId },
            data: { status: 'rejected' }
        });

        res.json({
            success: true,
            data: result,
            message: 'Partner request declined successfully'
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Bulk Approve partner requests
// @route   PUT /api/partner/requests/bulk-approve
// @access  Private (Super Admin)
exports.bulkApprovePartnerRequests = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ success: false, error: 'Please provide an array of IDs' });
        }

        const result = await prisma.partnerrequest.updateMany({
            where: { id: { in: ids } },
            data: { status: 'approved' }
        });

        res.json({ success: true, message: `${result.count} requests approved successfully` });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Bulk Decline partner requests
// @route   PUT /api/partner/requests/bulk-decline
// @access  Private (Super Admin)
exports.bulkDeclinePartnerRequests = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ success: false, error: 'Please provide an array of IDs' });
        }

        const result = await prisma.partnerrequest.updateMany({
            where: { id: { in: ids } },
            data: { status: 'rejected' }
        });

        res.json({ success: true, message: `${result.count} requests declined successfully` });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
