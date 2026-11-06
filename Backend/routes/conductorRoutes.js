import express from "express";

import {
    addConductor,
    getConductors,
    getConductorById,
    deleteConductor,
    updateConductor,

    checkNIC,
    loginConductor
} from "../controllers/conductorController.js";

import { requireRole, requireSelfOrStaff } from "../utils/auth.js";

const router = express.Router();

router.get("/check/:nic", checkNIC);


// Authentication routes
router.post("/login", loginConductor);


// CRUD routes
router.post("/", requireRole("admin"), addConductor);

router.get("/", requireRole("admin"), getConductors);

router.get("/:id", requireRole("staff"), getConductorById);

router.put("/:id", requireRole("admin"), updateConductor);

router.delete("/:id", requireRole("admin"), deleteConductor);

export default router;