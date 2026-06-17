/// <reference types="bun" />
import { expect, test } from "bun:test";
import { requireRole } from "../middleware/requireRole.middleware";

type MockResponse = {
  statusCode: number;
  body: unknown;
  status(code: number): MockResponse;
  json(payload: unknown): MockResponse;};

function createMockResponse(): MockResponse {
  return {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
}

test("requireRole allows an authorized role", () => {
  const req = {
    user: {
      role: "EMPRESA",
    },
  };
  const res = createMockResponse();
  let nextCalled = false;

  requireRole("EMPRESA", "PRO")(req as never, res as never, () => {
    nextCalled = true;});

  expect(res.statusCode).toBe(200);
  expect(nextCalled).toBe(true);});

test("requireRole rejects an unauthorized role", () => {
  const req = {
    user: {
      role: "CLIENTE",
    },
  };
  const res = createMockResponse();
  let nextCalled = false;

  requireRole("EMPRESA")(req as never, res as never, () => {
    nextCalled = true;});

  expect(res.statusCode).toBe(403);
  expect(nextCalled).toBe(false);});

test("requireRole rejects missing authenticated user", () => {
  const req = {};
  const res = createMockResponse();
  let nextCalled = false;

  requireRole("EMPRESA")(req as never, res as never, () => {
    nextCalled = true;});

  expect(res.statusCode).toBe(401);
  expect(nextCalled).toBe(false);});
