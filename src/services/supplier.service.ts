import { prisma } from "../prisma";
import { ContactType } from "@prisma/client";
import { uploadToCloudinary } from "@utils/cloudinary";

interface SupplierEmailInput {
  email: string;
  type: ContactType;
}

interface SupplierPhoneInput {
  phone: string;
  type: ContactType;
}

interface SupplierAddressInput {
  title?: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

interface CreateSupplierInput {
  name: string;
  supplierId?: string;
  imageUrl?: string;
  notes?: string;
  isActive?: boolean;
  emails?: SupplierEmailInput[];
  phones?: SupplierPhoneInput[];
  addresses?: SupplierAddressInput[];
}

interface UpdateSupplierInput {
  name?: string;
  supplierId?: string;
  imageUrl?: string;
  notes?: string;
  isActive?: boolean;
  emails?: SupplierEmailInput[];
  phones?: SupplierPhoneInput[];
  addresses?: SupplierAddressInput[];
}

interface GetSuppliersQuery {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const supplierService = {
  async createSupplier(storeId: number, data: CreateSupplierInput) {
    const { emails, phones, addresses, ...supplierData } = data;
    
    return prisma.supplier.create({
      data: {
        storeId,
        ...supplierData,
        emails: emails ? { create: emails } : undefined,
        phones: phones ? { create: phones } : undefined,
        addresses: addresses ? { create: addresses } : undefined,
      },
      include: {
        emails: true,
        phones: true,
        addresses: true,
      },
    });
  },

  async getSuppliers(storeId: number, query: GetSuppliersQuery) {
    const { search, isActive, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        include: {
          emails: true,
          phones: true,
          addresses: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.supplier.count({ where }),
    ]);

    return {
      suppliers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAllSuppliers(storeId: number) {
    return prisma.supplier.findMany({
      where: { storeId, isActive: true },
      include: {
        emails: true,
        phones: true,
        addresses: true,
      },
      orderBy: { name: "asc" },
    });
  },

  async getSupplierById(id: number) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        emails: true,
        phones: true,
        addresses: true,
      },
    });
    if (!supplier) throw new Error("Supplier not found");
    return supplier;
  },

  async updateSupplier(id: number, data: UpdateSupplierInput) {
    const { emails, phones, addresses, ...supplierData } = data;

    return prisma.$transaction(async (tx) => {
      if (emails) {
        await tx.supplierEmail.deleteMany({ where: { supplierId: id } });
        await tx.supplierEmail.createMany({
          data: emails.map((e) => ({ ...e, supplierId: id })),
        });
      }

      if (phones) {
        await tx.supplierPhone.deleteMany({ where: { supplierId: id } });
        await tx.supplierPhone.createMany({
          data: phones.map((p) => ({ ...p, supplierId: id })),
        });
      }

      if (addresses) {
        await tx.supplierAddress.deleteMany({ where: { supplierId: id } });
        await tx.supplierAddress.createMany({
          data: addresses.map((a) => ({ ...a, supplierId: id })),
        });
      }

      return tx.supplier.update({
        where: { id },
        data: supplierData,
        include: {
          emails: true,
          phones: true,
          addresses: true,
        },
      });
    });
  },

  async deleteSupplier(id: number) {
    return prisma.supplier.delete({ where: { id } });
  },
};
