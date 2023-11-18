interface ClientConfiguration {
  /**
   * The address of the server.
   */
  address: string;
}

interface ServerConfiguration<TPayload, TValue> {
  getKey: (payload: TPayload) => string;
  getValue: (payload: TPayload) => TValue;
}

export function configureMockServer<TPayload>() {
  const rootUrl = "/mocks/";
  const setUrl = rootUrl + "set/";
  const getUrl = rootUrl + "get/";
  const getAllUrl = rootUrl + "get-all";

  return {
    /**
     * Server setup for storing mocks.
     */
    server<TValue>(serverConfig: ServerConfiguration<TPayload, TValue>) {
      const store = new Map<string, TValue>();

      function decode(url: string) {
        return JSON.parse(decodeURIComponent(url));
      }

      return {
        url: rootUrl,
        resolve(url: string) {
          if (url.startsWith(setUrl)) {
            const decoded = decode(url.slice(setUrl.length));
            store.set(serverConfig.getKey(decoded), serverConfig.getValue(decoded));
            return;
          }

          if (url.startsWith(getUrl)) {
            const decoded = decode(url.slice(getUrl.length));
            return store.get(serverConfig.getKey(decoded));
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

      function encode(request: TPayload) {
        return encodeURIComponent(JSON.stringify(request));
      }

      return {
        /**
         * Registers a mock for a request.
         */
        set(request: TPayload) {
          return fetch(clientConfig.address + setUrl + encode(request), {
            method: "POST",
            headers,
          }).then(unwrap);
        },

        /**
         * Returns the mock for a request.
         */
        get(request: TPayload) {
          return fetch(clientConfig.address + getUrl + encode(request), {
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
