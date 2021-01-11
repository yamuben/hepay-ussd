import express from "express";
import ussdController from "../controllers/ussdController";

const ussdRouter = express.Router();

ussdRouter.post("/", ussdController.hpayLogin);

export default ussdRouter;