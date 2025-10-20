import { Router } from "express";
import multer from "multer";
import { solveTextProblem } from "./solver.js";
import {
  createUser, getUser, canUse, recordUsage, markSubscribed
} from "./storage.js";
import { initSubscriptionCheckout } from "./paystack.js";
import express from "express";

const r = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3_000_000 } });

// identify the user (issue one if missing/unknown)
r.use((req, res, next) => {
  let uid = req.header("X-User-Id");
  let u = uid && getUser(uid);
  if (!u) {
    u = createUser();
    uid = u.id;
  }
  req.userId = uid;
  res.set("X-User-Id", uid);
  next();
});

// who am i / remaining uses
r.get("/me", (req, res) => {
  const u = getUser(req.userId);
  res.json({
    userId: u.id,
    used: u.used,
    subscribed: u.subscribed,
    usesLeft: u.subscribed ? Infinity : Math.max(0, 10 - u.used)
  });
});

// text solve
r.post("/solve", (req, res) => {
  const { problem } = req.body || {};
  if (!problem) return res.status(400).json({ ok: false, error: "problem is required" });

  const u = getUser(req.userId);
  if (!u.subscribed && !canUse(u.id)) {
    return res.status(402).json({ ok: false, paywall: true, message: "Free trial finished" });
  }

  // count usage for free users
  if (!u.subscribed) recordUsage(u.id);

  const result = solveTextProblem(problem);
  const fresh = getUser(u.id);

  res.json({
    ...result,
    subscribed: fresh.subscribed,
    usesLeft: fresh.subscribed ? Infinity : Math.max(0, 10 - fresh.used)
  });
});

// image upload (stub – OCR can be added later)
r.post("/upload", upload.single("image"), (req, res) => {
  const u = getUser(req.userId);
  if (!u.subscribed && !canUse(u.id)) {
    return res.status(402).json({ ok: false, paywall: true, message: "Free trial finished" });
  }
  if (!u.subscribed) recordUsage(u.id);
  if (!req.file) return res.status(400).json({ ok: false, error: "no image provided" });

  res.json({
    ok: true,
    note: "Image received (OCR not wired yet)",
    subscribed: u.subscribed,
    usesLeft: u.subscribed ? Infinity : Math.max(0, 10 - getUser(u.id).used)
  });
});

// start subscription (Paystack init – stubbed for now)
r.post("/subscribe", async (req, res) => {
  try {
    const { email, amountSmallestUnit = 2000 * 100 } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, error: "email required" });

    const session = await initSubscriptionCheckout({
      email,
      amountSmallestUnit,
      userId: req.userId,
      metadata: { source: "mathify" }
    });

    res.json({ ok: true, ...session });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || "subscribe init failed" });
  }
});

// webhook placeholder (implement signature verify later)
r.post("/paystack/webhook", express.raw({ type: "application/json" }), (req, res) => {
  // TODO: verify signature and then:
  // markSubscribed(userIdFromMetadata);
  res.sendStatus(200);
});

export default r;
