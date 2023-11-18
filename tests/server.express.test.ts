import express from "express";
import { expect, it } from "bun:test";
import { configureMockServer } from "../src/server";

interface RequestMock {
  url: string;
  method: string;
  body: unknown;
}

const config = configureMockServer<RequestMock>({
  realApiUrl: "/api/",
  mockApiUrl: "/mock/",
});

function createExpressMockServer() {
  const mockServer = config.server({
    getKey: (payload) => `${payload.method} ${payload.url}`,
    getValue: (payload) => payload.body,
  });

  express()
    .all(mockServer.realApiUrl + "*", (req, res) => {
      res.json(mockServer.getMockedValue(`${req.method} ${req.originalUrl.slice(4)}`));
    })
    .all(mockServer.mockApiUrl + "*", (req, res) => {
      res.json(mockServer.resolveMockRequest(req.originalUrl));
    })
    .listen(4000);
}

it("can configure a server with express", async () => {
  createExpressMockServer();

  const client = config.client({
    address: "http://localhost:4000",
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

  const mocked = await fetch("http://localhost:4000/api/some/url", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  expect(await mocked.json()).toStrictEqual({
    foo: "foo",
  });
});
