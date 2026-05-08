// ─────────────────────────────────────────────
// Plan feature gates for OrderFlow
// Usage: planAccess.canUseAnalytics(restaurant.plan)
// ─────────────────────────────────────────────

export const PLANS = {
  trial:      { label: "Free Trial",  price: 0,   priceLabel: "Free",      color: "#6B7280" },
  starter:    { label: "Starter",     price: 99,  priceLabel: "SAR 99",    color: "#3B82F6" },
  pro:        { label: "Pro",         price: 199, priceLabel: "SAR 199",   color: "#D4A853" },
  enterprise: { label: "Enterprise",  price: 399, priceLabel: "SAR 399",   color: "#8B5CF6" },
};

export const PLAN_FEATURES = {
  trial: {
    maxMenuItems:      10,
    analytics:         false,
    orderHistory:      "1day",
    multiBranch:       false,
    customDomain:      false,
    prioritySupport:   false,
    aiWriter:          true,
    qrCode:            true,
    whatsappOrders:    true,
    unlimitedItems:    false,
  },
  starter: {
    maxMenuItems:      30,
    analytics:         false,
    orderHistory:      "7days",
    multiBranch:       false,
    customDomain:      false,
    prioritySupport:   false,
    aiWriter:          true,
    qrCode:            true,
    whatsappOrders:    true,
    unlimitedItems:    false,
  },
  pro: {
    maxMenuItems:      999,
    analytics:         true,
    orderHistory:      "90days",
    multiBranch:       false,
    customDomain:      false,
    prioritySupport:   false,
    aiWriter:          true,
    qrCode:            true,
    whatsappOrders:    true,
    unlimitedItems:    true,
  },
  enterprise: {
    maxMenuItems:      999,
    analytics:         true,
    orderHistory:      "unlimited",
    multiBranch:       true,
    customDomain:      true,
    prioritySupport:   true,
    aiWriter:          true,
    qrCode:            true,
    whatsappOrders:    true,
    unlimitedItems:    true,
  },
};

// ── Helper functions ──────────────────────────────────────
export function getFeatures(plan) {
  return PLAN_FEATURES[plan] || PLAN_FEATURES.trial;
}

export function canUseAnalytics(plan) {
  return getFeatures(plan).analytics;
}

export function canAddMoreItems(plan, currentCount) {
  return currentCount < getFeatures(plan).maxMenuItems;
}

export function getOrderHistoryDays(plan) {
  const h = getFeatures(plan).orderHistory;
  if (h === "1day")     return 1;
  if (h === "7days")    return 7;
  if (h === "90days")   return 90;
  if (h === "unlimited") return 36500; // 100 years = unlimited
  return 1;
}

export function isTrialExpired(restaurant) {
  if (restaurant.plan !== "trial") return false;
  if (!restaurant.trialEndsAt) return false;
  return new Date() > new Date(restaurant.trialEndsAt);
}

export function isPaidPlan(plan) {
  return ["starter", "pro", "enterprise"].includes(plan);
}

export function planRank(plan) {
  const ranks = { trial: 0, starter: 1, pro: 2, enterprise: 3 };
  return ranks[plan] ?? 0;
}

export function isAtLeast(plan, required) {
  return planRank(plan) >= planRank(required);
}