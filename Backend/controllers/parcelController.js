import jwt from "jsonwebtoken";
import Parcel from "../models/Parcel.js";
import Bus from "../models/Bus.js"; // adjust path to match your project
import { notify, notifyPassengers } from "./notificationController.js";

// Tell the sender and the receiver (if they use JetLink) about their parcel
const parcelPassengerAlert = async (parcel, stage) => {
  const id = parcel.parcelId;
  const route = `${parcel.pickup || "?"} → ${parcel.drop || "?"}`;
  const bus = parcel.Bnumber || "-";
  const sender = parcel.Semail;
  const receiver = parcel.Remail;
  const same = String(sender || "").toLowerCase() === String(receiver || "").toLowerCase();
  const base = { type: "parcel", busNumber: parcel.Bnumber, data: { parcelId: id, status: parcel.status } };

  if (stage === "booked") {
    await notifyPassengers(sender, {
      ...base,
      title: `📦 Parcel ${id} booked`,
      body: `${route} on ${parcel.date || "-"} ${parcel.time || ""}. Bus ${bus}. Show the parcel QR when you hand it over.`,
    });
    if (!same) {
      await notifyPassengers(receiver, {
        ...base,
        title: `📦 A parcel is coming to you`,
        body: `${parcel.sendername || "Someone"} sent you parcel ${id} (${route}) on bus ${bus}, ${parcel.date || ""}.`,
      });
    }
  } else if (stage === "pickup") {
    await notifyPassengers(same ? [sender] : [sender, receiver], {
      ...base,
      title: `🚌 Parcel ${id} is on the way`,
      body: `Bus ${bus} collected the parcel (${route}). You can track the bus live.`,
    });
  } else if (stage === "delivered") {
    await notifyPassengers(same ? [sender] : [sender, receiver], {
      ...base,
      title: `✅ Parcel ${id} delivered`,
      body: `Delivered to ${parcel.receivername || "the receiver"} at ${parcel.drop || "the destination"}.`,
    });
  }
};
import { getBusBlockReason } from "../utils/busAvailability.js";

export const createParcel = async (req, res) => {
  try {
    // Bus had an accident / broke down -> no new parcels on it
    const blockReason = await getBusBlockReason(req.body?.Bnumber || req.body?.busNumber);
    if (blockReason) {
      return res.status(409).json({ success: false, message: blockReason });
    }

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

    await notify({
      title: `📦 New parcel ${parcel.parcelId}`,
      body: `${parcel.pickup || "?"} → ${parcel.drop || "?"} on ${parcel.date || "-"} ${parcel.time || ""}. Bus ${parcel.Bnumber || "-"}.`,
      type: "parcel",
      audience: ["admin", "staff"],
      busNumber: parcel.Bnumber,
      data: { parcelId: parcel.parcelId },
    });

    await parcelPassengerAlert(parcel, "booked");

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
    const { Semail, status } = req.params;

    console.log("Search:", Semail, status);

    const parcels = await Parcel.find({
      Semail: Semail,
      status: status,
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
   console.log("Searching Bus ID:", parcelId); 
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
      pickupVerified:parcel.pickupVerified,
      status:parcel.status,
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

    const parcel = await Parcel.findOne({ parcelId: decoded.parcelId });

    if (!parcel) {
      return res.status(404).json({
        valid: false,
        reason: "Parcel not found",
      });
    }

    
    if (parcel.status === "Pending") {
      parcel.pickupVerified = true;
      parcel.pickupVerifiedAt = new Date();
      parcel.status = "PickedUp";

      await parcel.save();
      await parcelPassengerAlert(parcel, "pickup");

      await notify({
        title: `📦 Parcel ${parcel.parcelId} picked up`,
        body: `Bus ${parcel.Bnumber || "-"} collected the parcel (${parcel.pickup || "?"} → ${parcel.drop || "?"}).`,
        type: "parcel",
        audience: ["admin", "staff"],
        busNumber: parcel.Bnumber,
        data: { parcelId: parcel.parcelId },
      });

      return res.json({
        valid: true,
        stage: "pickup",
        message: "Parcel pickup verified successfully.",
        parcel,
      });
    }

    // Second Scan -> PickedUp → Delivered
    if (parcel.status === "PickedUp") {
      parcel.delivered = true;
      parcel.deliveredAt = new Date();
      parcel.status = "Delivered";

      await parcel.save();
      await parcelPassengerAlert(parcel, "delivered");

      await notify({
        title: `✅ Parcel ${parcel.parcelId} delivered`,
        body: `Delivered to ${parcel.receivername || "the receiver"} at ${parcel.drop || "destination"}.`,
        type: "parcel",
        audience: ["admin", "staff"],
        busNumber: parcel.Bnumber,
        data: { parcelId: parcel.parcelId },
      });

      return res.json({
        valid: true,
        stage: "delivery",
        message: "Parcel delivered successfully.",
        parcel,
      });
    }

    
    return res.json({
      valid: false,
      reason: "Parcel has already been delivered.",
    });

  } catch (error) {
    return res.status(400).json({
      valid: false,
      reason: "Invalid or expired QR code.",
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

export const getParcelBybusNumberandStatus = async (req, res) => {
  try {
    const { Bnumber, status } = req.params;

    console.log("Search:", Bnumber, status);

    const parcels = await Parcel.find({
      Bnumber: Bnumber,
      status: status,
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

export const markParcelDelivered = async (req, res) => {
  try {
    const { parcelId } = req.params;

    const parcel = await Parcel.findOne({ parcelId});

    if (!parcel) {
      return res.status(404).json({
        valid: false,
        reason: "Parcel not found",
      });
    }

    // First Scan -> Pending → PickedUp
    if (parcel.status === "Pending") {
      parcel.pickupVerified = true;
      parcel.pickupVerifiedAt = new Date();
      parcel.status = "PickedUp";

      await parcel.save();
      await parcelPassengerAlert(parcel, "pickup");

      await notify({
        title: `📦 Parcel ${parcel.parcelId} picked up`,
        body: `Bus ${parcel.Bnumber || "-"} collected the parcel (${parcel.pickup || "?"} → ${parcel.drop || "?"}).`,
        type: "parcel",
        audience: ["admin", "staff"],
        busNumber: parcel.Bnumber,
        data: { parcelId: parcel.parcelId },
      });

      return res.json({
        valid: true,
        stage: "pickup",
        message: "Parcel pickup verified successfully.",
        parcel,
      });
    }

    // Second Scan -> PickedUp → Delivered
    if (parcel.status === "PickedUp") {
      parcel.delivered = true;
      parcel.deliveredAt = new Date();
      parcel.status = "Delivered";

      await parcel.save();
      await parcelPassengerAlert(parcel, "delivered");

      await notify({
        title: `✅ Parcel ${parcel.parcelId} delivered`,
        body: `Delivered to ${parcel.receivername || "the receiver"} at ${parcel.drop || "destination"}.`,
        type: "parcel",
        audience: ["admin", "staff"],
        busNumber: parcel.Bnumber,
        data: { parcelId: parcel.parcelId },
      });

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
      reason: "Parcel has already been delivered.",
    });

  } catch (error) {
    return res.status(400).json({
      valid: false,
      reason: "Invalid or expired QR code.",
    });
  }
};

export const getParcel = async (req, res) => {
  try {
    const { status } = req.params;

    console.log("Search:", status);

    const parcels = await Parcel.find({status: status});

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

// Get all parcel details
export const getAllParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: parcels.length,
      parcels: parcels,
    });
  } catch (error) {
    console.error("Error fetching all parcels:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch parcel details",
      error: error.message,
    });
  }
};