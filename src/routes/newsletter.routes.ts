import { Router } from "express";
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getNewsletterSubscribers,
  sendNewsletter,
  getNewsletterStats,
  exportNewsletterSubscribers,
} from "@controllers/newsletter.controller";

const router = Router();

router.post("/stores/:storeId/newsletter/subscribe", subscribeToNewsletter);
router.post("/stores/:storeId/newsletter/unsubscribe", unsubscribeFromNewsletter);
router.get("/stores/:storeId/newsletter/subscribers", getNewsletterSubscribers);
router.get("/stores/:storeId/newsletter/stats", getNewsletterStats);
router.get("/stores/:storeId/newsletter/export", exportNewsletterSubscribers);
router.post("/stores/:storeId/newsletter/send", sendNewsletter);

export { router as newsletterRouter };
