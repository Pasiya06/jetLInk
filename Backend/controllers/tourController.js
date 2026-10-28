import jwt from "jsonwebtoken";
import Receipt from "../models/Tour.js";
import { notify, notifyPassengers } from "./notificationController.js";
import Package from "../models/Package.js";
import Bus from "../models/Bus.js";
import Passenger from "../models/Passenger.js";
import { validateCard } from "./paymentController.js";
import { getBusBlockReason } from "../utils/busAvailability.js";


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

// Emails of passengers with a tour on this bus that hasn't ended yet
export const getActiveTourEmails = async (busNumber) => {
  const today = todayDayNumber();
  const tours = await Receipt.find({ busNumber }).select("pemail date tripDuration");
  return tours
    .filter((t) => {
      const end = tourEndDay(t);
      return end == null || end >= today;
    })
    .map((t) => t.pemail);
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

/* =====================================
   TOUR STATUS: "active" or "gone"
   Gone = QR already scanned by bus staff, or the last trip day has passed.
===================================== */

const tourEndDay = (r) => {
  const start = toDayNumber(r.date);
  if (start == null) return null;
  return start + parseTripDays(r.tripDuration) - 1;
};

export const getTourStatus = (r) => {
  if (r.scanned) return "gone";
  const end = tourEndDay(r);
  if (end != null && end < todayDayNumber()) return "gone";
  return "active";
};

// Receipt + status fields for the app
const withStatus = (r) => {
  const obj = typeof r.toObject === "function" ? r.toObject() : r;
  const end = tourEndDay(obj);
  return {
    ...obj,
    status: getTourStatus(obj),
    tripEnd: end != null ? dayNumberToString(end) : "",
  };
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

    const blockReason = await getBusBlockReason(busNumber);
    if (blockReason) {
      return res.status(200).json({ success: true, available: false, message: blockReason });
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
      pickupLat,
      pickupLng,
      pickupAddress,
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
      nameOnCard,
      cardLast4,
    } = req.body;

    // Map pickup point is optional; keep it only if both numbers are valid
    const lat = Number(pickupLat);
    const lng = Number(pickupLng);
    const hasPickupPoint =
      pickupLat !== undefined && pickupLat !== "" && pickupLng !== undefined && pickupLng !== "" &&
      Number.isFinite(lat) && Number.isFinite(lng);

    // Date must be at least a week ahead, and the bus must be free on every trip day
    const dateError = checkTourDate(date);
    if (dateError) {
      return res.status(400).json({ success: false, message: dateError });
    }
    const blockReason = await getBusBlockReason(busNumber);
    if (blockReason) {
      return res.status(409).json({ success: false, message: blockReason });
    }

    const clashes = await findBookedBuses(date, parseTripDays(tripDuration), busNumber);
    if (clashes.length) {
      return res.status(409).json({
        success: false,
        message: `Bus ${busNumber} is already booked from ${clashes[0].from} to ${clashes[0].to}.`,
      });
    }

    // Load the package, bus and passenger so their full details are saved with the booking
    const [pkg, bus, passenger] = await Promise.all([
      packageId ? Package.findById(packageId).lean().catch(() => null) : null,
      Bus.findOne({ busNumber }).select("busName noOfSeats colour busType").lean(),
      Pid ? Passenger.findById(Pid).select("NIC address").lean().catch(() => null) : null,
    ]);

    // Save the distance as a number of km; fall back to the package if it's missing
    let distanceKm = parseDistanceKm(totalDistance);
    if (!distanceKm) distanceKm = parseDistanceKm(pkg?.totalDistance);

    const packageDetails = {
      title: pkg?.title || "",
      destination: pkg?.destination || "",
      packageType: pkg?.packageType || packageType || "",
      description: pkg?.description || description || "",
      busType: pkg?.busType || "",
      totalDistance: pkg?.totalDistance || String(totalDistance ?? ""),
      tripDuration: pkg?.tripDuration || tripDuration || "",
      maxPassengers: Number(pkg?.maxPassengers ?? maxPassengers) || 0,
      maxPrice: Number(pkg?.maxPrice ?? maxPrice) || 0,
      extraKmPrice: Number(pkg?.extraKmPrice) || 0,
      pickupMinKm: Number(pkg?.pickupMinKm) || 0,
      pickupMaxKm: Number(pkg?.pickupMaxKm) || 0,
      places: [...(pkg?.places ?? [])]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((p) => ({
          name: p.name,
          description: p.description,
          icon: p.icon,
          iconType: p.iconType,
          color: p.color,
          order: p.order,
        })),
    };

    const busDetails = {
      busName: bus?.busName || "",
      noOfSeats: String(bus?.noOfSeats ?? ""),
      colour: bus?.colour || "",
      busType: bus?.busType || "",
    };

    const startDay = toDayNumber(date);
    const tripEndDate =
      startDay != null ? dayNumberToString(startDay + parseTripDays(tripDuration) - 1) : "";

    const payment = {
      amount: Number(maxPrice) || packageDetails.maxPrice,
      method: "card",
      nameOnCard: String(nameOnCard || "").trim(),
      cardLast4: String(cardLast4 || "").replace(/\D/g, "").slice(-4),
      status: "paid",
      paidAt: new Date(),
    };

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
      pickupLat: hasPickupPoint ? lat : null,
      pickupLng: hasPickupPoint ? lng : null,
      pickupAddress: pickupAddress || "",
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
      pNIC: passenger?.NIC || "",
      paddress: passenger?.address || "",
      tripEndDate,
      packageDetails,
      busDetails,
      payment,
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

    await notifyPassengers(pemail, {
      title: "🏝️ Tour booking confirmed",
      body: `Booking ${receiptId}: ${packageType || "Tour"} package on ${date || "-"}${time ? ` at ${time}` : ""}${pickup ? `, pickup ${pickup}` : ""}. Bus ${busNumber || "-"}.`,
      type: "tour",
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
      receipts: receipts.map(withStatus),
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
      receipt: withStatus(receipt),
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
      receipts: receipts.map(withStatus), 
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
      receipts: receipts.map(withStatus), 
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

    // No QR for a tour that's already scanned or finished
    if (getTourStatus(tour) === "gone") {
      return res.status(400).json({
        error: tour.scanned
          ? "This QR code has already been scanned."
          : "This tour has already ended.",
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

// POST /api/receipts/verify  { qrToken, busNumber }
// Bus staff scan the passenger's tour QR. A QR can be scanned only once.
export const verifyTourQR = async (req, res) => {
  const { qrToken, busNumber } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(qrToken, process.env.QR_SECRET);
  } catch {
    return res.json({ valid: false, reason: "Invalid or expired QR" });
  }

  try {
    if (!decoded?.receiptId) {
      return res.json({ valid: false, reason: "Not a tour QR code" });
    }

    const tour = await Receipt.findOne({ receiptId: decoded.receiptId });
    if (!tour) {
      return res.json({ valid: false, reason: "Booking not found" });
    }

    if (busNumber && tour.busNumber !== busNumber) {
      return res.json({
        valid: false,
        reason: `This booking is for bus ${tour.busNumber}`,
      });
    }

    if (tour.scanned) {
      return res.json({ valid: false, reason: "QR already scanned" });
    }

    const start = toDayNumber(tour.date);
    const end = tourEndDay(tour);
    const today = todayDayNumber();

    if (end != null && end < today) {
      return res.json({ valid: false, reason: "This tour has ended" });
    }

    tour.scanned = true;
    tour.scannedAt = new Date();
    tour.scannedBy = busNumber || "";
    await tour.save();

    await notify({
      title: `✅ Tour ${tour.receiptId} boarded`,
      body: `${tour.pfirstName || ""} ${tour.plastName || ""} boarded bus ${tour.busNumber}.`,
      type: "tour",
      audience: ["admin", "staff"],
      busNumber: tour.busNumber,
      data: { receiptId: tour.receiptId },
    });

    await notifyPassengers(tour.pemail, {
      title: "✅ Welcome aboard!",
      body: `Your tour ${tour.receiptId} has started on bus ${tour.busNumber}. Enjoy the trip!`,
      type: "tour",
      busNumber: tour.busNumber,
      data: { receiptId: tour.receiptId },
    });

    res.json({
      valid: true,
      // Scanned before the first trip day (allowed, but staff are warned)
      early: start != null && start > today,
      tour: {
        receiptId: tour.receiptId,
        passengerName: `${tour.pfirstName || ""} ${tour.plastName || ""}`.trim(),
        pphoneNumber: tour.pphoneNumber,
        packageType: tour.packageType,
        date: tour.date,
        tripEnd: end != null ? dayNumberToString(end) : "",
        time: tour.time,
        pickup: tour.pickupAddress || tour.pickup,
        maxPassengers: tour.maxPassengers,
      },
    });
  } catch (error) {
    console.log("Verify tour QR error:", error);
    res.status(500).json({ valid: false, reason: "Server error. Please try again." });
  }
};

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

    await notifyPassengers(receipt.pemail, {
      title: "💳 Extra km payment successful",
      body: `You added ${kmNumber} km (LKR ${amount.toLocaleString()}) to tour ${receipt.receiptId}.`,
      type: "tour",
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
