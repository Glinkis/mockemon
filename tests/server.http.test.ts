import http from "node:http";
import { expect, it } from "bun:test";
import { configureMockServer } from "../src/server";

interface RequestMock {
  url: string;
  method: string;
  body: Record<string, unknown>;
}

const config = configureMockServer<RequestMock>();

function createNodeHttpMockServer() {
  const mockServer = config.server({
    getKey: (request) => `${request.method} ${request.url}`,
    getValue: (request) => request.body,
  });

  http
    .createServer((req, res) => {
      if (req.url?.startsWith(mockServer.url)) {
        res.end(JSON.stringify(mockServer.resolve(req.url)));
      }
    })
    .listen(4001);
}

it("can configure a server with http", async () => {
  createNodeHttpMockServer();

  const client = config.client({
    address: "http://localhost:4001",
  });

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
    "POST /some/url": {
      foo: "foo",
    },
    "POST /some/other/url": {
      bar: "bar",
    },
  });
});
