import http from "node:http";
import { expect, it } from "bun:test";
import { configureMockServer } from "../src/server";

interface RequestIdentity {
  path: string;
  method: string;
}

interface Payload extends RequestIdentity {
  body: Record<string, unknown>;
}

const config = configureMockServer<Payload, RequestIdentity>({
  realApiUrl: "/api",
  mockApiUrl: "/mock",
});

const server = config.server();

http
  .createServer(async (req, res) => {
    if (req.url?.startsWith(server.realApiUrl)) {
      const body = await new Promise<void | string>((resolve, reject) => {
        let result = "";
        req.on("data", (chunk) => {
          result += chunk;
        });
        req.on("end", () => {
          if (result) {
            resolve(JSON.parse(result));
            return;
          }
          resolve();
        });
      });

      const result = server.resolveRealApiRequest({
        url: req.url,
        getKey: (path) => `${req.method} ${path}`,
        getValue: () => body,
      });
      res.end(JSON.stringify(result));
    }
    if (req.url?.startsWith(server.mockApiUrl)) {
      const result = server.resolveMockApiRequest({
        url: req.url,
        getKey: (payload) => `${payload.method} ${payload.path}`,
        getValue: (payload) => payload.body,
      });

      res.end(JSON.stringify(result));
    }
  })
  .listen(4001);

const client = config.client({
  address: "http://localhost:4001",
  async request({ url, method }) {
    const response = await fetch(url, {
      method,
    });
    return response.json();
  },
});

it("can configure a server with http", async () => {
  await client.setMock({
    path: "/some/url",
    method: "GET",
    body: {
      foo: "foo",
    },
  });

  await client.setMock({
    path: "/some/other/url",
    method: "POST",
    body: {
      bar: "bar",
    },
  });

  expect(await client.getAllMocks()).toStrictEqual({
    "GET /some/url": {
      foo: "foo",
    },
    "POST /some/other/url": {
      bar: "bar",
    },
  });

  const mockedGet = await fetch("http://localhost:4001/api/some/url", {
    method: "GET",
  });

  expect(await mockedGet.json()).toStrictEqual({
    foo: "foo",
  });

  const mockedPost = await fetch("http://localhost:4001/api/some/other/url", {
    method: "POST",
    body: JSON.stringify({
      bar: "bar baz bax",
    }),
  });

  expect(await mockedPost.json()).toStrictEqual({
    bar: "bar",
  });

  const latestHistory = await client.getLatestHistory({
    path: "/some/other/url",
    method: "POST",
  });

  expect(latestHistory).toStrictEqual({
    bar: "bar baz bax",
  });
});
