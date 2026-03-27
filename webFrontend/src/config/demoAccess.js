/** Seeded admin user — see backend/prisma/seed.js. Optional env overrides for deployed demos. */
export function getDemoLoginPayload() {
  return {
    email: import.meta.env.VITE_DEMO_ADMIN_EMAIL || "admin@mail.com",
    password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "admin123",
  }
}
