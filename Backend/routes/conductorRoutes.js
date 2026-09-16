import express from "express";

import {
    addConductor,
    getConductors,
    getConductorById,
    deleteConductor,
    updateConductor,
    conductorLogin,
    checkNIC,
    loginConductor
} from "../controllers/conductorController.js";

const router = express.Router();

router.get("/check/:nic", checkNIC);


// Authentication routes
router.post("/login", loginConductor);


// CRUD routes
router.post("/", addConductor);

router.get("/", getConductors);

router.get("/:id", getConductorById);

router.put("/:id", updateConductor);

router.delete("/:id", deleteConductor);

export default router;