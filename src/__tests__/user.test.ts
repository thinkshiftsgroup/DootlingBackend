import request from "supertest";
import app from "../app";
import { prisma } from "../prisma";

describe("User Profile API", () => {
  let accessToken: string;
  let userId: number;

  beforeAll(async () => {
    // Register and verify a test user
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        email: "testuser@example.com",
        firstname: "Test",
        lastname: "User",
        password: "password123",
        phone: "+1234567890",
      });

    userId = registerRes.body.userId;

    // Manually verify the user for testing
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });
    }

    // Login to get access token
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "testuser@example.com",
        password: "password123",
      });

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    await prisma.$disconnect();
  });

  describe("GET /api/user/profile", () => {
    it("should get user profile", async () => {
      const res = await request(app)
        .get("/api/user/profile")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty("email", "testuser@example.com");
      expect(res.body.user).toHaveProperty("firstname", "Test");
      expect(res.body.user).toHaveProperty("lastname", "User");
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/user/profile");

      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/user/profile", () => {
    it("should update user profile", async () => {
      const res = await request(app)
        .put("/api/user/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          firstname: "Updated",
          lastname: "Name",
          phone: "+9876543210",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Profile updated successfully");
      expect(res.body.user.firstname).toBe("Updated");
      expect(res.body.user.lastname).toBe("Name");
      expect(res.body.user.phone).toBe("+9876543210");
    });

    it("should reject empty firstname", async () => {
      const res = await request(app)
        .put("/api/user/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          firstname: "   ",
        });

      expect(res.status).toBe(400);
    });
  });
});
