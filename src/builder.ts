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
      const initial = build(config.faker);

      const overridden = (() => {
        if (typeof overrides === "function") {
          return overrides(config.faker);
        }
        return overrides;
      })();

      const isInitialAnObject = typeof initial === "object" && initial !== null;
      const isOverriddenAnObject = typeof overridden === "object" && overridden !== null;

      if (isInitialAnObject && isOverriddenAnObject) {
        return Object.assign(initial, overridden);
      }

      if (arguments.length) {
        return overridden;
      }

      return initial;
    };
  }

  return { createMockBuilder };
}
