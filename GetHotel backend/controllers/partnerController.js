const prisma = require('../config/db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// @desc    Submit a partner registration request
// @route   POST /api/partner/request
// @access  Public
exports.submitPartnerRequest = async (req, res, next) => {
    try {
        const { 
            hotelName, hotelUsername, tagline, description, address, city, 
            pricePerNight, userName, userEmail, userPhone, partnerPassword 
        } = req.body;

        // 1. Check if email already exists in User table
        const existingUser = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: 'This email is already registered as a customer/partner. Please use a different email or login.' 
            });
        }

        // 2. Check if there's already a pending/approved request with this email
        const existingRequest = await prisma.partnerrequest.findFirst({
            where: { userEmail: userEmail }
        });

        if (existingRequest) {
            return res.status(400).json({ 
                success: false, 
                error: 'A partner request with this email already exists (Pending or Approved).' 
            });
        }

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
                partnerPassword: partnerPassword || "",
                status: 'pending',
                updatedAt: new Date()
            }
        });

        res.status(201).json({
            success: true,
            data: partnerRequest,
            message: 'Your request has been submitted. Please wait for admin approval.'
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
        res.status(200).json({ success: true, data: requests });
    } catch (err) {
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

        // Use the partnerPassword set by the partner during registration
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(partnerRequest.partnerPassword, salt);

        // Use Prisma transaction to ensure both user and hotel are created
        const result = await prisma.$transaction(async (tx) => {
            // 1. Check if user already exists
            let user = await tx.user.findUnique({
                where: { email: partnerRequest.userEmail }
            });

            if (!user) {
                // Create new user if doesn't exist
                user = await tx.user.create({
                    data: {
                        name: partnerRequest.userName || "Partner",
                        email: partnerRequest.userEmail,
                        password: hashedPassword,
                        role: 'hotel_admin'
                    }
                });
            } else {
                // Update existing user to hotel_admin
                user = await tx.user.update({
                    where: { id: user.id },
                    data: { 
                        role: 'hotel_admin',
                        // Also update password if they are becoming a partner
                        password: hashedPassword 
                    }
                });
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
