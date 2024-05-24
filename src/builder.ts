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

type Override<TContext, TOverrides> = Build<TContext, TOverrides> | TOverrides;

type Merged<TValue, TOverrides> =
  // If the overrides are a subset of the value.
  keyof TOverrides extends keyof TValue
    ? // If the override is identical to the value
      TValue extends TOverrides
      ? // No need to modify the type, since the override is identical to the value.
        TValue
      : // The override is stricter than the value, so we need to merge them.
        TValue & TOverrides
    : // The overrides are a stricter version of the value, so just use the overrides.
      TOverrides;

type CreateMockBuilder<TConfig extends Configuration, TContext = TConfig["context"]> = {
  <TValue>(build: Build<TContext, TValue>): {
    (): TValue;
    <TOverrides extends Overrideable<TValue>>(override: Override<TContext, TOverrides>): Merged<TValue, TOverrides>;
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

    function buildMock<TOverrides extends TOverrideable>(override?: Override<TContext, TOverrides>) {
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
