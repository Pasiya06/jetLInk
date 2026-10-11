import jwt from "jsonwebtoken";
import Receipt from "../models/Tour.js";

export const createReceipt = async (req, res) => {
  try {
    const {
      busNumber,
      driverNIC,
      conductorNIC,
      driverD,
      conductorD,
      isOnline,
      date,
      pickup,
      time,
      packageId,
      description,
      packageType,
      totalDistance,
      tripDuration,
      maxPassengers,
      maxPrice,
      Pid,
      Pid1,
      pfirstName,
      plastName,
      pphoneNumber,
      pemail,
    } = req.body;

    // Generate receipt ID
    const receiptId =
      "REC-" +
      Date.now().toString().slice(-8);

    const receipt = new Receipt({
      receiptId,
      busNumber,
      driverNIC,
      conductorNIC,
      driverD,
      conductorD,
      isOnline,
      date,
      pickup,
      time,
      packageId,
      description,
      packageType,
      totalDistance,
      tripDuration,
      maxPassengers,
      maxPrice,
      Pid,
      Pid1,
      pfirstName,
      plastName,
      pphoneNumber,
      pemail,
    });

    const savedReceipt = await receipt.save();

    res.status(201).json({
      success: true,
      message: "Receipt created successfully",
      receipt: savedReceipt,
    });
  } catch (error) {
    console.error("Create receipt error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create receipt",
      error: error.message,
    });
  }
};

export const getAllReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({})
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: receipts.length,
      receipts,
    });
  } catch (error) {
    console.error("Error fetching receipts:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch receipts",
      error: error.message,
    });
  }
};

export const getReceiptById = async (req, res) => {
  try {
    const { receiptId } = req.params;

    const receipt = await Receipt.findOne({ receiptId });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    res.status(200).json({
      success: true,
      receipt,
    });
  } catch (error) {
    console.error("Get receipt error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get receipt",
      error: error.message,
    });
  }
};

// Get all receipts by passenger email 
export const getReceiptsByEmail = async (req, res) => { 
  try { const { pemail } = req.params; 
    if (!pemail) { 
      return res.status(400).json({ 
        success: false, 
        message: "Passenger email is required", 
      }); 
    }

    const receipts = await Receipt.find({ 
      pemail: pemail.trim().toLowerCase(), 
    }).sort({ createdAt: -1 }); 
    
    return res.status(200).json({ 
      success: true, 
      count: receipts.length, 
      receipts, 
    }); 
  }

  catch (error) { 
    console.error("Error fetching receipts:", error); 
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch receipts", 
      error: error.message, 
    }); 
  } 
};

// Get all receipts by passenger Bus Number 
export const getReceiptsByBusNumber = async (req, res) => { 
  try { const { busNumber } = req.params; 
    if (!busNumber) { 
      return res.status(400).json({ 
        success: false, 
        message: "Passenger email is required", 
      }); 
    }

    const receipts = await Receipt.find({ 
      busNumber: busNumber
    }).sort({ createdAt: -1 }); 
    
    return res.status(200).json({ 
      success: true, 
      count: receipts.length, 
      receipts, 
    }); 
  }

  catch (error) { 
    console.error("Error fetching receipts:", error); 
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch receipts", 
      error: error.message, 
    }); 
  } 
};

export const generateTourQR = async (req, res) => {
  const { receiptId} = req.params;
   console.log("Searching Bus ID:", receiptId); 
  try {
    const tour = await Receipt.findOne({receiptId});
    
    if (!tour) {
      return res.status(404).json({
        error: "Receipt not found",
      });
    }

    const payload = {
      tourId: tour._id,
      receiptId: tour.receiptId,
      busNumber: tour.busNumber,
      date: tour.date,
      pickup: tour.pickup,
      time: tour.time,
      packageId: tour.packageId,
      pphoneNumber: tour.pphoneNumber,
      pemail:tour.pemail,
      issuedAt: Date.now(),
    };

    const token = jwt.sign(payload, process.env.QR_SECRET, {
      expiresIn: "12h",
    });

    res.json({
      qrToken: token,
      tour,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to generate tour QR",
    });
  }
};