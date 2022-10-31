import { succeed, Validator } from "./validator.ts";
import { Result } from "./deps.ts";

/** `required` takes the name of a field and a validator for the string value at that field in the form.
 *  If there is no value provided, validation fails.
 */
export function required<T>(
  fieldName: string,
  fromString: Validator<string, T>,
): Validator<FormData, T> {
  return (data: FormData) => {
    const value = data.get(fieldName);
    if (typeof (value) === "string") {
      return Result.mapError(function (err) {
        return { reason: `field '${fieldName}' ${err.reason}` };
      }, fromString(value));
    }
    return Result.Err({
      reason: `field '${fieldName}' was empty`,
    });
  };
}

/** `optional` takes the name of a field, a validator for the string value at that field in the form, and a default value.
 *  The provided validator is used on the field value in the form, if any is provided. If no value is provided, validation
 *  succeeds with the provided default value.
 */
export function optional<T>(
  fieldName: string,
  fromString: Validator<string, T>,
  defaultValue: T,
): Validator<FormData, T> {
  return (data) => {
    const value = data.get(fieldName);
    if (typeof (value) === "string") {
      return Result.mapError(function (err) {
        return { reason: `field '${fieldName}' ${err.reason}` };
      }, fromString(value));
    }
    return Result.Ok(defaultValue);
  };
}

/** A checked input element of type "checkbox" defaults to a string that says "on".
 * `checkbox` is a validator that checks for a string equal to "on". */
export const checkbox: Validator<string, boolean> = (s: string) => {
  return succeed(s === "on");
};
