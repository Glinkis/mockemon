interface Configuration {
  realApiUrl: string;
  mockApiUrl: string;
}

interface RequestArgs {
  url: string;
  method: string;
}

interface ClientConfiguration {
  /**
   * The address of the server.
   */
  address: string;

  /**
   * This should be a function that makes a request to the server.
   *
   * In the browser, this could be a function that uses the `fetch` API.
   *
   * @example
   * ```ts
   * const client = config.client({
   *  async request({ url, method }) {
   *   const response = await fetch(url, {
   *     method,
   *   });
   *   return response.json();
   *  }
   * })
   * ```
   */
  request: (args: RequestArgs) => Promise<unknown>;
}

export function configureMockServer<TPayload, TIdentifiers>(config: Configuration) {
  const setMockUrl = config.mockApiUrl + "/set-mock";
  const getAllMocksUrl = config.mockApiUrl + "/get-all-mocks";
  const getLatestHistoryUrl = config.mockApiUrl + "/get-latest-history";

  return {
    /**
     * Server setup for storing mocks.
     */
    server() {
      const mocks = new Map<string, unknown>();
      const history = new Map<string, unknown>();

      function decode(url: string) {
        return JSON.parse(decodeURIComponent(url));
      }

      interface GetMockedValueArgs {
        /**
         * The full url path of the request.
         */
        url: `${typeof config.realApiUrl}${string}`;

        /**
         * This should resolve to a key that uniquely identifies the request.
         * @param path The path of the request, without the `realApiUrl` prefix.
         */
        getKey: (path: string) => string;
        getValue?: (path: string) => unknown;
      }

      interface ResolveMockRequestArgs {
        /**
         * The full url path of the request.
         */
        url: `${typeof config.mockApiUrl}${string}`;

        /**
         * This should resolve to a key that uniquely identifies the request.
         * @param payload The payload that was sent from the client.
         */
        getKey: (payload: TPayload) => string;
        getValue: (payload: TPayload) => unknown;
      }

      return {
        realApiUrl: config.realApiUrl,
        mockApiUrl: config.mockApiUrl,

        /**
         * Returns the mocked value for a request.
         */
        resolveRealApiRequest(args: GetMockedValueArgs) {
          const url = args.url.slice(config.realApiUrl.length);
          const key = args.getKey(url);

          if (args.getValue) {
            const value = args.getValue(url);
            history.set(key, value);
          }

          return mocks.get(key);
        },

        /**
         * Resolves a request to the mocking API.
         */
        resolveMockApiRequest(args: ResolveMockRequestArgs) {
          if (args.url.startsWith(setMockUrl)) {
            const decoded = decode(args.url.slice(setMockUrl.length));
            const key = args.getKey(decoded);
            const value = args.getValue(decoded);
            mocks.set(key, value);
            return;
          }

          if (args.url.startsWith(getAllMocksUrl)) {
            return Object.fromEntries(mocks);
          }

          if (args.url.startsWith(getLatestHistoryUrl)) {
            const decoded = decode(args.url.slice(getLatestHistoryUrl.length));
            const key = args.getKey(decoded);
            console.log(key, history.get(key));
            return history.get(key);
          }
        },
      };
    },

    /**
     * Client for interacting with the mock server.
     */
    client(clientConfig: ClientConfiguration) {
      function encode(request: TPayload | TIdentifiers) {
        return encodeURIComponent(JSON.stringify(request));
      }

      return {
        /**
         * Adds a new request mock, or updates an existing one.
         */
        setMock(payload: TPayload) {
          return clientConfig.request({
            url: clientConfig.address + setMockUrl + encode(payload),
            method: "POST",
          });
        },

        /**
         * Returns all request mocks.
         */
        getAllMocks() {
          return clientConfig.request({
            url: clientConfig.address + getAllMocksUrl,
            method: "GET",
          });
        },

        /**
         * Returns the latest history value for a request.
         */
        getLatestHistory(payload: TIdentifiers) {
          return clientConfig.request({
            url: clientConfig.address + getLatestHistoryUrl + encode(payload),
            method: "GET",
          });
        },
      };
    },
  };
}
