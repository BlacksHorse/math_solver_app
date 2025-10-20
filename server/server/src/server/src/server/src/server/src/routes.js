import { create, all } from "mathjs";
const math = create(all, { number: "number" });

export function solveTextProblem(problem) {
  const p = (problem || "").replace(/\s+/g, "");
  if (p.includes("=") && /x\^2/.test(p)) return quad(p);
  if (p.includes("=") && /x/.test(p)) return linear(p);
  return expr(p);
}

function linear(p) {
  const m = p.match(/^(-?\d*\.?\d*)x([+-]\d*\.?\d+)?=(-?\d*\.?\d+)$/i);
  if (!m) return { ok: true, steps: ["Parse the equation", "(Demo solver)"], answer: "N/A" };
  const a = m[1] === "" || m[1] === "+" ? 1 : (m[1] === "-" ? -1 : Number(m[1]));
  const b = m[2] ? Number(m[2]) : 0;
  const c = Number(m[3]);
  const steps = [];
  steps.push(`Given: ${a}x ${b >= 0 ? "+" : ""}${b} = ${c}`);
  steps.push(`Subtract ${b}: ${a}x = ${c - b}`);
  steps.push(`Divide by ${a}: x = ${(c - b) / a}`);
  return { ok: true, steps, answer: (c - b) / a };
}

function quad(p) {
  let [lhs, rhs] = p.split("=");
  if (rhs === undefined) rhs = "0";
  const move = math.simplify(`${lhs}-(${rhs})`).toString().replace(/\s+/g, "");
  const aM = move.match(/([+-]?\d*\.?\d*)x\^2/);
  const bM = move.match(/([+-]\d*\.?\d*)x(?!\^)/);
  const cM = move.match(/([+-]\d*\.?\d+)(?!x)/g);
  const a = aM ? (aM[1] === "" || aM[1] === "+" ? 1 : (aM[1] === "-" ? -1 : Number(aM[1]))) : 0;
  const b = bM ? Number(bM[1]) : 0;
  const c = cM ? cM.map(Number).reduce((p, v) => p + v, 0) : 0;
  const D = b * b - 4 * a * c;
  const steps = [`Rewrite as ax^2+bx+c=0`, `Δ = b^2 - 4ac = ${D}`];
  if (D < 0) {
    const absD = Math.abs(D);
    const real = (-b) / (2 * a);
    const imag = (Math.sqrt(absD) / (2 * Math.abs(a)));
    steps.push("Δ < 0 ⇒ complex roots");
    return { ok: true, steps, answer: { x1: `${real}+${imag}i`, x2: `${real}-${imag}i` } };
  }
  const s = Math.sqrt(D);
  const x1 = (-b + s) / (2 * a);
  const x2 = (-b - s) / (2 * a);
  steps.push(`x = (-b ± √Δ) / (2a)`);
  steps.push(`x1=${x1}, x2=${x2}`);
  return { ok: true, steps, answer: { x1, x2 } };
}

function expr(p) {
  try {
    const simp = math.simplify(p).toString();
    const val = math.evaluate(p);
    return { ok: true, steps: [`Simplify: ${p} → ${simp}`, `Evaluate: ${simp} = ${val}`], answer: val };
  } catch (e) {
    return { ok: false, steps: ["Unable to evaluate"], answer: null };
  }
}
