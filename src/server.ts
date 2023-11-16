interface Configuration<TRequest> {
  /**
   * Should return a serializable structure that uniquely identifies a request.
   */
  getStorageKey: (request: TRequest) => unknown;
}

export function configureMockServer<TRequest, TMock>(config: Configuration<TRequest>) {
  /**
   * Stores the mocks that are registered for each request.
   */
  const mockStore = new Map<string, TMock>();

  return {
    mocks: {
      set(request: TRequest, mock: TMock) {
        mockStore.set(getKey(request), mock);
      },
      get(request: TRequest) {
        return mockStore.get(getKey(request));
      },
      getAll() {
        const entries: Record<string, TMock> = {};

        for (const [key, value] of mockStore.entries()) {
          entries[JSON.parse(key)] = value;
        }

        return entries;
      },
    },
  };

  function getKey(request: TRequest) {
    return JSON.stringify(config.getStorageKey(request));
  }
}
