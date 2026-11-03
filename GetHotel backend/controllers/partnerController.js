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


// @desc    Get bank details for a partner hotel
// @route   GET /api/partner/bank-details/:hotelId
// @access  Private (hotel_admin, super_admin)
exports.getBankDetails = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        if (!hotelId || isNaN(hotelId)) {
            return res.status(400).json({ success: false, message: 'Valid Hotel ID required' });
        }

        // Verify hotel ownership if user is hotel_admin
        const isSuperAdmin = ['super_admin', 'superadmin', 'admin'].includes(req.user.role);
        if (!isSuperAdmin) {
            const hotel = await prisma.hotel.findFirst({
                where: { id: hotelId, userId: req.user.id }
            });
            if (!hotel) {
                return res.status(403).json({ success: false, message: 'Not authorized to view bank details for this property' });
            }
        }

        const configKey = `partner_bank_${hotelId}`;
        const record = await prisma.homepage_config.findUnique({
            where: { key: configKey }
        });

        if (!record || !record.value) {
            return res.status(200).json({
                success: true,
                data: null,
                message: 'No bank details configured yet'
            });
        }

        let parsed = null;
        try {
            parsed = JSON.parse(record.value);
        } catch (_) {
            parsed = null;
        }

        return res.status(200).json({
            success: true,
            data: parsed
        });
    } catch (err) {
        console.error("GET_BANK_DETAILS_ERROR:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Save or update bank details for a partner hotel (Submits for Super Admin approval)
// @route   POST/PUT /api/partner/bank-details/:hotelId
// @access  Private (hotel_admin, super_admin)
exports.saveBankDetails = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        if (!hotelId || isNaN(hotelId)) {
            return res.status(400).json({ success: false, message: 'Valid Hotel ID required' });
        }

        const isSuperAdmin = ['super_admin', 'superadmin', 'admin'].includes(req.user.role);
        let hotelOwner = null;
        if (!isSuperAdmin) {
            hotelOwner = await prisma.hotel.findFirst({
                where: { id: hotelId, userId: req.user.id },
                include: { user: { select: { id: true, name: true, email: true } } }
            });
            if (!hotelOwner) {
                return res.status(403).json({ success: false, message: 'Not authorized to update bank details for this property' });
            }
        } else {
            hotelOwner = await prisma.hotel.findUnique({
                where: { id: hotelId },
                include: { user: { select: { id: true, name: true, email: true } } }
            });
        }

        const {
            accountHolderName,
            bankName,
            accountNumber,
            ifscCode,
            accountType,
            branchName,
            upiId,
            panGst
        } = req.body;

        if (!accountHolderName || !String(accountHolderName).trim()) {
            return res.status(400).json({ success: false, message: 'Beneficiary account holder name is required' });
        }
        if (!bankName || !String(bankName).trim()) {
            return res.status(400).json({ success: false, message: 'Bank name is required' });
        }
        if (!accountNumber || !String(accountNumber).trim()) {
            return res.status(400).json({ success: false, message: 'Account number is required' });
        }
        if (!ifscCode || !String(ifscCode).trim()) {
            return res.status(400).json({ success: false, message: 'IFSC code is required' });
        }
        if (!upiId || !String(upiId).trim()) {
            return res.status(400).json({ success: false, message: 'UPI ID is required' });
        }

        const cleanAccountNumber = String(accountNumber).trim();
        const cleanIfsc = String(ifscCode).trim().toUpperCase();

        const bankData = {
            hotelId,
            hotelName: hotelOwner?.name || `Hotel #${hotelId}`,
            accountHolderName: String(accountHolderName).trim(),
            bankName: String(bankName).trim(),
            accountNumber: cleanAccountNumber,
            maskedAccountNumber: cleanAccountNumber.length > 4 
                ? '•••• •••• •••• ' + cleanAccountNumber.slice(-4) 
                : cleanAccountNumber,
            ifscCode: cleanIfsc,
            accountType: accountType || 'Current',
            branchName: branchName ? String(branchName).trim() : '',
            upiId: String(upiId).trim(),
            panGst: panGst ? String(panGst).trim().toUpperCase() : '',
            status: isSuperAdmin ? 'approved' : 'pending',
            isVerified: isSuperAdmin ? true : false,
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            submittedBy: req.user.email || req.user.name || 'Partner'
        };

        const configKey = `partner_bank_${hotelId}`;
        const strValue = JSON.stringify(bankData);

        await prisma.homepage_config.upsert({
            where: { key: configKey },
            update: { value: strValue },
            create: { key: configKey, value: strValue }
        });

        // Notify Super Admin in notification table
        try {
            const superAdmins = await prisma.user.findMany({
                where: { role: 'super_admin' },
                select: { id: true }
            });
            for (const sa of superAdmins) {
                await prisma.notification.create({
                    data: {
                        userId: sa.id,
                        hotelId: hotelId,
                        title: 'Bank Verification Request',
                        message: `${bankData.hotelName} submitted bank account details (${bankData.bankName} - ${bankData.maskedAccountNumber}) for approval.`,
                        type: 'info'
                    }
                });
            }
        } catch (notifErr) {
            console.warn('Could not record admin notification:', notifErr.message);
        }

        return res.status(200).json({
            success: true,
            message: isSuperAdmin 
                ? 'Bank details saved and approved successfully.' 
                : 'Bank details submitted successfully! Super Admin will review and approve your account shortly.',
            data: bankData
        });
    } catch (err) {
        console.error("SAVE_BANK_DETAILS_ERROR:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all partner bank approval requests for Super Admin
// @route   GET /api/admin/bank-requests
// @access  Private (Super Admin)
exports.getAdminBankRequests = async (req, res) => {
    try {
        const rows = await prisma.homepage_config.findMany({
            where: {
                key: { startsWith: 'partner_bank_' }
            }
        });

        const bankRequests = [];
        const hotelIds = [];

        for (const row of rows) {
            try {
                const parsed = JSON.parse(row.value);
                if (parsed && parsed.hotelId) {
                    bankRequests.push({ ...parsed, configKey: row.key });
                    hotelIds.push(parsed.hotelId);
                }
            } catch (_) {}
        }

        // Fetch hotels & owners in batch
        const hotels = await prisma.hotel.findMany({
            where: { id: { in: hotelIds } },
            select: {
                id: true,
                name: true,
                city: true,
                address: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        const hotelMap = {};
        hotels.forEach(h => { hotelMap[h.id] = h; });

        const enriched = bankRequests.map(item => {
            const h = hotelMap[item.hotelId];
            return {
                ...item,
                hotelName: item.hotelName || h?.name || `Hotel #${item.hotelId}`,
                hotelCity: h?.city || '—',
                ownerName: h?.user?.name || item.submittedBy || 'Partner',
                ownerEmail: h?.user?.email || item.submittedBy || '—',
                status: item.status || (item.isVerified ? 'approved' : 'pending')
            };
        });

        // Sort: pending first, then by date descending
        enriched.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
        });

        return res.status(200).json({
            success: true,
            count: enriched.length,
            data: enriched
        });
    } catch (err) {
        console.error("GET_ADMIN_BANK_REQUESTS_ERROR:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Approve partner bank details & send confirmation email
// @route   PUT /api/admin/bank-requests/:hotelId/approve
// @access  Private (Super Admin)
exports.approveAdminBankRequest = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        if (!hotelId || isNaN(hotelId)) {
            return res.status(400).json({ success: false, message: 'Valid Hotel ID required' });
        }

        const configKey = `partner_bank_${hotelId}`;
        const record = await prisma.homepage_config.findUnique({
            where: { key: configKey }
        });

        if (!record || !record.value) {
            return res.status(404).json({ success: false, message: 'Bank details not found for this property' });
        }

        let bankData = JSON.parse(record.value);
        bankData.status = 'approved';
        bankData.isVerified = true;
        bankData.approvedAt = new Date().toISOString();
        bankData.approvedBy = req.user.email || req.user.name || 'Super Admin';

        await prisma.homepage_config.update({
            where: { key: configKey },
            data: { value: JSON.stringify(bankData) }
        });

        // Fetch Hotel & Owner Details
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            include: { user: { select: { id: true, name: true, email: true } } }
        });

        const targetEmail = hotel?.user?.email || bankData.submittedBy;
        const partnerName = hotel?.user?.name || bankData.accountHolderName || 'Partner';
        const hotelName = hotel?.name || bankData.hotelName || `Hotel #${hotelId}`;

        // Create partner notification
        if (hotel?.user?.id) {
            try {
                await prisma.notification.create({
                    data: {
                        userId: hotel.user.id,
                        hotelId: hotelId,
                        title: 'Bank Account Approved & Verified!',
                        message: `Your bank account (${bankData.bankName} - ${bankData.maskedAccountNumber}) for ${hotelName} has been approved by Super Admin. Weekly automated payouts are now active.`,
                        type: 'success'
                    }
                });
            } catch (nErr) {
                console.warn('Could not record notification:', nErr);
            }
        }

        // Send Confirmation Email to Partner
        if (targetEmail && targetEmail.includes('@')) {
            try {
                const SMTP_HOST = process.env.EMAIL_HOST || 'mail.gethotelstays.com';
                const SMTP_PORT = parseInt(process.env.EMAIL_PORT) || 465;
                const SMTP_USER = process.env.EMAIL_USER || 'reservation@gethotelstays.com';
                const SMTP_PASS = process.env.EMAIL_PASS || 'Gethotel@2026';
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

                const mailOptions = {
                    from: `"GetHotelStays Settlements" <${SMTP_USER}>`,
                    to: targetEmail,
                    subject: `✅ Bank Account Verified & Approved for Payouts — ${hotelName}`,
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px;">
                            <div style="border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 24px;">
                                <span style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">GetHotelStays<span style="color: #2563eb;">.</span></span>
                                <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #059669; letter-spacing: 1.5px; margin-top: 4px;">Bank Account Verified & Approved</span>
                            </div>

                            <h2 style="font-size: 20px; font-weight: 800; color: #059669; margin-top: 0; margin-bottom: 12px;">🎉 Payout Account Activated!</h2>
                            <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px;">Hello <b>${partnerName}</b>,</p>
                            <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
                                Your bank account details for <b>${hotelName}</b> have been reviewed and officially <b>APPROVED</b> by Super Admin.
                            </p>

                            <!-- Bank Details Summary Card -->
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                                <h4 style="margin-top: 0; margin-bottom: 14px; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b;">Verified Account Details</h4>
                                <table style="width: 100%; font-size: 13px; line-height: 1.8;">
                                    <tr>
                                        <td style="color: #64748b; width: 45%;">Account Holder:</td>
                                        <td style="font-weight: 700; color: #0f172a;">${bankData.accountHolderName}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #64748b;">Bank Name:</td>
                                        <td style="font-weight: 700; color: #0f172a;">${bankData.bankName}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #64748b;">Account Number:</td>
                                        <td style="font-weight: 700; color: #0f172a; font-family: monospace;">${bankData.maskedAccountNumber}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #64748b;">IFSC Code:</td>
                                        <td style="font-weight: 700; color: #0f172a; font-family: monospace;">${bankData.ifscCode}</td>
                                    </tr>
                                    ${bankData.upiId ? `
                                    <tr>
                                        <td style="color: #64748b;">UPI ID:</td>
                                        <td style="font-weight: 700; color: #0f172a;">${bankData.upiId}</td>
                                    </tr>
                                    ` : ''}
                                    <tr>
                                        <td style="color: #64748b;">Status:</td>
                                        <td style="font-weight: 800; color: #059669;">Verified & Ready for Payouts</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Payout Schedule Info -->
                            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #166534;">
                                    <b>📅 Weekly Settlements:</b> All guest booking earnings (88% net after flat 12% commission) will now be automatically transferred to this verified account every Monday via IMPS/NEFT.
                                </p>
                            </div>

                            <div style="margin: 28px 0; text-align: center;">
                                <a href="${process.env.FRONTEND_URL || 'https://gethotelstays.com'}/partner-dashboard/payments" style="background: #0f172a; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-block;">
                                    View Payout Dashboard →
                                </a>
                            </div>

                            <p style="margin-top: 24px; color: #94a3b8; font-size: 11px; line-height: 1.6; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                                If you did not request this update, please contact our support team immediately at reservation@gethotelstays.com.
                            </p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log(`Bank approval email sent to ${targetEmail}`);
            } catch (mailErr) {
                console.error('Failed to send bank approval email:', mailErr.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Bank account approved successfully, and confirmation email sent to partner.',
            data: bankData
        });
    } catch (err) {
        console.error("APPROVE_BANK_REQUEST_ERROR:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Reject partner bank details
// @route   PUT /api/admin/bank-requests/:hotelId/reject
// @access  Private (Super Admin)
exports.rejectAdminBankRequest = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        if (!hotelId || isNaN(hotelId)) {
            return res.status(400).json({ success: false, message: 'Valid Hotel ID required' });
        }

        const configKey = `partner_bank_${hotelId}`;
        const record = await prisma.homepage_config.findUnique({
            where: { key: configKey }
        });

        if (!record || !record.value) {
            return res.status(404).json({ success: false, message: 'Bank details not found' });
        }

        const reason = req.body.reason || 'Verification could not be completed with the provided bank info.';
        let bankData = JSON.parse(record.value);
        bankData.status = 'rejected';
        bankData.isVerified = false;
        bankData.rejectionReason = reason;
        bankData.rejectedAt = new Date().toISOString();
        bankData.rejectedBy = req.user.email || req.user.name || 'Super Admin';

        await prisma.homepage_config.update({
            where: { key: configKey },
            data: { value: JSON.stringify(bankData) }
        });

        // Notify Partner User
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            include: { user: { select: { id: true, name: true, email: true } } }
        });

        if (hotel?.user?.id) {
            try {
                await prisma.notification.create({
                    data: {
                        userId: hotel.user.id,
                        hotelId: hotelId,
                        title: 'Bank Verification Declined',
                        message: `Your bank details for ${hotel.name} were declined: ${reason}. Please update your details.`,
                        type: 'warning'
                    }
                });
            } catch (_) {}
        }

        return res.status(200).json({
            success: true,
            message: 'Bank details rejected.',
            data: bankData
        });
    } catch (err) {
        console.error("REJECT_BANK_REQUEST_ERROR:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get payout history for a partner hotel
// @route   GET /api/partner/payouts/:hotelId
// @access  Private (hotel_admin, super_admin)
exports.getPartnerPayouts = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        if (!hotelId || isNaN(hotelId)) {
            return res.status(400).json({ success: false, message: 'Valid Hotel ID required' });
        }

        const isSuperAdmin = ['super_admin', 'superadmin', 'admin'].includes(req.user.role);
        if (!isSuperAdmin) {
            const hotel = await prisma.hotel.findFirst({
                where: { id: hotelId, userId: req.user.id }
            });
            if (!hotel) {
                return res.status(403).json({ success: false, message: 'Not authorized for this property' });
            }
        }

        const payouts = await prisma.payout.findMany({
            where: { hotelId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // Also fetch bank config
        const configKey = `partner_bank_${hotelId}`;
        const bankRecord = await prisma.homepage_config.findUnique({ where: { key: configKey } });
        let bankData = null;
        if (bankRecord && bankRecord.value) {
            try { bankData = JSON.parse(bankRecord.value); } catch (_) {}
        }

        return res.status(200).json({
            success: true,
            data: payouts,
            bankDetails: bankData
        });
    } catch (err) {
        console.error("GET_PARTNER_PAYOUTS_ERROR:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Request a withdrawal / payout for a partner hotel
// @route   POST /api/partner/payouts/:hotelId
// @access  Private (hotel_admin, super_admin)
exports.requestPartnerPayout = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        if (!hotelId || isNaN(hotelId)) {
            return res.status(400).json({ success: false, message: 'Valid Hotel ID required' });
        }

        const isSuperAdmin = ['super_admin', 'superadmin', 'admin'].includes(req.user.role);
        let hotel = null;
        if (!isSuperAdmin) {
            hotel = await prisma.hotel.findFirst({
                where: { id: hotelId, userId: req.user.id }
            });
            if (!hotel) {
                return res.status(403).json({ success: false, message: 'Not authorized for this property' });
            }
        } else {
            hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        }

        const amount = parseFloat(req.body.amount);
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Please enter a valid positive withdrawal amount' });
        }

        // Check if bank details are approved
        const configKey = `partner_bank_${hotelId}`;
        const bankRecord = await prisma.homepage_config.findUnique({ where: { key: configKey } });
        let bankData = null;
        if (bankRecord && bankRecord.value) {
            try { bankData = JSON.parse(bankRecord.value); } catch (_) {}
        }

        const bankRef = bankData?.maskedAccountNumber 
            ? `${bankData.bankName} (${bankData.maskedAccountNumber})` 
            : 'Bank Transfer';

        const newPayout = await prisma.payout.create({
            data: {
                hotelId,
                amount,
                status: 'pending',
                bankReference: bankRef
            }
        });

        // Notify super admin
        try {
            const superAdmins = await prisma.user.findMany({ where: { role: 'super_admin' }, select: { id: true } });
            for (const sa of superAdmins) {
                await prisma.notification.create({
                    data: {
                        userId: sa.id,
                        hotelId,
                        title: 'New Withdrawal Request',
                        message: `${hotel.name} requested a withdrawal of ₹${amount.toLocaleString()} to ${bankRef}.`,
                        type: 'info'
                    }
                });
            }
        } catch (_) {}

        return res.status(200).json({
            success: true,
            message: `Withdrawal request of ₹${amount.toLocaleString()} submitted successfully! Funds will be transferred following admin approval.`,
            data: newPayout
        });
    } catch (err) {
        console.error("REQUEST_PARTNER_PAYOUT_ERROR:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
