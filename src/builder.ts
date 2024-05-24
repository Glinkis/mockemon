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

type CreateMockBuilder<TConfig extends Configuration, TContext = TConfig["context"]> = {
  <TValue>(build: Build<TContext, TValue>): {
    (): TValue;
    <TOverrides extends Overrideable<TValue>>(override: Override<TContext, TOverrides>): TValue & TOverrides;
  };
};

/**
 * Configures and returns a factory for mock builders.
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
