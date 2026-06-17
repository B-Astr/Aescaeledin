/// <reference types="bun" />
import { expect, test } from "bun:test";
import { cosineSimilarity } from "../lib/localEmbeddings";

test("cosineSimilarity returns almost 1 for equal vectors", () => {
  expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 5);});

test("cosineSimilarity returns 0 for orthogonal vectors", () => {
  expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);});

test("cosineSimilarity handles incompatible vectors safely", () => {
  expect(cosineSimilarity([1, 2], [1])).toBe(0);
  expect(cosineSimilarity([], [])).toBe(0);});
