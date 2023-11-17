import { expect, it } from "bun:test";
import http from "node:http";
import { configureMockServer } from "../src/server";

interface RequestMock {
  url: string;
  method: string;
  body: Record<string, unknown>;
}

const config = configureMockServer({
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
      if (req.url?.startsWith(mockServer.url)) {
        res.end(JSON.stringify(mockServer.resolve(req.url)));
      }
    })
    .listen(4001);
}

it("can configure a server with http", async () => {
  createNodeHttpMockServer();

  const client = config.mocks.client({
    address: "http://localhost:4001",
  });

  const mock1: RequestMock = {
    url: "/some/url",
    method: "POST",
    body: {
      foo: "foo",
    },
  };

  console.log(await client.set(mock1));

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
