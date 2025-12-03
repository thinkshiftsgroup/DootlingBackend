import { prisma } from "../prisma";
import { newsletterService } from "./newsletter.service";

interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  instagramHandle?: string;
  additionalInfo?: string;
  customerGroupId?: number;
  shippingAddress?: string;
  shippingCountry?: string;
  shippingState?: string;
  shippingCity?: string;
  shippingZipCode?: string;
  billingAddress?: string;
  billingCountry?: string;
  billingState?: string;
  billingCity?: string;
  billingZipCode?: string;
  sameAsShippingAddress?: boolean;
  sendWelcomeEmail?: boolean;
  subscribedToNewsletter?: boolean;
}

interface UpdateCustomerInput extends Partial<CreateCustomerInput> {}

interface GetCustomersQuery {
  search?: string;
  customerGroupId?: number;
  page?: number;
  limit?: number;
}

export const customerService = {
  async createCustomer(storeId: number, data: CreateCustomerInput) {
    const customer = await prisma.customer.create({
      data: {
        storeId,
        ...data,
      },
      include: {
        customerGroup: true,
      },
    });

    // Send welcome email if requested and email is provided
    if (data.sendWelcomeEmail && customer.email) {
      try {
        await newsletterService.sendWelcomeEmail({
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
        });
      } catch (error) {
        console.error("Failed to send welcome email:", error);
        // Don't fail customer creation if email fails
      }
    }

    return customer;
  },

  async getCustomers(storeId: number, query: GetCustomersQuery) {
    const { search, customerGroupId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    
    if (customerGroupId) {
      where.customerGroupId = customerGroupId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customerGroup: true,
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAllCustomers(storeId: number) {
    return prisma.customer.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      include: {
        customerGroup: true,
      },
    });
  },

  async getCustomerById(id: number, storeId: number) {
    const customer = await prisma.customer.findFirst({
      where: { id, storeId },
      include: {
        customerGroup: true,
      },
    });
    if (!customer) throw new Error("Customer not found or access denied");
    return customer;
  },

  async updateCustomer(id: number, storeId: number, data: UpdateCustomerInput) {
    // Verify ownership first
    const customer = await prisma.customer.findFirst({
      where: { id, storeId }
    });
    if (!customer) throw new Error("Customer not found or access denied");

    return prisma.customer.update({
      where: { id },
      data,
      include: {
        customerGroup: true,
      },
    });
  },

  async deleteCustomer(id: number, storeId: number) {
    // Verify ownership first
    const customer = await prisma.customer.findFirst({
      where: { id, storeId }
    });
    if (!customer) throw new Error("Customer not found or access denied");

    return prisma.customer.delete({ where: { id } });
  },

  async getCustomerStats(storeId: number) {
    const [totalCustomers, customerGroups, newsletterSubscribers] = await Promise.all([
      prisma.customer.count({ where: { storeId } }),
      prisma.customerGroup.count({ where: { storeId } }),
      prisma.customer.count({ where: { storeId, subscribedToNewsletter: true } }),
    ]);

    return {
      totalCustomers,
      customerGroups,
      newsletterSubscribers,
    };
  },
};
