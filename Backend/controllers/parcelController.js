import jwt from "jsonwebtoken";
import Parcel from "../models/Parcel.js";

export const createParcel = async (req, res) => {
    try {
        const parcel = await Parcel.create(req.body);

        res.status(201).json({
            success: true,
            data: parcel,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

export const getParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find();

        res.json({
            success: true,
            data: parcels,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

export const generateParcelQR = async (req, res) => {
  const { parcelId } = req.params;

  try {
    const parcel = await Parcel.findById(parcelId);

    if (!parcel) {
      return res.status(404).json({
        error: "Parcel not found",
      });
    }

    const payload = {
      parcelId: parcel._id,
      sendername: parcel.sendername,
      receivername: parcel.receivername,
      pickup: parcel.pickup,
      drop: parcel.drop,
      weight: parcel.weight,
      totalFare: parcel.totalFare,
      issuedAt: Date.now(),
    };

    const token = jwt.sign(payload, process.env.QR_SECRET, {
      expiresIn: "12h",
    });

    res.json({
      qrToken: token,
      parcel: {
        id: parcel._id,
        sendername: parcel.sendername,
        receivername: parcel.receivername,
        pickup: parcel.pickup,
        drop: parcel.drop,
        weight: parcel.weight,
        totalFare: parcel.totalFare,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to generate Parcel QR",
    });
  }
};

export const verifyParcelQR = async (req, res) => {
  const { qrToken } = req.body;

  try {
    const decoded = jwt.verify(qrToken, process.env.QR_SECRET);

    const parcel = await Parcel.findById(decoded.parcelId);

    if (!parcel) {
      return res.json({
        valid: false,
        reason: "Parcel not found",
      });
    }

    if (parcel.used) {
      return res.json({
        valid: false,
        reason: "Parcel already collected",
      });
    }

    parcel.used = true;
    parcel.usedAt = new Date();
    await parcel.save();

    res.json({
      valid: true,
      message: "Parcel verified successfully",
      parcel: {
        sendername: parcel.sendername,
        receivername: parcel.receivername,
        pickup: parcel.pickup,
        drop: parcel.drop,
        weight: parcel.weight,
        totalFare: parcel.totalFare,
      },
    });
  } catch (error) {
    res.json({
      valid: false,
      reason: "Invalid or expired QR",
    });
  }
};