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