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

type DefaultBuilder<TFaker, TValue> = {
  (faker: TFaker): TValue;
};

type MockBuilder<TValue> = {
  (): TValue;
  <TOverrides extends Partial<TValue>>(overrides: TOverrides): TValue & TOverrides;
};

export function configureMockBuilder<TFaker>(config: MockBuilderInitialConfig<TFaker>) {
  function createMockBuilder<TValue extends object>(build: DefaultBuilder<TFaker, TValue>): MockBuilder<TValue> {
    return function buildMock<TOverrides extends Partial<TValue>>(overrides?: TOverrides) {
      const defaultMock = build(config.faker);
      return Object.assign(defaultMock, overrides);
    };
  }

  return { createMockBuilder };
}
