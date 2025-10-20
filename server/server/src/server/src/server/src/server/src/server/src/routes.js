// Simple stub for Paystack initialize (works for testing UI).
export async function initSubscriptionCheckout({ email, amountSmallestUnit = 10000, userId, metadata = {} }) {
  return {
    authorization_url: "https://paystack.com/pay/your-demo-link",
    reference: "DEMO_REF"
  };
}
