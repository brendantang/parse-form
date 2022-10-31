import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import { Result } from "./deps.ts";
import { ValidationResult } from "./mod.ts";

export function assertSucceeds<T>(value: T, testCase: ValidationResult<T>) {
  assertEquals(Result.Ok(value), testCase);
}

export function assertFails<T>(
  reason: string,
  testCase: ValidationResult<T>,
) {
  assertEquals(Result.Err({ reason }), testCase);
}
