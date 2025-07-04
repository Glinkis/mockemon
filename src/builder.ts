/**
 * This module provides a function that creates a factory for mock builders.
 * @module
 */

/**
 * A configuration object that is passed to the `configureMockBuilder` function.
 */
type Configuration<TContext> = {
  /**
   * A value that will be passed to the default builder function.
   * This is usually a faker instance.
   */
  readonly context: TContext;
};

/**
 * Allows only the properties of the original value to be overridden,
 * but does not allow for additional properties.
 */
type StrictPartial<TValue> = {
  readonly [P in keyof TValue]?: TValue[P];
};

type BuildInput<TValue, TOverride> =
  // If the output based on the input is invalid.
  BuildOutput<TValue, TOverride> extends never
    ? // Mark the input as invalid.
      never
    : // If the override is a subset of the original value.
      keyof TOverride extends keyof TValue
      ? // Return the override type.
        TOverride
      : // Return the original type.
        TValue;

type BuildArrayOutput<TValue, TOverride> =
  // If the override is approximately an empty array.
  TOverride extends never[]
    ? // If the override is exactly an empty array.
      TOverride extends []
      ? TOverride
      : TValue
    : TOverride;

type BuildOtherOutput<TValue, TOverride> =
  // If the override keys are a subset of the keys in the original value.
  keyof TOverride extends keyof TValue
    ? // Augment the original value with the override.
      TValue & TOverride
    : // If the overrides don't match the value at all, mark output as invalid.
      never;

type BuildOutput<TValue, TOverride> =
  // If the override is identical to the original value.
  TValue extends TOverride
    ? TValue
    : // If the original value is an array.
      TValue extends unknown[]
      ? BuildArrayOutput<TValue, TOverride>
      : BuildOtherOutput<TValue, TOverride>;

type Build<TContext, TValue> = {
  (config: TContext): TValue;
};

type Builder<TContext, TValue> = {
  // Support passing override as a function that returns a value.
  <TOverride extends StrictPartial<TValue>>(
    override: Build<TContext, BuildInput<TValue, TOverride>>,
  ): BuildOutput<TValue, TOverride>;

  // Support passing override as a value directly.
  <TOverride extends StrictPartial<TValue>>( //
    override: BuildInput<TValue, TOverride>,
  ): BuildOutput<TValue, TOverride>;

  // Support not passing an override at all.
  (): TValue;
};

type CreateBuilder<TContext> = {
  <TValue>(build: Build<TContext, TValue>): Builder<TContext, TValue>;
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
export function configureMockBuilder<TContext>(config: Configuration<TContext>): CreateBuilder<TContext> {
  function createBuilder<TValue>(build: Build<TContext, TValue>) {
    function builder<TOverride extends StrictPartial<TValue>>(override?: Build<TContext, TOverride> | TOverride) {
      const original = build(config.context);

      // Unwrap the override if it's a function.
      if (typeof override === "function") {
        override = override(config.context);
      }

      // If both the original and the override are objects, we merge them.
      if (original !== null && typeof original === "object" && !Array.isArray(original)) {
        if (override !== null && typeof override === "object" && !Array.isArray(override)) {
          return { ...original, ...override };
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

    return builder;
  }

  return createBuilder;
}
