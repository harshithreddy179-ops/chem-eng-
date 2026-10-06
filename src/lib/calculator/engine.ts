/* ──────────────────────────────────────────────────────────────────────────
   Scientific calculator engine — a small recursive-descent parser.
   No eval(), no Function(); every input is tokenised and validated.

   Grammar (lowest → highest precedence)
     expr    := term (("+" | "−") term)*
     term    := unary (("×" | "÷") unary | <implicit ×> unary)*
     unary   := ("−" | "+") unary | power
     power   := postfix ("^" unary)?            right-associative; −2^2 = −4
     postfix := primary ("!" | "%")*
     primary := number | constant | fn "(" expr ")" | "(" expr ")" | "√" primary
   Numbers accept scientific notation via E: 1.23E-6.
   ────────────────────────────────────────────────────────────────────────── */

export type AngleMode = "deg" | "rad";

export class CalcError extends Error {}

type Token =
  | { t: "num"; v: number }
  | { t: "id"; v: string }
  | { t: "op"; v: "+" | "-" | "*" | "/" | "^" | "!" | "%" | "(" | ")" | "√" };

const FUNCTIONS = ["sin", "cos", "tan", "asin", "acos", "atan", "log", "ln", "sqrt", "abs"] as const;
type Fn = (typeof FUNCTIONS)[number];
const CONSTANTS = ["pi", "e", "ans"] as const;

const ALIASES: [RegExp, string][] = [
  [/sin⁻¹/g, "asin"],
  [/cos⁻¹/g, "acos"],
  [/tan⁻¹/g, "atan"],
  [/π/g, "pi"],
  [/[×✕·]/g, "*"],
  [/÷/g, "/"],
  [/[−–—]/g, "-"],
  [/²/g, "^2"],
  [/³/g, "^3"],
  [/\*\*/g, "^"],
];

export function tokenize(input: string): Token[] {
  let s = input;
  for (const [re, rep] of ALIASES) s = s.replace(re, rep);
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      const m = /^(\d+\.?\d*|\.\d+)(E[+-]?\d+)?/i.exec(s.slice(i));
      // "E" or "e" directly followed by digits is an exponent (1.2E-6);
      // a lone "e" after a number is Euler's number (2e = 2 × e).
      const text = m ? m[0] : "";
      if (!text || text === ".") throw new CalcError("Malformed number");
      if ((text.match(/\./g) ?? []).length > 1 || s[i + text.length] === ".") throw new CalcError("Malformed number");
      tokens.push({ t: "num", v: Number(text) });
      i += text.length;
      continue;
    }
    if (/[a-z]/i.test(ch)) {
      const word = /^[a-z]+/i.exec(s.slice(i))![0].toLowerCase();
      // Split runs such as "pie" or "epi" greedily into known names.
      let rest = word;
      while (rest) {
        const name = [...FUNCTIONS, ...CONSTANTS]
          .filter((n) => rest.startsWith(n))
          .sort((a, b) => b.length - a.length)[0];
        if (!name) throw new CalcError(`Unknown name “${rest}”`);
        tokens.push({ t: "id", v: name });
        rest = rest.slice(name.length);
      }
      i += word.length;
      continue;
    }
    if ("+-*/^!%()√".includes(ch)) {
      tokens.push({ t: "op", v: ch as Token["v"] & string } as Token);
      i++;
      continue;
    }
    if (ch === "[" || ch === "{") {
      tokens.push({ t: "op", v: "(" });
      i++;
      continue;
    }
    if (ch === "]" || ch === "}") {
      tokens.push({ t: "op", v: ")" });
      i++;
      continue;
    }
    throw new CalcError(`Unexpected “${ch}”`);
  }
  return tokens;
}

const toRad = (x: number, mode: AngleMode) => (mode === "deg" ? (x * Math.PI) / 180 : x);
const fromRad = (x: number, mode: AngleMode) => (mode === "deg" ? (x * 180) / Math.PI : x);

/** Is x (radians) within rounding error of a multiple of `step`? */
function nearMultiple(x: number, step: number) {
  const q = x / step;
  return Math.abs(q - Math.round(q)) < 1e-12 ? Math.round(q) : null;
}

function trig(fn: "sin" | "cos" | "tan", value: number, mode: AngleMode): number {
  const r = toRad(value, mode);
  const halfTurns = nearMultiple(r, Math.PI);
  const quarterTurns = nearMultiple(r, Math.PI / 2);
  if (fn === "sin") return halfTurns !== null ? 0 : Math.sin(r);
  if (fn === "cos") return quarterTurns !== null && quarterTurns % 2 !== 0 ? 0 : Math.cos(r);
  if (quarterTurns !== null && quarterTurns % 2 !== 0)
    throw new CalcError(`tan is undefined at ${mode === "deg" ? `${value}°` : "π/2 + kπ"}`);
  return halfTurns !== null ? 0 : Math.tan(r);
}

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new CalcError("Factorial needs a whole number ≥ 0");
  if (n > 170) throw new CalcError("Factorial is too large (max 170!)");
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function applyFn(fn: Fn, x: number, mode: AngleMode): number {
  switch (fn) {
    case "sin":
    case "cos":
    case "tan":
      return trig(fn, x, mode);
    case "asin":
    case "acos":
      if (x < -1 || x > 1) throw new CalcError(`${fn === "asin" ? "sin⁻¹" : "cos⁻¹"} needs a value between −1 and 1`);
      return fromRad(fn === "asin" ? Math.asin(x) : Math.acos(x), mode);
    case "atan":
      return fromRad(Math.atan(x), mode);
    case "log":
    case "ln":
      if (x <= 0) throw new CalcError("Logarithm is undefined for values ≤ 0");
      return fn === "log" ? Math.log10(x) : Math.log(x);
    case "sqrt":
      if (x < 0) throw new CalcError("Square root of a negative number");
      return Math.sqrt(x);
    case "abs":
      return Math.abs(x);
  }
}

