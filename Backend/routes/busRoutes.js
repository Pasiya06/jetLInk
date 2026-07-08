import express from "express";
import {
  getBuses,
  createBus,
  deleteBus,
  updateBus,
} from "../controllers/busController.js";

const router = express.Router();

router.route("/")
  .get(getBuses)
  .post(createBus);

router.route("/:id")
  .put(updateBus)
  .delete(deleteBus);

export default router;