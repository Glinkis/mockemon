interface Configuration {
  /**
   * Should return a serializable structure that uniquely identifies a request.
   */
  readonly resolve: (request: any) => {
    key: string;
    value: any;
  };
}

export function configureMockServer<TConfig extends Configuration>(config: TConfig) {
  return {
    /**
     * Stores the mocks that are registered for each request.
     */
    mocks: createStore(config),
  };
}

function createStore<TConfig extends Configuration>(config: TConfig) {
  type Request = Parameters<(typeof config)["resolve"]>[0];
  type Value = ReturnType<(typeof config)["resolve"]>["value"];

  const store = new Map<string, Value>();

  return {
    set(request: Request) {
      const resolved = config.resolve(request);
      store.set(resolved.key, resolved.value);
    },
    get(request: Omit<Request, "value">) {
      const resolved = config.resolve(request);
      return store.get(resolved.key);
    },
    getAll() {
      return Object.fromEntries(store);
    },
  };
}
