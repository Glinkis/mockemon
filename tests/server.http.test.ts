import http from "node:http";
import { expect, it } from "bun:test";
import { configureMockServer } from "../src/server";

interface RequestMock {
  url: string;
  method: string;
  body: Record<string, unknown>;
}

const config = configureMockServer<RequestMock>({
  realApiUrl: "/api",
  mockApiUrl: "/mock",
});

function createNodeHttpMockServer() {
  const mockServer = config.server({
    getValue: (payload) => payload.body,
  });

  http
    .createServer((req, res) => {
      if (req.url?.startsWith(mockServer.realApiUrl)) {
        const result = mockServer.getMockedValue({
          url: req.url,
          getKey: (url) => `${req.method} ${url}`,
        });
        res.end(JSON.stringify(result));
      }
      if (req.url?.startsWith(mockServer.mockApiUrl)) {
        const result = mockServer.resolveMockRequest({
          url: req.url,
          getKey: (payload) => `${payload.method} ${payload.url}`,
        });
        res.end(JSON.stringify(result));
      }
    })
    .listen(4001);
}

it("can configure a server with http", async () => {
  createNodeHttpMockServer();

  const client = config.client({
    address: "http://localhost:4001",
    async request({ url, method }) {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.json();
    },
  });

  const mock1: RequestMock = {
    url: "/some/url",
    method: "GET",
    body: {
      foo: "foo",
    },
  };

  await client.set(mock1);

  expect(await client.get(mock1)).toStrictEqual({
    foo: "foo",
  });

  await client.set({
    url: "/some/other/url",
    method: "GET",
    body: {
      bar: "bar",
    },
  });

  expect(await client.getAll()).toStrictEqual({
    "GET /some/url": {
      foo: "foo",
    },
    "GET /some/other/url": {
      bar: "bar",
    },
  });

  const mocked = await fetch("http://localhost:4001/api/some/url", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  expect(await mocked.json()).toStrictEqual({
    foo: "foo",
  });
});
