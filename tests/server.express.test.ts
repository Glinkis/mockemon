import express from "express";
import { expect, it } from "bun:test";
import { configureMockServer } from "../src/server";

interface RequestMock {
  path: string;
  method: string;
  body: Record<string, unknown>;
}

const config = configureMockServer<RequestMock>({
  realApiUrl: "/api",
  mockApiUrl: "/mock",
});

const server = config.server({
  getValue: (payload) => payload.body,
});

express()
  .all(server.realApiUrl + "*", (req, res) => {
    const result = server.getMockedValue({
      url: req.originalUrl,
      getKey: (path) => `${req.method} ${path}`,
    });
    res.json(result);
  })
  .all(server.mockApiUrl + "*", (req, res) => {
    const result = server.resolveMockRequest({
      url: req.originalUrl,
      getKey: (payload) => `${payload.method} ${payload.path}`,
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
  const mock1: RequestMock = {
    path: "/some/url",
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
    path: "/some/other/url",
    method: "POST",
    body: {
      bar: "bar",
    },
  });

  expect(await client.getAll()).toStrictEqual({
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
