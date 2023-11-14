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

type DefaultBuilder<TFaker, TValue> = (faker: TFaker) => TValue;

type OverrideBuilder<TFaker, TOverrides> = TOverrides | ((faker: TFaker) => TOverrides);

type MockBuilder<TFaker, TValue> = {
  (): TValue;
  <TOverrides extends Partial<TValue>>(overrides: OverrideBuilder<TFaker, TOverrides>): TValue & TOverrides;
};

export function configureMockBuilder<TFaker>(config: MockBuilderInitialConfig<TFaker>) {
  function createMockBuilder<TValue extends object>(
    build: DefaultBuilder<TFaker, TValue>,
  ): MockBuilder<TFaker, TValue> {
    return function buildMock<TOverrides extends Partial<TValue>>(overrides?: OverrideBuilder<TFaker, TOverrides>) {
      const defaultMock = build(config.faker);

      if (typeof overrides === "function") {
        return Object.assign(defaultMock, overrides(config.faker));
      }

      return Object.assign(defaultMock, overrides);
    };
  }

  return { createMockBuilder };
}
