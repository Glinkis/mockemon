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
          return Object.assign(defaultMock, overrides(config.faker));
        }

        return Object.assign(defaultMock, overrides);
      }

      if (typeof overrides === "function") {
        return overrides(config.faker);
      }

      // To support passing "undefined" as an override,
      // we need to check the number of arguments intead of the actual value.
      if (arguments.length > 0) {
        return overrides;
      }

      return defaultMock;
    };
  }

  return { createMockBuilder };
}
