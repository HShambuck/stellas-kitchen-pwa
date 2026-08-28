import client from "./client";

// ─── Staff Endpoints ──────────────────────────────────────────────────────────

/**
 * GET /api/orders — returns all orders currently awaiting kitchen action.
 */
export async function getPendingOrders() {
  const res = await client.get("/api/orders");
  return res.data;
}

/**
 * PATCH /api/orders/:id/status — moves an order through the kitchen lifecycle.
 */
export async function updateOrderStatus(
  orderId: string,
  statusState: "Pending" | "Preparing" | "Ready for Dispatch" | "Delivered"
) {
  const res = await client.patch(`/api/orders/${orderId}/status`, { statusState });
  return res.data;
}

/**
 * POST /api/orders/manual — staff manually creates an order.
 */
export async function createOrder(payload: Record<string, any>) {
  const res = await client.post("/api/orders/manual", payload);
  return res.data;
}

// ─── Rider Endpoints ──────────────────────────────────────────────────────────

/**
 * GET /api/orders/available-deliveries — orders READY_FOR_PICKUP within Shai Hills geo-range.
 */
export async function getAvailableDeliveries() {
  const res = await client.get("/api/orders/available-deliveries");
  return res.data;
}

/**
 * GET /api/riders/my-deliveries — rider's currently accepted / in-progress delivery (if any).
 */
export async function getMyActiveDelivery() {
  const res = await client.get("/api/riders/my-deliveries");
  return res.data;
}

/**
 * POST /api/orders/:id/accept — rider accepts a delivery from the available pool.
 */
export async function acceptDelivery(orderId: string | number) {
  const res = await client.post(`/api/orders/${orderId}/accept`);
  return res.data;
}