/// <reference types="bun" />
import { expect, test } from "bun:test";
import {HELP_CHAT_MAX_MESSAGE_LENGTH, validateHelpChatMessage, } from "../controllers/helpChat.controller";

test("validateHelpChatMessage rejects empty messages", () => {
  const result = validateHelpChatMessage("   ");

  expect(result.ok).toBe(false);
});

test("validateHelpChatMessage rejects non-string messages", () => {
  const result = validateHelpChatMessage(123);

  expect(result.ok).toBe(false);
});

test("validateHelpChatMessage rejects messages over the limit", () => {
  const result = validateHelpChatMessage(
    "a".repeat(HELP_CHAT_MAX_MESSAGE_LENGTH + 1)
  );

  expect(result.ok).toBe(false);
});

test("validateHelpChatMessage accepts a valid message", () => {
  const result = validateHelpChatMessage("Como creo un servicio?");

  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.message).toBe("Como creo un servicio?");
  }
});
