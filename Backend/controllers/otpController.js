import OTP from "../models/OTP.js";
import transporter from "../config/email.js";

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (req, res) => {
    try {

        const { email } = req.body;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.findOneAndUpdate(
            { email },
            {
                email,
                otp,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            },
            { upsert: true, new: true }
        );

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Email Verification OTP",
            html: `
                <h2>Your OTP Code</h2>
                <h1>${otp}</h1>
                <p>This code expires in 5 minutes.</p>
            `,
        });

        res.json({
            success: true,
            message: "OTP sent successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            error: error.message,
        });

    }
};

export const verifyOTP = async (req, res) => {

    const { email, otp } = req.body;

    const record = await OTP.findOne({ email });

    if (!record) {
        return res.json({
            success: false,
            message: "OTP not found",
        });
    }

    if (record.expiresAt < new Date()) {
        return res.json({
            success: false,
            message: "OTP expired",
        });
    }

    if (record.otp !== otp) {
        return res.json({
            success: false,
            message: "Invalid OTP",
        });
    }

    await OTP.deleteOne({ email });

    res.json({
        success: true,
        message: "OTP Verified",
    });

};