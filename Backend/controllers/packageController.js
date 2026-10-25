import Package from "../models/Package.js";


/* =====================================
   CREATE PACKAGE
===================================== */

export const createPackage = async (req, res) => {
  try {
    const {
      title,
      destination,
      pickupMinKm,
      pickupMaxKm,
      busType,
      extraKmPrice,
      description,
      packageType,
      totalDistance,
      tripDuration,
      maxPassengers,
      maxPrice,
    } = req.body;

    const min = Number(pickupMinKm) || 0;
    const max = Number(pickupMaxKm) || 0;
    if (max && min > max) {
      return res.status(400).json({
        success: false,
        message: "Pickup 'from' km cannot be more than 'to' km",
      });
    }

    const newPackage = await Package.create({
      title,
      destination,
      pickupMinKm: min,
      pickupMaxKm: max,
      busType,
      extraKmPrice: Math.max(0, Number(extraKmPrice) || 0),
      description,
      packageType,
      totalDistance,
      tripDuration,
      maxPassengers,
      maxPrice,
      places: [],
    });

    res.status(201).json({
      success: true,
      message: "Package created successfully",
      data: newPackage,
    });

  } catch (error) {
    console.error("Create Package Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================
UPDATE PACKAGE
===================================== */

export const updatePackage = async (req, res) => {
  try {
  const {
  title,
  destination,
  pickupMinKm,
  pickupMaxKm,
  busType,
  extraKmPrice,
  description,
  packageType,
  totalDistance,
  tripDuration,
  maxPassengers,
  maxPrice,
  } = req.body;

  const packageData = await Package.findById(
    req.params.id
  );

  if (!packageData) {
    return res.status(404).json({
      success: false,
      message: "Package not found",
    });
  }


  /* ================= UPDATE FIELDS ================= */

  if (title !== undefined) {
    packageData.title = String(title).trim();
  }

  if (destination !== undefined) {
    packageData.destination = String(destination).trim();
  }

  if (pickupMinKm !== undefined) {
    packageData.pickupMinKm = Number(pickupMinKm) || 0;
  }

  if (pickupMaxKm !== undefined) {
    packageData.pickupMaxKm = Number(pickupMaxKm) || 0;
  }

  if (packageData.pickupMaxKm && packageData.pickupMinKm > packageData.pickupMaxKm) {
    return res.status(400).json({
      success: false,
      message: "Pickup 'from' km cannot be more than 'to' km",
    });
  }

  if (extraKmPrice !== undefined) {
    packageData.extraKmPrice = Math.max(0, Number(extraKmPrice) || 0);
  }

  if (busType !== undefined) {
    packageData.busType = String(busType).trim();
  }

  if (description !== undefined) {
    packageData.description = description.trim();
  }

  if (packageType !== undefined) {
    packageData.packageType = packageType.trim();
  }

  if (totalDistance !== undefined) {
    packageData.totalDistance = totalDistance.trim();
  }

  if (tripDuration !== undefined) {
    packageData.tripDuration = tripDuration.trim();
  }

  if (maxPassengers !== undefined) {
    packageData.maxPassengers = Number(maxPassengers);
  }

  if (maxPrice !== undefined) {
    packageData.maxPrice = Number(maxPrice);
  }


  await packageData.save();


  res.status(200).json({
    success: true,
    message: "Package updated successfully",
    data: packageData,
  });

  } catch (error) {

  console.error(
    "Update Package Error:",
    error
  );

  res.status(500).json({
    success: false,
    message: error.message,
  });

  }
};


/* =====================================
DELETE PACKAGE
===================================== */

export const deletePackage = async (req, res) => {
  try {

  const packageData =
    await Package.findByIdAndDelete(
      req.params.id
    );


  if (!packageData) {
    return res.status(404).json({
      success: false,
      message: "Package not found",
    });
  }


  res.status(200).json({
    success: true,
    message: "Package deleted successfully",
    data: packageData,
  });

  } catch (error) {

  console.error(
    "Delete Package Error:",
    error
  );

  res.status(500).json({
    success: false,
    message: error.message,
  });

  }
};



/* =====================================
   GET ALL PACKAGES
===================================== */

export const getPackages = async (req, res) => {
  try {
    const packages = await Package.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================
   GET PACKAGE BY ID
===================================== */

export const getPackageById = async (req, res) => {
  try {
    const packageData = await Package.findById(
      req.params.id
    );

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.status(200).json({
      success: true,
      data: packageData,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================
   ADD PLACE TO PACKAGE
===================================== */

export const addPlace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Place name is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Place description is required",
      });
    }

    const packageData = await Package.findById(
      req.params.id
    );

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const newPlace = {
      name: name.trim(),
      description: description.trim(),
      icon: "location-outline",
      iconType: "ion",
      color: "#12966F",
      order: packageData.places.length + 1,
    };

    packageData.places.push(newPlace);

    await packageData.save();

    const addedPlace =
      packageData.places[
        packageData.places.length - 1
      ];

    res.status(201).json({
      success: true,
      message: "Place added successfully",
      data: addedPlace,
      package: packageData,
    });

  } catch (error) {
    console.error("Add Place Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================
   UPDATE PLACE
===================================== */

export const updatePlace = async (req, res) => {
  try {
    const { name, description } = req.body;

    const packageData = await Package.findById(
      req.params.packageId
    );

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const place = packageData.places.id(
      req.params.placeId
    );

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    if (name !== undefined) {
      place.name = name.trim();
    }

    if (description !== undefined) {
      place.description = description.trim();
    }

    await packageData.save();

    res.status(200).json({
      success: true,
      message: "Place updated successfully",
      data: place,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================
   DELETE PLACE
===================================== */

export const deletePlace = async (req, res) => {
  try {
    const packageData = await Package.findById(
      req.params.packageId
    );

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const place = packageData.places.id(
      req.params.placeId
    );

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    place.deleteOne();

    /* Update order numbers */

    packageData.places.forEach(
      (item, index) => {
        item.order = index + 1;
      }
    );

    await packageData.save();

    res.status(200).json({
      success: true,
      message: "Place deleted successfully",
      data: packageData,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};