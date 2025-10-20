import { v4 as uuidv4 } from "uuid";

// simple in-memory storage
const users = new Map();

// create or get user by id
export function getUser(userId) {
  if (!userId) return null;
  return users.get(userId);
}

// register new free user
export function createUser() {
  const id = uuidv4();
  users.set(id, { id, used: 0, subscribed: false });
  return users.get(id);
}

// count each solve attempt
export function recordUsage(userId) {
  const u = users.get(userId);
  if (u && !u.subscribed) {
    u.used += 1;
  }
}

// verify if user can still use the solver
export function canUse(userId) {
  const u = users.get(userId);
  if (!u) return false;
  if (u.subscribed) return true;
  return u.used < 10; // 10-use trial
}

// mark user as subscribed after Paystack verification
export function markSubscribed(userId) {
  const u = users.get(userId);
  if (u) u.subscribed = true;
}
