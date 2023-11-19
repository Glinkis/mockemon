import express from "express";
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

express()
  .use(express.json())
  .all(server.realApiUrl + "*", (req, res) => {
    const result = server.resolveRealApiRequest({
      url: req.originalUrl,
      getKey: (path) => `${req.method} ${path}`,
      getValue: () => req.body,
    });
    res.json(result);
  })
  .all(server.mockApiUrl + "*", (req, res) => {
    const result = server.resolveMockApiRequest({
      url: req.originalUrl,
      getKey: (payload) => `${payload.method} ${payload.path}`,
      getValue: (payload) => payload.body,
    });
    res.json(result);
  })
  .listen(4000);

const client = config.client({
  address: "http://localhost:4000",
  async request({ url, method }) {
    const response = await fetch(url, {
      method,
    });
    return response.json();
  },
});

it("can configure a server with express", async () => {
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

  const mockedGet = await fetch("http://localhost:4000/api/some/url", {
    method: "GET",
  });

  expect(await mockedGet.json()).toStrictEqual({
    foo: "foo",
  });

  const mockedPost = await fetch("http://localhost:4000/api/some/other/url", {
    method: "POST",
  });

  expect(await mockedPost.json()).toStrictEqual({
    bar: "bar",
  });
});
