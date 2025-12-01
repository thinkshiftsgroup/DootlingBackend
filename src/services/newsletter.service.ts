import { prisma } from "../prisma";
import { sendEmail } from "@utils/email";

interface NewsletterSubscribeInput {
  email: string;
  firstName?: string;
  lastName?: string;
}

interface SendNewsletterInput {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export const newsletterService = {
  async subscribeToNewsletter(storeId: number, data: NewsletterSubscribeInput) {
    // Check if customer already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        storeId,
        email: data.email,
      },
    });

    if (existingCustomer) {
      // Update existing customer to subscribe
      return prisma.customer.update({
        where: { id: existingCustomer.id },
        data: { subscribedToNewsletter: true },
      });
    }

    // Create new customer with newsletter subscription
    return prisma.customer.create({
      data: {
        storeId,
        email: data.email,
        firstName: data.firstName || "Newsletter",
        lastName: data.lastName || "Subscriber",
        subscribedToNewsletter: true,
      },
    });
  },

  async unsubscribeFromNewsletter(storeId: number, email: string) {
    const customer = await prisma.customer.findFirst({
      where: {
        storeId,
        email,
      },
    });

    if (!customer) {
      throw new Error("Email not found in newsletter list");
    }

    return prisma.customer.update({
      where: { id: customer.id },
      data: { subscribedToNewsletter: false },
    });
  },

  async getNewsletterSubscribers(storeId: number, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [subscribers, total] = await Promise.all([
      prisma.customer.findMany({
        where: {
          storeId,
          subscribedToNewsletter: true,
          email: { not: null },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.count({
        where: {
          storeId,
          subscribedToNewsletter: true,
          email: { not: null },
        },
      }),
    ]);

    return {
      subscribers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async sendNewsletterToSubscribers(storeId: number, data: SendNewsletterInput) {
    const subscribers = await prisma.customer.findMany({
      where: {
        storeId,
        subscribedToNewsletter: true,
        email: { not: null },
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (subscribers.length === 0) {
      throw new Error("No subscribers found");
    }

    const emailPromises = subscribers.map((subscriber) => {
      const personalizedHtml = data.htmlContent
        .replace(/\{firstName\}/g, subscriber.firstName)
        .replace(/\{lastName\}/g, subscriber.lastName)
        .replace(/\{fullName\}/g, `${subscriber.firstName} ${subscriber.lastName}`);

      const personalizedText = data.textContent
        ? data.textContent
            .replace(/\{firstName\}/g, subscriber.firstName)
            .replace(/\{lastName\}/g, subscriber.lastName)
            .replace(/\{fullName\}/g, `${subscriber.firstName} ${subscriber.lastName}`)
        : undefined;

      return sendEmail({
        to: subscriber.email!,
        subject: data.subject,
        htmlBody: personalizedHtml,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return {
      totalSubscribers: subscribers.length,
      successful,
      failed,
    };
  },

  async sendWelcomeEmail(customer: { email: string; firstName: string; lastName: string }) {
    const subject = "Welcome to our store!";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Welcome, ${customer.firstName}!</h1>
        <p>Thank you for joining our community. We're excited to have you with us!</p>
        <p>As a valued customer, you'll receive:</p>
        <ul>
          <li>Exclusive offers and promotions</li>
          <li>Early access to new products</li>
          <li>Special discounts for subscribers</li>
        </ul>
        <p>Stay tuned for updates!</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          If you wish to unsubscribe, you can do so at any time from your account settings.
        </p>
      </div>
    `;

    const text = `Welcome, ${customer.firstName}! Thank you for joining our community.`;

    return sendEmail({
      to: customer.email,
      subject,
      htmlBody: html,
    });
  },

  async getNewsletterStats(storeId: number) {
    const [totalSubscribers, recentSubscribers, customersWithEmail] = await Promise.all([
      prisma.customer.count({
        where: {
          storeId,
          subscribedToNewsletter: true,
          email: { not: null },
        },
      }),
      prisma.customer.count({
        where: {
          storeId,
          subscribedToNewsletter: true,
          email: { not: null },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.customer.count({
        where: {
          storeId,
          email: { not: null },
        },
      }),
    ]);

    const subscriptionRate = customersWithEmail > 0 
      ? ((totalSubscribers / customersWithEmail) * 100).toFixed(2)
      : "0.00";

    return {
      totalSubscribers,
      recentSubscribers,
      subscriptionRate: `${subscriptionRate}%`,
    };
  },
};