class Parser {
  private i = 0;
  constructor(
    private tokens: Token[],
    private mode: AngleMode,
    private ans: number,
  ) {}

  parse(): number {
    if (this.tokens.length === 0) throw new CalcError("Enter an expression");
    const v = this.expr();
    const extra = this.peek();
    if (extra) throw new CalcError(extra.t === "op" && extra.v === ")" ? "Unmatched closing bracket" : "Unexpected input — check for a missing operator");
    return v;
  }

  private peek() {
    return this.tokens[this.i];
  }
  private isOp(v: string) {
    const t = this.peek();
    return t?.t === "op" && t.v === v;
  }
  private eat(v: string) {
    if (!this.isOp(v)) throw new CalcError(v === ")" ? "Missing closing bracket" : `Expected “${v}”`);
    this.i++;
  }

  private expr(): number {
    let v = this.term();
    while (this.isOp("+") || this.isOp("-")) {
      const op = (this.tokens[this.i++] as { v: string }).v;
      const r = this.term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }

  private startsPrimary(t: Token | undefined, prev: Token | undefined) {
    if (!t) return false;
    if (t.t === "num") return prev?.t !== "num";
    if (t.t === "id") return true;
    return t.t === "op" && (t.v === "(" || t.v === "√");
  }

  private term(): number {
    let v = this.unary();
    for (;;) {
      if (this.isOp("*")) {
        this.i++;
        v *= this.unary();
      } else if (this.isOp("/")) {
        this.i++;
        const d = this.unary();
        if (d === 0) throw new CalcError("Cannot divide by zero");
        v /= d;
      } else if (this.startsPrimary(this.peek(), this.tokens[this.i - 1])) {
        v *= this.unary(); // implicit multiplication: 2π, 3(4), 2sin(30)
      } else return v;
    }
  }

  private unary(): number {
    if (this.isOp("-")) {
      this.i++;
      return -this.unary();
    }
    if (this.isOp("+")) {
      this.i++;
      return this.unary();
    }
    return this.power();
  }

  private power(): number {
    const base = this.postfix();
    if (this.isOp("^")) {
      this.i++;
      const exp = this.unary();
      if (base === 0 && exp < 0) throw new CalcError("Cannot divide by zero");
      const r = Math.pow(base, exp);
      if (Number.isNaN(r)) throw new CalcError("Result is not a real number");
      return r;
    }
    return base;
  }

  private postfix(): number {
    let v = this.primary();
    for (;;) {
      if (this.isOp("!")) {
        this.i++;
        v = factorial(v);
      } else if (this.isOp("%")) {
        this.i++;
        v = v / 100;
      } else return v;
    }
  }

  private primary(): number {
    const t = this.peek();
    if (!t) throw new CalcError("Expression is incomplete");
    if (t.t === "num") {
      this.i++;
      return t.v;
    }
    if (t.t === "id") {
      this.i++;
      if (t.v === "pi") return Math.PI;
      if (t.v === "e") return Math.E;
      if (t.v === "ans") return this.ans;
      const fn = t.v as Fn;
      if (this.isOp("(")) {
        this.i++;
        const arg = this.expr();
        this.eat(")");
        return applyFn(fn, arg, this.mode);
      }
      return applyFn(fn, this.postfix(), this.mode); // sin30, √9
    }
    if (t.v === "(") {
      this.i++;
      if (this.isOp(")")) throw new CalcError("Empty brackets");
      const v = this.expr();
      this.eat(")");
      return v;
    }
    if (t.v === "√") {
      this.i++;
      return applyFn("sqrt", this.postfix(), this.mode);
    }
    throw new CalcError(t.v === ")" ? "Unmatched closing bracket" : `Unexpected “${t.v}”`);
  }
}

/** Closes any brackets left open at the end, as most calculators do. */
export function autoClose(expression: string) {
  let depth = 0;
  for (const ch of expression) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
  }
  return expression + ")".repeat(depth);
}

export function evaluate(expression: string, options: { mode?: AngleMode; ans?: number } = {}): number {
  const tokens = tokenize(autoClose(expression));
  const value = new Parser(tokens, options.mode ?? "deg", options.ans ?? 0).parse();
  if (Number.isNaN(value)) throw new CalcError("Result is not a real number");
  if (!Number.isFinite(value)) throw new CalcError("Result is too large");
  // Trim binary floating-point noise: 0.1 + 0.2 → 0.3
  return Number(value.toPrecision(12));
}

const SUPERSCRIPT: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

export interface Formatted {
  /** Pretty, e.g. "1.23 × 10⁻⁶" */
  display: string;
  /** Re-enterable, e.g. "1.23E-6" */
  plain: string;
}

export function formatNumber(x: number): Formatted {
  if (x === 0 || Object.is(x, -0)) return { display: "0", plain: "0" };
  const abs = Math.abs(x);
  if (abs >= 1e12 || abs < 1e-5) {
    const [mantissa, exponent] = x.toExponential(9).split("e");
    const m = String(Number(mantissa));
    const e = String(Number(exponent));
    return {
      display: `${m} × 10${[...e].map((c) => SUPERSCRIPT[c] ?? c).join("")}`,
      plain: `${m}E${e}`,
    };
  }
  const s = String(Number(x.toPrecision(12)));
  return { display: s, plain: s };
}
