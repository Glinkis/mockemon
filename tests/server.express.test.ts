import { expect, it } from "bun:test";
import { configureMockServer } from "../src/server";
import express from "express";

interface RequestMock {
  url: string;
  method: string;
  body: unknown;
}

const config = configureMockServer({
  address: "http://localhost:4000",
  resolve: (request: RequestMock) => ({
    key: JSON.stringify({
      url: request.url,
      method: request.method,
    }),
    value: request.body,
  }),
});

function createExpressMockServer() {
  const mockServer = config.mocks.server();

  const app = express().use(express.json());

  app.post("/mock/:request", (req, res) => {
    mockServer.set(req.params.request);
    res.json();
  });

  app.get("/mock/:request", (req, res) => {
    const mock = mockServer.get(req.params.request);
    res.json(mock);
  });

  app.get("/mocks", (_, res) => {
    res.json(mockServer.getAll());
  });

  app.listen(4000);
}

it("can configure a server with express", async () => {
  createExpressMockServer();

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
