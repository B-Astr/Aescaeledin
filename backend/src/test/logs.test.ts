/// <reference types="bun" />

import { test, expect } from "bun:test";

test('logs (info,warning,error)', () => {
    console.info('Info del log');
    console.warn('Warning del log');
    console.error('Error del log');

    expect(true).toBe(true);});