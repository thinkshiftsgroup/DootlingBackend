import { prisma } from "../prisma";
import { InvoiceStatus, PaymentMethod } from "@prisma/client";

interface InvoiceItemInput {
  productId: number;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

interface CreateInvoiceInput {
  invoiceNumber: string;
  warehouseId: number;
  customerId?: number;
  supplierId?: number;
  billerName: string;
  invoiceDate: Date;
  dueDate?: Date;
  paymentMethod?: PaymentMethod;
  paymentNote?: string;
  discountAmount?: number;
  status?: InvoiceStatus;
  notes?: string;
  createdBy?: string;
  items: InvoiceItemInput[];
}

interface UpdateInvoiceInput {
  warehouseId?: number;
  customerId?: number;
  supplierId?: number;
  billerName?: string;
  invoiceDate?: Date;
  dueDate?: Date;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentNote?: string;
  discountAmount?: number;
  status?: InvoiceStatus;
  notes?: string;
  items?: InvoiceItemInput[];
}

interface GetInvoicesQuery {
  search?: string;
  warehouseId?: number;
  customerId?: number;
  status?: InvoiceStatus;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export const invoiceService = {
  async createInvoice(storeId: number, data: CreateInvoiceInput) {
    const { items, ...invoiceData } = data;

    let totalAmount = 0;
    let taxAmount = 0;

    const itemsWithCalculations = items.map((item) => {
      const totalPrice = item.quantity * item.unitPrice;
      const itemTaxAmount = (totalPrice * (item.taxRate || 0)) / 100;
      totalAmount += totalPrice;
      taxAmount += itemTaxAmount;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        taxRate: item.taxRate || 0,
        taxAmount: itemTaxAmount,
      };
    });

    const discountAmount = data.discountAmount || 0;
    const finalTotal = totalAmount + taxAmount - discountAmount;
    const dueAmount = finalTotal - (data.status === "PAID" ? finalTotal : 0);

    return prisma.invoice.create({
      data: {
        storeId,
        ...invoiceData,
        totalAmount: finalTotal,
        taxAmount,
        discountAmount,
        paidAmount: data.status === "PAID" ? finalTotal : 0,
        dueAmount,
        items: {
          create: itemsWithCalculations,
        },
      },
      include: {
        warehouse: true,
        customer: true,
        supplier: true,
        items: {
          include: {
            product: { select: { id: true, name: true, productImages: true } },
          },
        },
      },
    });
  },

  async getInvoices(storeId: number, query: GetInvoicesQuery) {
    const {
      search,
      warehouseId,
      customerId,
      status,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    if (warehouseId) where.warehouseId = warehouseId;
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.totalAmount = {};
      if (minAmount !== undefined) where.totalAmount.gte = minAmount;
      if (maxAmount !== undefined) where.totalAmount.lte = maxAmount;
    }
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { billerName: { contains: search, mode: "insensitive" } },
        { customer: { firstName: { contains: search, mode: "insensitive" } } },
        { customer: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          warehouse: true,
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          supplier: { select: { id: true, name: true } },
          items: {
            include: {
              product: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { invoiceDate: "desc" },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAllInvoices(storeId: number) {
    return prisma.invoice.findMany({
      where: { storeId },
      include: {
        warehouse: true,
        customer: { select: { id: true, firstName: true, lastName: true } },
        supplier: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { invoiceDate: "desc" },
    });
  },

  async getInvoiceById(id: number) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        warehouse: true,
        customer: true,
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  },

  async updateInvoice(id: number, data: UpdateInvoiceInput) {
    const { items, ...invoiceData } = data;

    return prisma.$transaction(async (tx) => {
      const updateData: any = { ...invoiceData };

      if (items) {
        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

        let totalAmount = 0;
        let taxAmount = 0;

        const itemsWithCalculations = items.map((item) => {
          const totalPrice = item.quantity * item.unitPrice;
          const itemTaxAmount = (totalPrice * (item.taxRate || 0)) / 100;
          totalAmount += totalPrice;
          taxAmount += itemTaxAmount;

          return {
            invoiceId: id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice,
            taxRate: item.taxRate || 0,
            taxAmount: itemTaxAmount,
          };
        });

        await tx.invoiceItem.createMany({ data: itemsWithCalculations });

        const discountAmount = data.discountAmount || 0;
        const finalTotal = totalAmount + taxAmount - discountAmount;
        const paidAmount = data.paidAmount || 0;
        const dueAmount = finalTotal - paidAmount;

        updateData.totalAmount = finalTotal;
        updateData.taxAmount = taxAmount;
        updateData.dueAmount = dueAmount;
      }

      if (data.paidAmount !== undefined) {
        const invoice = await tx.invoice.findUnique({ where: { id } });
        if (invoice) {
          updateData.dueAmount = invoice.totalAmount - data.paidAmount;
          if (data.paidAmount >= invoice.totalAmount) {
            updateData.status = "PAID";
          } else if (data.paidAmount > 0) {
            updateData.status = "PARTIALLY_PAID";
          }
        }
      }

      return tx.invoice.update({
        where: { id },
        data: updateData,
        include: {
          warehouse: true,
          customer: true,
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  },

  async deleteInvoice(id: number) {
    return prisma.invoice.delete({ where: { id } });
  },
};
