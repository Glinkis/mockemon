interface Configuration {
  /**
   * Should return a serializable structure that uniquely identifies a request.
   */
  readonly resolve: (request: any) => {
    key: string;
    value: any;
  };
}

interface ClientConfiguration {
  /**
   * The address of the server.
   */
  readonly address: string;
}

export function configureMockServer<TConfig extends Configuration>(config: TConfig) {
  type Request = Parameters<(typeof config)["resolve"]>[0];
  type Value = ReturnType<(typeof config)["resolve"]>["value"];

  const rootUrl = "/mocks/";
  const setUrl = rootUrl + "set/";
  const getUrl = rootUrl + "get/";
  const getAllUrl = rootUrl + "get-all";

  return {
    /**
     * Server setup for storing mocks.
     */
    server() {
      const store = new Map<string, Value>();

      return {
        url: rootUrl,
        resolve(url: string) {
          if (url.startsWith(setUrl)) {
            const parsed = url.slice(setUrl.length);
            const decoded = JSON.parse(decodeURIComponent(parsed));
            const resolved = config.resolve(decoded);
            store.set(resolved.key, resolved.value);
            return;
          }

          if (url.startsWith(getUrl)) {
            const parsed = url.slice(getUrl.length);
            const decoded = JSON.parse(decodeURIComponent(parsed));
            const resolved = config.resolve(decoded);
            return store.get(resolved.key);
          }

          if (url.startsWith(getAllUrl)) {
            return Object.fromEntries(store);
          }
        },
      };
    },

    /**
     * Client for interacting with the mock server.
     */
    client(clientConfig: ClientConfiguration) {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      function unwrap(response: Response) {
        return response.json();
      }

      return {
        /**
         * Registers a mock for a request.
         */
        set(request: Request) {
          return fetch(clientConfig.address + setUrl + encodeURIComponent(JSON.stringify(request)), {
            method: "POST",
            headers,
          }).then(unwrap);
        },

        /**
         * Returns the mock for a request.
         */
        get(request: Request) {
          return fetch(clientConfig.address + getUrl + encodeURIComponent(JSON.stringify(request)), {
            method: "GET",
            headers,
          }).then(unwrap);
        },

        /**
         * Returns all mocks.
         */
        getAll() {
          return fetch(clientConfig.address + getAllUrl, {
            method: "GET",
            headers,
          }).then(unwrap);
        },
      };
    },
  };
}
