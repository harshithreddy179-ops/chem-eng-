import { test } from "node:test";
import assert from "node:assert/strict";
import { CalcError, evaluate, formatNumber } from "../src/lib/calculator/engine";

const ev = (s: string, o = {}) => evaluate(s, o);
const throws = (s: string, msg: RegExp, o = {}) => assert.throws(() => ev(s, o), (e: unknown) => e instanceof CalcError && msg.test((e as Error).message));

test("arithmetic, precedence, unicode operators", () => {
  assert.equal(ev("2+3×4"), 14);
  assert.equal(ev("(2+3)×4"), 20);
  assert.equal(ev("10÷4"), 2.5);
  assert.equal(ev("7−10"), -3);
  assert.equal(ev("0.1+0.2"), 0.3);
  assert.equal(ev("-2^2"), -4);
  assert.equal(ev("2^3^2"), 512);
  assert.equal(ev("50%"), 0.5);
  assert.equal(ev("200×15%"), 30);
});

test("implicit multiplication and constants", () => {
  assert.equal(ev("2π"), Number((2 * Math.PI).toPrecision(12)));
  assert.equal(ev("3(4)"), 12);
  assert.equal(ev("(2)(3)"), 6);
  assert.equal(ev("2e"), Number((2 * Math.E).toPrecision(12)));
  assert.equal(ev("2sin(30)"), 1);
});

test("functions in DEG and RAD", () => {
  assert.equal(ev("sin(30)"), 0.5);
  assert.equal(ev("cos(90)"), 0);
  assert.equal(ev("tan(45)"), 1);
  assert.equal(ev("sin(180)"), 0);
  assert.equal(ev("sin⁻¹(0.5)"), 30);
  assert.equal(ev("sin(π/2)", { mode: "rad" }), 1);
  assert.equal(ev("sin(π)", { mode: "rad" }), 0);
  assert.equal(ev("acos(-1)", { mode: "rad" }), Number(Math.PI.toPrecision(12)));
  assert.equal(ev("√(3²+4²)"), 5);
  assert.equal(ev("√9"), 3);
  assert.equal(ev("log(1000)"), 3);
  assert.equal(ev("ln(e)"), 1);
  assert.equal(ev("e^(2)"), Number(Math.exp(2).toPrecision(12)));
  assert.equal(ev("10^(3)"), 1000);
  assert.equal(ev("5!"), 120);
  assert.equal(ev("abs(-7)"), 7);
  assert.equal(ev("4^(-1)"), 0.25);
  assert.equal(ev("8.314×298"), 2477.572);
});

test("scientific notation and Ans", () => {
  assert.equal(ev("1.23E-6"), 1.23e-6);
  assert.equal(ev("6.022E23×2"), 1.2044e24);
  assert.equal(ev("2E3+1"), 2001);
  assert.equal(ev("Ans+10", { ans: 40 }), 50);
  assert.equal(ev("2ans", { ans: 4 }), 8);
});

test("auto-closes brackets", () => {
  assert.equal(ev("sin(30"), 0.5);
  assert.equal(ev("2×(3+4"), 14);
});

test("errors are graceful", () => {
  throws("1/0", /divide by zero/);
  throws("0^-1", /divide by zero/);
  throws("log(0)", /Logarithm/);
  throws("ln(-1)", /Logarithm/);
  throws("√(-4)", /negative/);
  throws("(-8)^(1/3)", /not a real/);
  throws("3.5!", /whole number/);
  throws("(-1)!", /whole number/);
  throws("171!", /too large/);
  throws("asin(2)", /between/);
  throws("tan(90)", /undefined/);
  throws("2+", /incomplete/);
  throws("", /Enter/);
  throws("()", /Empty/);
  throws("2)", /Unexpected|Unmatched/);
  throws("1..2", /Malformed/);
  throws("foo(2)", /Unknown/);
  throws("10^400", /too large/);
  throws("2 3", /Unexpected/);
});

test("formatting", () => {
  assert.deepEqual(formatNumber(1.23e-6), { display: "1.23 × 10⁻⁶", plain: "1.23E-6" });
  assert.deepEqual(formatNumber(6.022e23), { display: "6.022 × 10²³", plain: "6.022E23" });
  assert.deepEqual(formatNumber(2477.572), { display: "2477.572", plain: "2477.572" });
  assert.deepEqual(formatNumber(0), { display: "0", plain: "0" });
  assert.equal(ev(formatNumber(1.23e-6).plain), 1.23e-6); // plain form round-trips
});
