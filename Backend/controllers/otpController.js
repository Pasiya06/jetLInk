import OTP from "../models/OTP.js";
import Bus from "../models/Bus.js";
import Driver from "../models/Driver.js";
import Conductor from "../models/Conductor.js";
import transporter from "../config/email.js";
import { signLoginToken, signOtpToken } from "../utils/auth.js";

const MAX_ATTEMPTS = 5;          // wrong guesses before the code is cancelled
const RESEND_WAIT_MS = 30 * 1000; // a new code can be requested every 30 seconds
const VALID_MS = 5 * 60 * 1000;   // a code works for 5 minutes

const cleanEmail = (email) => String(email || "").trim().toLowerCase();

export const sendOTP = async (req, res) => {
    try {
        const email = cleanEmail(req.body.email);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: "A valid email is required" });
        }

        // Don't flood one inbox: within 30 seconds the code already sent is still the one to use
        const existing = await OTP.findOne({ email }).lean();
        if (existing?.sentAt && Date.now() - new Date(existing.sentAt).getTime() < RESEND_WAIT_MS) {
            return res.json({
                success: true,
                message: "A code was just sent. Please check your email.",
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.findOneAndUpdate(
            { email },
            {
                email,
                otp,
                expiresAt: new Date(Date.now() + VALID_MS),
                attempts: 0,
                sentAt: new Date(),
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
            message: "Could not send the code. Please try again.",
        });

    }
};

// Bus staff logging in: give a staff token only if this email belongs to the
// driver or conductor assigned to that bus
const staffTokenFor = async (email, busNumber) => {
    const bus = busNumber
        ? await Bus.findOne({ busNumber: String(busNumber).trim() }).select("busNumber driverNIC conductorNIC").lean()
        : null;
    if (!bus) return null;
    const [driver, conductor] = await Promise.all([
        Driver.findOne({ email }).select("_id NIC").lean(),
        Conductor.findOne({ email }).select("_id NIC").lean(),
    ]);
    const person =
        (conductor && conductor.NIC === bus.conductorNIC && conductor) ||
        (driver && driver.NIC === bus.driverNIC && driver);
    if (!person) return null;
    return signLoginToken({ id: person._id, role: "staff", email, busNumber: bus.busNumber });
};

export const verifyOTP = async (req, res) => {
    try {
        const email = cleanEmail(req.body.email);
        const otp = String(req.body.otp || "").trim();

        const record = await OTP.findOne({ email });

        if (!record) {
            return res.json({
                success: false,
                message: "Code not found. Please ask for a new one.",
            });
        }

        if (record.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: record._id });
            return res.json({
                success: false,
                message: "This code has expired. Please ask for a new one.",
            });
        }

        if (record.otp !== otp) {
            record.attempts = (record.attempts || 0) + 1;
            if (record.attempts >= MAX_ATTEMPTS) {
                await OTP.deleteOne({ _id: record._id });
                return res.json({
                    success: false,
                    message: "Too many wrong tries. Please ask for a new code.",
                });
            }
            await record.save();
            return res.json({
                success: false,
                message: `Invalid code. ${MAX_ATTEMPTS - record.attempts} tries left.`,
            });
        }

        await OTP.deleteOne({ _id: record._id });

        res.json({
            success: true,
            message: "OTP Verified",
            // Proof of this OTP for the next step (e.g. resetting the password)
            otpToken: signOtpToken(email),
            // Bus staff login: their login token
            token: await staffTokenFor(email, req.body.busNumber),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
