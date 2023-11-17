interface Configuration {
  readonly address?: string;

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

  return {
    server() {
      const store = new Map<string, Value>();

      return {
        set(request: string) {
          const decoded = JSON.parse(decodeURIComponent(request));
          const resolved = config.resolve(decoded);
          store.set(resolved.key, resolved.value);
        },
        get(request: string) {
          const decoded = JSON.parse(decodeURIComponent(request));
          const resolved = config.resolve(decoded);
          return store.get(resolved.key);
        },
        getAll() {
          return Object.fromEntries(store);
        },
      };
    },

    client() {
      return {
        /**
         * Registers a mock for a request.
         */
        set(request: Request) {
          const encoded = encodeURIComponent(JSON.stringify(request));
          return fetch(config.address + "/mock/" + encoded, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }).then((response) => response.json());
        },

        /**
         * Returns the mock for a request.
         */
        get(request: Request) {
          const encoded = encodeURIComponent(JSON.stringify(request));
          return fetch(config.address + "/mock/" + encoded, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }).then((response) => response.json());
        },

        /**
         * Returns all mocks.
         */
        getAll() {
          return fetch(config.address + "/mocks", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }).then((response) => response.json());
        },
      };
    },
  };
}
