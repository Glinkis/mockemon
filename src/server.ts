interface Configuration<TRequest> {
  /**
   * Should return a serializable structure that uniquely identifies a request.
   */
  getStorageKey: (request: TRequest) => unknown;
}

export function configureMockServer<TRequest, TMock>(config: Configuration<TRequest>) {
  return {
    /**
     * Stores the mocks that are registered for each request.
     */
    mocks: createStore<TRequest, TMock>(config),
    /**
     * Stores the history of requests that were made to the server.
     */
    requests: createStore<TRequest, TRequest>(config),
  };
}

function createStore<TRequest, TValue>(config: Configuration<TRequest>) {
  const store = new Map<string, TValue>();

  function getKey(request: TRequest) {
    return JSON.stringify(config.getStorageKey(request));
  }

  return {
    set(request: TRequest, value: TValue) {
      store.set(getKey(request), value);
    },
    get(request: TRequest) {
      return store.get(getKey(request));
    },
    getAll() {
      const entries: Record<string, TValue> = {};

      for (const [key, value] of store.entries()) {
        entries[JSON.parse(key)] = value;
      }

      return entries;
    },
  };
}
