import { Result } from "./deps.ts";

export interface Failure {
  reason: string;
}

export type Parser<T> = (data: FormData) => Result.Result<Failure, T>;

export function required<T>(
  fieldName: string,
  fromString: (s: string) => Result.Result<Failure, T>,
): Parser<T> {
  return (data) => {
    const value = data.get(fieldName);
    if (typeof (value) === "string") {
      const fromStr = fromString(value);
      switch (fromStr.type) {
        case Result.ResultType.Err:
          return Result.Err({
            reason: `required field '${fieldName}' was ${fromStr.err.reason}`,
          });
        case Result.ResultType.Ok:
          return fromStr;
      }
    }
    return Result.Err({
      reason: `required field '${fieldName}' was empty`,
    });
  };
}

export function str(s: string): Result.Result<Failure, string> {
  return Result.Ok(s);
}

export function num(s: string): Result.Result<Failure, number> {
  if (s.length < 1) {
    return Result.Err({ reason: "not a number" });
  }
  const i = Number(s);
  if (isNaN(i)) {
    return Result.Err({ reason: "not a number" });
  }
  return Result.Ok(i);
}

export function parse<T>(
  parser: Parser<T>,
  data: FormData,
): Result.Result<Failure, T> {
  return parser(data);
}

export function map<A, T>(
  constructor: (a: A) => T,
  parser: Parser<A>,
): Parser<T> {
  return function (data) {
    const parsedA = parser(data);
    switch (parsedA.type) {
      case Result.ResultType.Err:
        return parsedA;
      case Result.ResultType.Ok:
        return Result.Ok(constructor(parsedA.value));
    }
  };
}

export function map2<A, B, T>(
  constructor: (a: A, b: B) => T,
  parserA: Parser<A>,
  parserB: Parser<B>,
): Parser<T> {
  return function (data) {
    const parsedA = parserA(data);
    switch (parsedA.type) {
      case Result.ResultType.Err:
        return parsedA;
      case Result.ResultType.Ok: {
        const parsedB = parserB(data);
        switch (parsedB.type) {
          case Result.ResultType.Err:
            return parsedB;
          case Result.ResultType.Ok:
            return Result.Ok(constructor(parsedA.value, parsedB.value));
        }
      }
    }
  };
}
