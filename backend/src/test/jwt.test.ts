/// <reference types="bun" />
import { afterEach, beforeEach, expect, test } from "bun:test";
import { signAccessToken, signPendingToken, verifyToken } from "../lib/jwt";
import { requireFullyAuthenticated } from "../middleware/auth.middleware";

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

const testUser = {
  id: 1,
  email: "test@example.com",
  role: "CLIENTE",
  name: "Test User",
  picture: null,};

const originalDateNow = Date.now;

beforeEach(() => {
  process.env.JWT_SECRET = "unit-test-secret";
  Date.now = originalDateNow;});

afterEach(() => {
  Date.now = originalDateNow;});

test("signPendingToken creates an otp_pending token", () => {
  const token = signPendingToken(testUser);
  const decoded = verifyToken(token);

  expect(token.split(".")).toHaveLength(5);
  expect(typeof decoded).toBe("object");
  expect((decoded as { step?: string }).step).toBe("otp_pending");});

test("signAccessToken creates an authenticated token", () => {
  const token = signAccessToken(testUser);
  const decoded = verifyToken(token);

  expect(typeof decoded).toBe("object");
  expect((decoded as { step?: string }).step).toBe("authenticated");});

test("tokens do not expose the payload as a readable JWT body", () => {
  const token = signAccessToken(testUser);
  const [, readablePayloadSegment] = token.split(".");

  expect(readablePayloadSegment).toBe("");});

test("verifyToken rejects tampered encrypted tokens", () => {
  const token = signAccessToken(testUser);
  const parts = token.split(".");
  const ciphertext = parts[3];
  const replacement = ciphertext.startsWith("A") ? "B" : "A";

  parts[3] = `${replacement}${ciphertext.slice(1)}`;

  expect(() => verifyToken(parts.join("."))).toThrow();});

test("verifyToken rejects expired encrypted tokens", () => {
  const token = signPendingToken(testUser);

  Date.now = () => originalDateNow() + 16 * 60 * 1000;

  expect(() => verifyToken(token)).toThrow();});

test("verifyToken rejects invalid tokens", () => {
  expect(() => verifyToken("invalid.token.value")).toThrow();});

test("requireFullyAuthenticated rejects a pending OTP token", () => {
  const token = signPendingToken(testUser);
  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
  const res = createMockResponse();
  let nextCalled = false;

  requireFullyAuthenticated(req as never, res as never, () => {
    nextCalled = true;
  });

  expect(res.statusCode).toBe(401);
  expect(nextCalled).toBe(false);
});
