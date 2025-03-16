import { handleClerkWebhook } from "../../controller/clerkWebHook.controller.js";
import { Router } from "express";

const clerkRoute = Router();

clerkRoute.route("/clerk").post(handleClerkWebhook);

export { clerkRoute};