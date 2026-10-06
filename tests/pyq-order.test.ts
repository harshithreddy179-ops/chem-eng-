import { test } from "node:test";
import assert from "node:assert/strict";
import { neighbours, type PyqOrderRow } from "../src/lib/pyq-order";

const row = (id: string, year: number, q: number | null, section_order: number | null = 1, exam = "Mid Semester"): PyqOrderRow => ({
  id, year, exam, question_number: q, section_order,
});

const rows = [
  row("a23q2", 2023, 2),
  row("a24q2", 2024, 2),
  row("e24q1", 2024, 1, 3, "End Semester"),
  row("a24q1", 2024, 1),
  row("a23q1", 2023, 1),
  row("a24qx", 2024, null),
];

test("orders newest paper first, then section, then question number", () => {
  const order: string[] = [];
  let cur = neighbours(rows, "a24q1");
  assert.equal(cur.prev, null);
  assert.equal(cur.position, 1);
  assert.equal(cur.total, 6);
  order.push("a24q1");
  while (cur.next) {
    order.push(cur.next.id);
    cur = neighbours(rows, cur.next.id);
  }
  assert.deepEqual(order, ["a24q1", "a24q2", "a24qx", "e24q1", "a23q1", "a23q2"]);
  assert.equal(neighbours(rows, "a23q2").next, null);
  assert.equal(neighbours(rows, "a23q2").prev?.id, "a23q1");
});

test("unknown id yields no neighbours", () => {
  assert.deepEqual(neighbours(rows, "zzz"), { prev: null, next: null, position: 0, total: 6 });
});
