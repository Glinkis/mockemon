interface Configuration {
  mockApiUrl: string;
  realApiUrl: string;
}

interface ServerConfiguration<TPayload, TValue> {
  getKey: (payload: TPayload) => string;
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
  const rootUrl = config.mockApiUrl;
  const setUrl = rootUrl + "set/";
  const getUrl = rootUrl + "get/";
  const getAllUrl = rootUrl + "get-all";

  return {
    mockApiUrl: config.mockApiUrl,
    realApiUrl: config.realApiUrl,

    /**
     * Server setup for storing mocks.
     */
    server<TValue>(serverConfig: ServerConfiguration<TPayload, TValue>) {
      const store = new Map<string, TValue>();

      function decode(url: string) {
        return JSON.parse(decodeURIComponent(url));
      }

      return {
        mockApiUrl: config.mockApiUrl,
        realApiUrl: config.realApiUrl,
        getMockedValue(key: string) {
          return store.get(key);
        },
        resolveMockRequest(url: string) {
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
