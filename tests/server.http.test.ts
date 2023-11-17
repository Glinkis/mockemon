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
      if (typeof req.url === "undefined") {
        throw new Error("req.url is undefined");
      }
      res.end(mockServer.resolve(req.url));
    })
    .listen(4001);
}

it.skip("can configure a server with http", async () => {
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
