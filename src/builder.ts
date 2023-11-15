/**
 * A configuration object that is passed to the `configureMockBuilder` function.
 */
interface MockBuilderInitialConfig<TFaker> {
  /**
   * A value that will be passed to the default builder function.
   * This is usually a faker instance.
   */
  readonly faker: TFaker;
}

type Overrideable<TValue> = {
  readonly [P in keyof TValue]?: TValue[P];
};

export function configureMockBuilder<TFaker>(config: MockBuilderInitialConfig<TFaker>) {
  type DefaultBuilder<TValue> = (faker: TFaker) => TValue;

  type OverrideBuilder<TOverrides> = TOverrides | ((faker: TFaker) => TOverrides);

  type MockBuilder<TValue> = {
    (): TValue;
    <TOverrides extends Overrideable<TValue>>(overrides: OverrideBuilder<TOverrides>): TValue & TOverrides;
  };

  function createMockBuilder<TValue>(build: DefaultBuilder<TValue>): MockBuilder<TValue> {
    return function buildMock<TOverrides extends Partial<TValue>>(overrides?: OverrideBuilder<TOverrides>) {
      const defaultMock = build(config.faker);

      if (typeof defaultMock === "object" && defaultMock !== null) {
        if (typeof overrides === "function") {
          const result = overrides(config.faker);

          if (typeof result === "object" && result !== null) {
            return Object.assign(defaultMock, result);
          }

          return result;
        }

        if (arguments.length > 0) {
          if (typeof overrides === "object" && overrides !== null) {
            return Object.assign(defaultMock, overrides);
          }

          return overrides;
        }

        return defaultMock;
      }

      if (typeof overrides === "function") {
        return overrides(config.faker);
      }

      if (arguments.length > 0) {
        return overrides;
      }

      return defaultMock;
    };
  }

  return { createMockBuilder };
}
