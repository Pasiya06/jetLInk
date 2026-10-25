import express from "express";
import {
  loginAdmin,
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/", getAdmins);
router.post("/", createAdmin);
router.get("/:id", getAdminById);
router.put("/:id", updateAdmin);

export default router;
