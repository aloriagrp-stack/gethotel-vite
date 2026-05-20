const prisma = require('../config/db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Submit a partner registration request
// @route   POST /api/partner/request
// @access  Public
exports.submitPartnerRequest = async (req, res, next) => {
    try {
        const { 
            hotelName, hotelUsername, tagline, description, address, city, 
            pricePerNight, userName, userEmail, userPhone, partnerPassword 
        } = req.body;

        // 1. Check if email already exists in User table AND is already a partner
        const existingUser = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (existingUser && existingUser.role === 'hotel_admin') {
            return res.status(400).json({ 
                success: false, 
                error: 'This Email is already in use by a Partner.' 
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

        // 3. Create User Account Immediately (to allow dashboard login in pending state)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(partnerPassword, salt);

        const newUser = await prisma.user.create({
            data: {
                name: userName || "Partner",
                email: userEmail,
                password: hashedPassword,
                role: 'hotel_admin'
            }
        });

        // 4. Create Partner Request linked to User
        const partnerRequest = await prisma.partnerrequest.create({
            data: {
                hotelName: hotelName || "Unnamed Hotel",
                hotelUsername: hotelUsername || `hotel_${Date.now()}`,
                tagline: tagline || "",
                description: description || `Welcome to ${hotelName || 'our hotel'}.`,
                address: address || "",
                city: city || "",
                pricePerNight: isNaN(parseFloat(pricePerNight)) ? 0 : parseFloat(pricePerNight),
                userName: userName || "Partner",
                userEmail: userEmail || "",
                userPhone: userPhone || "",
                partnerPassword: partnerPassword || "", // Still keep for reference if needed
                status: 'pending',
                updatedAt: new Date()
            }
        });

        // 5. Generate Token for immediate access
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        res.status(201).json({
            success: true,
            token,
            data: partnerRequest,
            message: 'Your account has been created and is pending for approval.'
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

        // Use Prisma transaction to ensure hotel is created and status updated
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get existing user
            const user = await tx.user.findUnique({
                where: { email: partnerRequest.userEmail }
            });

            if (!user) {
                throw new Error("User associated with this request not found.");
            }

            // 2. Create the Hotel associated with this user
            await tx.hotel.create({
                data: {
                    name: partnerRequest.hotelName || "Unnamed Hotel",
                    hotelUsername: partnerRequest.hotelUsername || `hotel_${Date.now()}`,
                    tagline: partnerRequest.tagline || "",
                    description: partnerRequest.description || "Welcome to our hotel.",
                    address: partnerRequest.address || "",
                    city: partnerRequest.city || "",
                    pricePerNight: partnerRequest.pricePerNight || 0,
                    userId: user.id
                }
            });

            // 3. Update request status
            return await tx.partnerrequest.update({
                where: { id: requestId },
                data: { status: 'approved' }
            });
        });

        // 4. Send email to the partner
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: `"GetHotelStays Partner" <${process.env.EMAIL_USER}>`,
                to: partnerRequest.userEmail,
                subject: 'Your Hotel Partner Request Approved!',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h1 style="color: #2563eb;">Welcome to GetHotelStays!</h1>
                        <p>Hello <b>${partnerRequest.userName}</b>,</p>
                        <p>Your request to list <b>${partnerRequest.hotelName}</b> has been approved.</p>
                        <p>You can now log in to the partner dashboard using the following credentials:</p>
                        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
                            <p style="margin: 0 0 10px 0;"><b>Email:</b> ${partnerRequest.userEmail}</p>
                            <p style="margin: 0;"><b>Status:</b> <span style="color: #059669; font-weight: bold;">Active</span></p>
                        </div>
                        <p>Please change your password after logging in for the first time for security.</p>
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background: #2563eb; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Login to Partner Panel</a>
                        </div>
                        <p style="margin-top: 40px; color: #64748b; font-size: 12px;">Best Regards,<br/>The GetHotelStays Team</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
        } catch (emailErr) {
            console.error('Email failed to send, but account was created:', emailErr);
            // We don't fail the whole request if only email fails, but we should inform the user
        }

        res.status(200).json({ 
            success: true, 
            message: 'Partner request approved and account created successfully.' 
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
