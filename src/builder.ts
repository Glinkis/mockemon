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

type BuildInput<TValue, TOverride> = //
  // If the override is a subset of the original value.
  TOverride extends TValue //
    ? TOverride
    : // If the override keys are a subset of the keys in the original value.
      keyof TOverride extends keyof TValue
      ? TOverride
      : TValue;

type BuildOutput<TValue, TOverride> =
  // If the override is identical to the original value.
  TValue extends TOverride
    ? TValue
    : // If the override keys are a subset of the keys in the original value.
      keyof TOverride extends keyof TValue
      ? // We need to merge in the overrides.
        TValue & TOverride
      : // If the overrides don't match the value at all, it's invalid.
        never;

type CreateMockBuilder<TConfig extends Configuration, TContext = TConfig["context"]> = {
  <TValue>(build: Build<TContext, TValue>): {
    <TOverride extends Overrideable<TValue>>(
      override: Build<TContext, BuildInput<TValue, TOverride>>,
    ): BuildOutput<TValue, TOverride>;

    <TOverride extends Overrideable<TValue>>( //
      override: BuildInput<TValue, TOverride>,
    ): BuildOutput<TValue, TOverride>;

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
