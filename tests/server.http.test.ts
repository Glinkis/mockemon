import { expect, it } from "bun:test";
import http from "node:http";
import { configureMockServer } from "../src/server";

interface RequestMock {
  url: string;
  method: string;
  body: Record<string, unknown>;
}

const config = configureMockServer({
  address: "http://localhost:4001",
  resolve: (request: RequestMock) => ({
    key: JSON.stringify({
      url: request.url,
      method: request.method,
    }),
    value: request.body,
  }),
});

function createNodeHttpMockServer() {
  const mockServer = config.mocks.server();

  http
    .createServer((req, res) => {
      if (req.url!.startsWith("/mock/")) {
        const parsed = req.url!.slice("/mock/".length);

        if (req.method === "POST") {
          mockServer.set(parsed);
          res.end();
        }

        if (req.method === "GET") {
          const mock = mockServer.get(parsed);
          res.end(JSON.stringify(mock));
        }
      }

      if (req.url === "/mocks" && req.method === "GET") {
        const mocks = JSON.stringify(mockServer.getAll());
        res.end(mocks);
      }

      res.end();
    })
    .listen(4001);
}

it("can configure a server with http", async () => {
  createNodeHttpMockServer();
  const client = config.mocks.client();

  const mock1: RequestMock = {
    url: "/some/url",
    method: "POST",
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
    method: "POST",
    body: {
      bar: "bar",
    },
  });

  expect(await client.getAll()).toStrictEqual({
    '{"url":"/some/url","method":"POST"}': {
      foo: "foo",
    },
    '{"url":"/some/other/url","method":"POST"}': {
      bar: "bar",
    },
  });
});
