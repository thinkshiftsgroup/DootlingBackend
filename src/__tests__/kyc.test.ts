import request from "supertest";
import app from "../app";
import { prisma } from "../prisma";

describe("KYC API", () => {
  let accessToken: string;
  let userId: number;

  beforeAll(async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        email: "kyctest@example.com",
        firstname: "KYC",
        lastname: "Test",
        password: "password123",
      });

    userId = registerRes.body.userId;

    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "kyctest@example.com",
        password: "password123",
      });

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.pep.deleteMany({ where: { userId } }).catch(() => {});
    await prisma.kycDocument.deleteMany({ where: { userId } }).catch(() => {});
    await prisma.userKycProfile.delete({ where: { userId } }).catch(() => {});
    await prisma.businessKyc.delete({ where: { userId } }).catch(() => {});
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    await prisma.$disconnect();
  });

  describe("Personal KYC", () => {
    it("should create personal KYC profile", async () => {
      const res = await request(app)
        .put("/api/kyc/personal")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          middleName: "Middle",
          gender: "Male",
          dateOfBirth: "1990-01-01",
          meansOfIdentification: "NIN",
          identificationNumber: "12345678901",
          countryOfResidency: "Nigeria",
          contactAddress: "123 Test Street, Lagos",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("created");
      expect(res.body.profile.gender).toBe("Male");
    });

    it("should get personal KYC profile", async () => {
      const res = await request(app)
        .get("/api/kyc/personal")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.profile).toHaveProperty("gender", "Male");
    });

    it("should update personal KYC profile", async () => {
      const res = await request(app)
        .put("/api/kyc/personal")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          gender: "Female",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("updated");
    });
  });

  describe("Business KYC", () => {
    it("should create business KYC", async () => {
      const res = await request(app)
        .put("/api/kyc/business")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          businessName: "Test Business Ltd",
          companyType: "Limited Liability Company",
          incorporationNumber: "RC123456",
          dateOfIncorporation: "2020-01-01",
          countryOfIncorporation: "Nigeria",
          taxNumber: "TAX123456",
          companyAddress: "456 Business Ave",
          zipOrPostcode: "100001",
          stateOrProvince: "Lagos",
          city: "Lagos",
          businessDescription: "E-commerce platform",
          companyWebsite: "https://testbusiness.com",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("created");
      expect(res.body.profile.businessName).toBe("Test Business Ltd");
    });

    it("should get business KYC", async () => {
      const res = await request(app)
        .get("/api/kyc/business")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.profile).toHaveProperty("businessName", "Test Business Ltd");
    });

    it("should reject empty business name", async () => {
      const res = await request(app)
        .put("/api/kyc/business")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          businessName: "   ",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("KYC Documents", () => {
    it("should save document URLs", async () => {
      const res = await request(app)
        .put("/api/kyc/documents")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          documents: [
            { type: "GOVERNMENT_ID", url: "https://example.com/id.pdf" },
            { type: "PROOF_OF_ADDRESS", url: "https://example.com/address.pdf" },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("saved");
      expect(res.body.count).toBe(2);
    });

    it("should get documents", async () => {
      const res = await request(app)
        .get("/api/kyc/documents")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.documents).toHaveLength(2);
    });
  });

  describe("PEPS", () => {
    it("should save PEPs", async () => {
      const res = await request(app)
        .put("/api/kyc/peps")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          peps: [
            {
              name: "John Doe",
              position: "Senator",
              description: "Member of Senate",
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("saved");
      expect(res.body.count).toBe(1);
    });

    it("should get PEPs", async () => {
      const res = await request(app)
        .get("/api/kyc/peps")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.peps).toHaveLength(1);
      expect(res.body.peps[0].name).toBe("John Doe");
    });
  });

  describe("KYC Submission", () => {
    it("should submit KYC for approval", async () => {
      const res = await request(app)
        .post("/api/kyc/submit")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("submitted");
      expect(res.body.profile.status).toBe("SUBMITTED");
    });
  });
});
