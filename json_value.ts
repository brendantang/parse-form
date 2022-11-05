import { fail, succeed, Validator } from "./validator.ts";
import { Result } from "./deps.ts";
/**
 * `JsonValue` is an intermediary type to use when parsing JSON strings into your desired type.
 *
 * Whereas the built in `JSON.parse` function returns type `any`, JsonValue is a more precise type that only enumerates the kinds of values that JSON strings can represent. (For example, JSON strings cannot represent function values.)
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [property: string]: JsonValue };

export const json: Validator<string, JsonValue> = (s: string) => {
  try {
    return succeed(fromUnknown(JSON.parse(s)));
  } catch {
    return fail("is not valid json");
  }
};

/**
 * `requireKey` returns a validator for a `JsonValue` that fails if the given value is not an object with the given key
 */
export function requireKey<T>(
  key: string,
  validator: Validator<JsonValue, T>,
): Validator<JsonValue, T> {
  return function (data: JsonValue) {
    if (
      typeof data === "object" &&
      !Array.isArray(data) &&
      data !== null
    ) {
      return Result.mapError(function (err) {
        return { reason: `property '${key}' ${err.reason}` };
      }, validator(data[key]));
    } else {
      return fail(`has no property '${key}'`);
    }
  };
}

/**
 * `jsonStr` parses a `JsonValue` into a string.
 */
export const jsonStr: Validator<JsonValue, string> = (data: JsonValue) => {
  if (typeof data !== "string") {
    return fail("is not a string");
  }
  return succeed(data);
};

/**
 * `jsonNum` parses a `JsonValue` into a number.
 */
export const jsonNum: Validator<JsonValue, number> = (data: JsonValue) => {
  if (typeof data !== "number") {
    return fail("is not a number");
  }
  return succeed(data);
};

/**
 * `json` parses a string to a `JsonValue`.
 *
 * Values that JSON can't represent are turned into `null`.
 */
export function fromUnknown(input: unknown): JsonValue {
  switch (typeof input) {
    case "string":
    case "number":
    case "boolean":
      return input;
    case "bigint":
    case "function":
    case "symbol":
    case "undefined":
      return null;
    case "object":
      if (input instanceof Array) {
        return input.map(fromUnknown);
      }
      if (input instanceof Object) {
        return Object.entries(input).reduce((acc, [k, v]) => {
          acc[k] = fromUnknown(v);
          return acc;
        }, {} as { [property: string]: JsonValue });
      }
      return null;
    default:
      return null;
  }
}

/**
 * Use `fromString` as a drop-in replacement for `JSON.parse`, which returns `any`.
 *
 * This function calls `JSON.parse`, which can throw!
 * @throws
 */
export function fromString(json: string): JsonValue {
  const parsed = JSON.parse(json);
  return fromUnknown(parsed);
}
