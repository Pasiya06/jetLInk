import jwt from "jsonwebtoken";
import Receipt from "../models/Tour.js";
import { notify } from "./notificationController.js";
import Package from "../models/Package.js";
import { validateCard } from "./paymentController.js";


/* =====================================
   TOUR DATE / BUS AVAILABILITY HELPERS
   Tour dates are stored as "MM/DD/YYYY".
===================================== */

export const MIN_DAYS_AHEAD = 7;

// "2D / 1N" → 2, "3 days" → 3, "1 day" → 1, anything else → 1
export const parseTripDays = (tripDuration) => {
  const text = String(tripDuration || "");
  const dayMatch = /(\d+)\s*(d\b|day)/i.exec(text);
  const n = dayMatch ? Number(dayMatch[1]) : Number((/(\d+)/.exec(text) || [])[1]);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 30) : 1;
};

// "MM/DD/YYYY" → day number (days since 1970, so dates compare as integers)
const toDayNumber = (value) => {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value || "").trim());
  if (!m) return null;
  const ms = Date.UTC(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
  const d = new Date(ms);
  if (d.getUTCMonth() !== Number(m[1]) - 1 || d.getUTCDate() !== Number(m[2])) return null;
  return Math.floor(ms / 86400000);
};

const dayNumberToString = (n) => {
  const d = new Date(n * 86400000);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getUTCFullYear()}`;
};

// Today in Sri Lanka as a day number
const todayDayNumber = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()); // "MM/DD/YYYY"
  return toDayNumber(parts);
};

// Bus numbers (and their booked dates) that clash with [date, date + days - 1]
const findBookedBuses = async (date, days, onlyBus) => {
  const start = toDayNumber(date);
  const end = start + days - 1;
  const query = onlyBus ? { busNumber: onlyBus } : {};
  const receipts = await Receipt.find(query).select("busNumber date tripDuration receiptId");

  const clashes = [];
  for (const r of receipts) {
    const rStart = toDayNumber(r.date);
    if (rStart == null) continue;
    const rEnd = rStart + parseTripDays(r.tripDuration) - 1;
    if (rStart <= end && start <= rEnd) {
      clashes.push({
        busNumber: r.busNumber,
        from: dayNumberToString(rStart),
        to: dayNumberToString(rEnd),
      });
    }
  }
  return clashes;
};

// Shared validation for the requested start date
const checkTourDate = (date) => {
  const start = toDayNumber(date);
  if (start == null) return "Date must be in MM/DD/YYYY format";
  const earliest = todayDayNumber() + MIN_DAYS_AHEAD;
  if (start < earliest) {
    return `Tours must be booked at least ${MIN_DAYS_AHEAD} days ahead. Earliest date: ${dayNumberToString(earliest)}`;
  }
  return null;
};

// GET /api/receipts/booked-buses?date=MM/DD/YYYY&tripDuration=2D%20/%201N
// → bus numbers that are already booked on any day of this trip
export const getBookedBuses = async (req, res) => {
  try {
    const { date, tripDuration } = req.query;
    const dateError = checkTourDate(date);
    if (dateError) {
      return res.status(400).json({ success: false, message: dateError });
    }

    const days = parseTripDays(tripDuration);
    const clashes = await findBookedBuses(date, days);

    return res.status(200).json({
      success: true,
      days,
      from: date,
      to: dayNumberToString(toDayNumber(date) + days - 1),
      bookedBuses: [...new Set(clashes.map((c) => c.busNumber))],
      bookings: clashes,
    });
  } catch (error) {
    console.error("Booked buses error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/receipts/check-bus?busNumber=..&date=..&tripDuration=..
// Used right before payment so nobody pays for a bus that was just taken
export const checkBusAvailable = async (req, res) => {
  try {
    const { busNumber, date, tripDuration } = req.query;
    if (!busNumber) {
      return res.status(400).json({ success: false, message: "busNumber is required" });
    }
    const dateError = checkTourDate(date);
    if (dateError) {
      return res.status(400).json({ success: false, available: false, message: dateError });
    }

    const clashes = await findBookedBuses(date, parseTripDays(tripDuration), busNumber);
    if (clashes.length) {
      return res.status(200).json({
        success: true,
        available: false,
        message: `Bus ${busNumber} is already booked from ${clashes[0].from} to ${clashes[0].to}. Please choose another bus.`,
      });
    }
    return res.status(200).json({ success: true, available: true });
  } catch (error) {
    console.error("Check bus error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// "700km", "700 km", "1,200 KM" or 700 -> 700 (0 if no number)
export const parseDistanceKm = (value) => {
  const match = String(value ?? "").replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

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

    // Date must be at least a week ahead, and the bus must be free on every trip day
    const dateError = checkTourDate(date);
    if (dateError) {
      return res.status(400).json({ success: false, message: dateError });
    }
    const clashes = await findBookedBuses(date, parseTripDays(tripDuration), busNumber);
    if (clashes.length) {
      return res.status(409).json({
        success: false,
        message: `Bus ${busNumber} is already booked from ${clashes[0].from} to ${clashes[0].to}.`,
      });
    }

    // Save the distance as a number of km; fall back to the package if it's missing
    let distanceKm = parseDistanceKm(totalDistance);
    if (!distanceKm && packageId) {
      try {
        const pkg = await Package.findById(packageId).select("totalDistance");
        distanceKm = parseDistanceKm(pkg?.totalDistance);
      } catch {
        // invalid packageId - keep 0
      }
    }

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
      totalDistance: distanceKm,
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

    await notify({
      title: `🏝️ New tour booking ${receiptId}`,
      body: `${pfirstName || ""} ${plastName || ""} booked a ${packageType || "tour"} on ${date || "-"}${pickup ? ` from ${pickup}` : ""}. Bus ${busNumber || "-"}.`,
      type: "tour",
      audience: ["admin", "staff"],
      busNumber,
      data: { receiptId },
    });

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

/* =====================================
   EXTRA KILOMETERS (paid by passenger)
===================================== */

const MAX_EXTRA_KM_PER_PAYMENT = 2000;

const getPricePerKm = async (packageId) => {
  try {
    const pkg = await Package.findById(packageId).select("extraKmPrice");
    return pkg ? Number(pkg.extraKmPrice) || 0 : 0;
  } catch {
    return 0; // packageId is not a valid id
  }
};

// GET /api/receipts/:receiptId/extra-km
export const getExtraKm = async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ receiptId: req.params.receiptId });
    if (!receipt) {
      return res.status(404).json({ success: false, message: "Receipt not found" });
    }

    return res.status(200).json({
      success: true,
      pricePerKm: await getPricePerKm(receipt.packageId),
      extraKm: receipt.extraKm || 0,
      extraKmAmount: receipt.extraKmAmount || 0,
      payments: receipt.extraKmPayments || [],
    });
  } catch (error) {
    console.error("Get extra km error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/receipts/:receiptId/extra-km
// Body: { km, pemail, cardNumber, expiry, cvc }
// Charges the card and records the extra km in one step.
export const payExtraKm = async (req, res) => {
  try {
    const { km, pemail, cardNumber, expiry, cvc } = req.body;
    const kmNumber = Number(km);

    if (!Number.isInteger(kmNumber) || kmNumber < 1) {
      return res.status(400).json({ success: false, message: "Extra kilometers must be a whole number of 1 or more" });
    }
    if (kmNumber > MAX_EXTRA_KM_PER_PAYMENT) {
      return res.status(400).json({ success: false, message: `You can add up to ${MAX_EXTRA_KM_PER_PAYMENT} km at a time` });
    }

    const receipt = await Receipt.findOne({ receiptId: req.params.receiptId });
    if (!receipt) {
      return res.status(404).json({ success: false, message: "Receipt not found" });
    }

    // Only the passenger who booked can add km
    if (!pemail || String(pemail).trim().toLowerCase() !== receipt.pemail) {
      return res.status(403).json({ success: false, message: "This booking belongs to another passenger" });
    }

    const pricePerKm = await getPricePerKm(receipt.packageId);
    if (pricePerKm <= 0) {
      return res.status(400).json({ success: false, message: "Extra kilometers are not available for this package" });
    }

    const cardError = validateCard({ cardNumber, expiry, cvc });
    if (cardError) {
      return res.status(400).json({ success: false, message: cardError });
    }

    const amount = kmNumber * pricePerKm;
    receipt.extraKmPayments.push({
      km: kmNumber,
      pricePerKm,
      amount,
      cardLast4: String(cardNumber).replace(/\s/g, "").slice(-4),
    });
    receipt.extraKm = (receipt.extraKm || 0) + kmNumber;
    receipt.extraKmAmount = (receipt.extraKmAmount || 0) + amount;
    await receipt.save();

    await notify({
      title: `➕ Extra km paid ${receipt.receiptId}`,
      body: `${receipt.pfirstName || ""} ${receipt.plastName || ""} added ${kmNumber} km (LKR ${amount.toLocaleString()}) to the tour on ${receipt.date}. Bus ${receipt.busNumber}.`,
      type: "tour",
      audience: ["admin", "staff"],
      busNumber: receipt.busNumber,
      data: { receiptId: receipt.receiptId },
    });

    return res.status(200).json({
      success: true,
      message: `Paid LKR ${amount.toLocaleString()} for ${kmNumber} extra km`,
      payment: receipt.extraKmPayments[receipt.extraKmPayments.length - 1],
      extraKm: receipt.extraKm,
      extraKmAmount: receipt.extraKmAmount,
      pricePerKm,
    });
  } catch (error) {
    console.error("Pay extra km error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
