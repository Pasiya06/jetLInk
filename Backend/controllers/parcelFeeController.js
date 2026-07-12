import ParcelFee from "../models/ParcelFee.js";

// Get Parcel Fee
export const getParcelFee = async (req, res) => {
  try {
    const parcelFee = await ParcelFee.findOne();

    if (!parcelFee) {
      return res.status(404).json({
        success: false,
        message: "Parcel fee details not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: parcelFee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Parcel Fee
export const updateParcelFee = async (req, res) => {
  try {
    const { busFare, weighFare, serviceTax } = req.body;

    let parcelFee = await ParcelFee.findOne();

    if (!parcelFee) {
      parcelFee = await ParcelFee.create({
        busFare,
        weighFare,
        serviceTax,
      });
    } else {
      parcelFee.busFare = busFare;
      parcelFee.weighFare = weighFare;
      parcelFee.serviceTax = serviceTax;

      await parcelFee.save();
    }

    res.status(200).json({
      success: true,
      message: "Parcel fee updated successfully.",
      data: parcelFee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};