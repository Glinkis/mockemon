interface Configuration {
  mockApiUrl: string;
  realApiUrl: string;
}

interface ServerConfiguration<TPayload, TValue> {
  getValue: (payload: TPayload) => TValue;
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
   * The request function.
   */
  request: (args: RequestArgs) => Promise<unknown>;
}

export function configureMockServer<TPayload>(config: Configuration) {
  const setUrl = config.mockApiUrl + "set/";
  const getUrl = config.mockApiUrl + "get/";
  const getAllUrl = config.mockApiUrl + "get-all";

  return {
    /**
     * Server setup for storing mocks.
     */
    server<TValue>(serverConfig: ServerConfiguration<TPayload, TValue>) {
      const store = new Map<string, TValue>();

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
         */
        getKey: (url: string) => string;
      }

      interface ResolveMockRequstArgs {
        /**
         * The full url path of the request.
         */
        url: `${typeof config.mockApiUrl}${string}`;

        /**
         * This should resolve to a key that uniquely identifies the request.
         */
        getKey: (payload: TPayload) => string;
      }

      return {
        mockApiUrl: config.mockApiUrl,
        realApiUrl: config.realApiUrl,

        /**
         * Returns the mocked value for a request.
         */
        getMockedValue(args: GetMockedValueArgs) {
          const url = args.url.slice(config.realApiUrl.length);
          return store.get(args.getKey(url));
        },

        /**
         * Resolves a request to the mocking API.
         */
        resolveMockRequest(args: ResolveMockRequstArgs) {
          if (args.url.startsWith(setUrl)) {
            const decoded = decode(args.url.slice(setUrl.length));
            store.set(args.getKey(decoded), serverConfig.getValue(decoded));
            return;
          }

          if (args.url.startsWith(getUrl)) {
            const decoded = decode(args.url.slice(getUrl.length));
            return store.get(args.getKey(decoded));
          }

          if (args.url.startsWith(getAllUrl)) {
            return Object.fromEntries(store);
          }
        },
      };
    },

    /**
     * Client for interacting with the mock server.
     */
    client(clientConfig: ClientConfiguration) {
      function encode(request: TPayload) {
        return encodeURIComponent(JSON.stringify(request));
      }

      return {
        /**
         * Registers a mock for a request.
         */
        set(request: TPayload) {
          return clientConfig.request({
            url: clientConfig.address + setUrl + encode(request),
            method: "POST",
          });
        },

        /**
         * Returns the mock for a request.
         */
        get(request: TPayload) {
          return clientConfig.request({
            url: clientConfig.address + getUrl + encode(request),
            method: "GET",
          });
        },

        /**
         * Returns all mocks.
         */
        getAll() {
          return clientConfig.request({
            url: clientConfig.address + getAllUrl,
            method: "GET",
          });
        },
      };
    },
  };
}
