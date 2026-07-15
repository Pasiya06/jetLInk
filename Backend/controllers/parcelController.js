import jwt from "jsonwebtoken";
import Parcel from "../models/Parcel.js";

export const createParcel = async (req, res) => {
  try {
    // Find the last parcel
    const lastParcel = await Parcel.findOne().sort({ createdAt: -1 });

    let parcelId = "P0001";

    if (lastParcel && lastParcel.parcelId) {
      const lastNumber = parseInt(lastParcel.parcelId.substring(1), 10);
      parcelId = `P${String(lastNumber + 1).padStart(4, "0")}`;
    }

    const parcel = await Parcel.create({
      ...req.body,
      parcelId,
    });

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

export const getParcelByEmailAndUsed = async (req, res) => {
  try {
    const { Semail, used } = req.params;

    console.log("Search:", Semail, used);

    const parcels = await Parcel.find({
      Semail: Semail,
      used: used === "true"
    });

    console.log("Parcels:", parcels);

    if (parcels.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No parcels found",
      });
    }

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
  const { parcelId} = req.params;
    
  try {
    const parcel = await Parcel.findOne({parcelId});
    
    if (!parcel) {
      return res.status(404).json({
        error: "Parcel not found",
      });
    }

    const payload = {
      ParlId: parcel._id,
      parcelId: parcel.parcelId,
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
      parcel,
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

    // First Scan - Pickup
    if (!parcel.pickupVerified) {
      parcel.pickupVerified = true;
      parcel.pickupVerifiedAt = new Date();
      parcel.status = "Picked Up";

      await parcel.save();

      return res.json({
        valid: true,
        stage: "pickup",
        message: "Parcel pickup verified successfully.",
        parcel,
      });
    }

    // Second Scan - Delivery
    if (!parcel.delivered) {
      parcel.delivered = true;
      parcel.deliveredAt = new Date();
      parcel.status = "Delivered";

      await parcel.save();

      return res.json({
        valid: true,
        stage: "delivery",
        message: "Parcel delivered successfully.",
        parcel,
      });
    }

    // Already Delivered
    return res.json({
      valid: false,
      reason: "Parcel already delivered.",
    });

  } catch (error) {
    return res.json({
      valid: false,
      reason: "Invalid or expired QR",
    });
  }
};

export const generateParQR = async (req, res) => {
  try {
    const {
      
      sendername,
      receivername,
      pickup,
      drop,
      weight,
      totalFare,
    } = req.body;

    const payload = {
      
      sendername,
      receivername,
      pickup,
      drop,
      weight,
      totalFare,
      issuedAt: Date.now(),
    };

    const token = jwt.sign(payload, process.env.QR_SECRET, {
      expiresIn: "12h",
    });

    res.status(200).json({
      success: true,
      qrToken: token,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to generate Parcel QR",
    });
  }
};