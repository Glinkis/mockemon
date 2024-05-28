/**
 * This module provides a function that creates a factory for mock builders.
 * @module
 */

/**
 * A configuration object that is passed to the `configureMockBuilder` function.
 */
interface Configuration {
  /**
   * A value that will be passed to the default builder function.
   * This is usually a faker instance.
   */
  readonly context: unknown;
}

type Overrideable<TValue> = {
  readonly [P in keyof TValue]?: TValue[P];
};

type Build<TContext, TValue> = (config: TContext) => TValue;

type Shape<TValue, TOverride> = //
  // If the override is a subset of a compatible set of the original value.
  Exclude<TValue, TOverride> extends Extract<TValue, TOverride> //
    ? TOverride
    : TValue;

type Merged<TValue, TOverride> =
  // If the overrides are identical to the value.
  TValue extends TOverride
    ? // Just use the value.
      TValue
    : // If the overrides are a subset of the value.
      keyof TValue extends keyof TOverride
      ? // We need to merge in the overrides
        TValue & TOverride
      : // If the overrides don't match the value at all, it's invalid.
        never;

type CreateMockBuilder<TConfig extends Configuration, TContext = TConfig["context"]> = {
  <TValue>(build: Build<TContext, TValue>): {
    <TOverride extends Overrideable<TValue>>(
      override: Build<TContext, Shape<TValue, TOverride>>,
    ): Merged<TValue, TOverride>;

    <TOverride extends Overrideable<TValue>>( //
      override: Shape<TValue, TOverride>,
    ): Merged<TValue, TOverride>;

    (): TValue;
  };
};

/**
 * Configures and returns a factory for mock builders.
 *
 * @example
 * ```ts
 * import { configureMockBuilder } from "./builder";
 *
 * const createMockBuilder = configureMockBuilder({
 *  context: {},
 * });
 *
 * const buildMock = createMockBuilder(() => ({
 *  name: "John Doe",
 * }));
 *
 * const mock = buildMock();
 *
 * console.log(mock); // { name: "John Doe" }
 * ```
 */
export function configureMockBuilder<TConfig extends Configuration>(config: TConfig): CreateMockBuilder<TConfig> {
  type TContext = TConfig["context"];

  function createMockBuilder<TValue>(build: Build<TContext, TValue>) {
    type TOverrideable = Overrideable<TValue>;

    function buildMock<TOverride extends TOverrideable>(override?: Build<TContext, TOverride> | TOverride) {
      const original = build(config.context);

      // Unwrap the override if it's a function.
      if (typeof override === "function") {
        override = override(config.context);
      }

      // If both the original and the override are objects, we merge them.
      if (typeof original === "object" && original !== null) {
        if (typeof override === "object" && override !== null) {
          return Object.assign(original, override);
        }
      }

      // To support passing undefined as an override,
      // we can check if the override is passed as as argument,
      // instead of looking at the type.
      if (arguments.length) {
        return override;
      }

      return original;
    }

    return buildMock;
  }

  return createMockBuilder;
}
