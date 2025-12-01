import { Request, Response } from "express";
import { newsletterService } from "@services/newsletter.service";
import { asyncHandler } from "@utils/asyncHandler";
import { Parser } from "json2csv";

export const subscribeToNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { email, firstName, lastName } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const customer = await newsletterService.subscribeToNewsletter(storeId, {
    email,
    firstName,
    lastName,
  });

  res.status(200).json({
    success: true,
    message: "Successfully subscribed to newsletter",
    data: customer,
  });
});

export const unsubscribeFromNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  await newsletterService.unsubscribeFromNewsletter(storeId, email);

  res.status(200).json({
    success: true,
    message: "Successfully unsubscribed from newsletter",
  });
});

export const getNewsletterSubscribers = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { page = "1", limit = "50" } = req.query;

  const result = await newsletterService.getNewsletterSubscribers(
    storeId,
    parseInt(page as string),
    parseInt(limit as string)
  );

  res.status(200).json({ success: true, data: result });
});

export const sendNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { subject, htmlContent, textContent } = req.body;

  if (!subject || !htmlContent) {
    return res.status(400).json({
      success: false,
      message: "Subject and HTML content are required",
    });
  }

  const result = await newsletterService.sendNewsletterToSubscribers(storeId, {
    subject,
    htmlContent,
    textContent,
  });

  res.status(200).json({
    success: true,
    message: "Newsletter sent successfully",
    data: result,
  });
});

export const getNewsletterStats = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const stats = await newsletterService.getNewsletterStats(storeId);

  res.status(200).json({ success: true, data: stats });
});

export const exportNewsletterSubscribers = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { subscribers } = await newsletterService.getNewsletterSubscribers(storeId, 1, 10000);

  const fields = ["id", "email", "firstName", "lastName", "createdAt"];
  const parser = new Parser({ fields });
  const csv = parser.parse(subscribers);

  res.header("Content-Type", "text/csv");
  res.attachment("newsletter-subscribers.csv");
  res.send(csv);
});
