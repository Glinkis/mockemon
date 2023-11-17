import { expect, it } from "bun:test";
import http from "node:http";
import { configureMockServer } from "../src/server";

interface RequestMock {
  url: string;
  method: string;
  body: unknown;
}

function createNodeHttpMockServer() {
  const config = configureMockServer({
    logging: true,
    resolve: (request: RequestMock) => ({
      key: JSON.stringify({
        url: request.url,
        method: request.method,
      }),
      value: request.body,
    }),
  });

  http
    .createServer((req, res) => {
      if (req.url!.startsWith("/mock/")) {
        const parsed = JSON.parse(decodeURIComponent(req.url!.slice("/mock/".length)));

        if (req.method === "POST") {
          config.mocks.set(parsed);
          res.end();
        }

        if (req.method === "GET") {
          const mock = config.mocks.get(parsed);
          res.end(JSON.stringify(mock));
        }
      }

      if (req.url === "/mocks" && req.method === "GET") {
        const mocks = JSON.stringify(config.mocks.getAll());
        res.end(mocks);
      }

      res.end();
    })
    .listen(4001);
}

it("can configure a server with http", async () => {
  createNodeHttpMockServer();

  const mock1: RequestMock = {
    url: "/some/url",
    method: "POST",
    body: {
      foo: "foo",
    },
  };

  await fetch("http://localhost:4001/mock/" + encodeURIComponent(JSON.stringify(mock1)), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const mockRequest = await fetch("http://localhost:4001/mock/" + encodeURIComponent(JSON.stringify(mock1)), {
    headers: { "Content-Type": "application/json" },
  });

  expect(await mockRequest.json()).toStrictEqual({
    foo: "foo",
  });

  const mock2: RequestMock = {
    url: "/some/other/url",
    method: "POST",
    body: {
      bar: "bar",
    },
  };

  await fetch("http://localhost:4001/mock/" + encodeURIComponent(JSON.stringify(mock2)), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const mocksRequest = await fetch("http://localhost:4001/mocks");

  expect(await mocksRequest.json()).toStrictEqual({
    '{"url":"/some/url","method":"POST"}': {
      foo: "foo",
    },
    '{"url":"/some/other/url","method":"POST"}': {
      bar: "bar",
    },
  });
});
