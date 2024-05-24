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

/**
 * Configures and returns a mock builder function.
 *
 * @param config
 * @returns
 */
export function configureMockBuilder<TConfig extends Configuration>(config: TConfig) {
  type Build<TValue> = (faker: TConfig["context"]) => TValue;

  type Override<TOverrides> = Build<TOverrides> | TOverrides;

  function createMockBuilder<TValue>(build: Build<TValue>) {
    function buildMock(): TValue;

    function buildMock<TOverrides extends Overrideable<TValue>>(override: Override<TOverrides>): TValue & TOverrides;

    function buildMock<TOverrides extends Overrideable<TValue>>(override?: Override<TOverrides>) {
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
