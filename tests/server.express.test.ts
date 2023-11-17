import express from "express";
import { expect, it } from "bun:test";
import { configureMockServer } from "../src/server";

interface RequestMock {
  url: string;
  method: string;
  body: unknown;
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

function createExpressMockServer() {
  const mockServer = config.server();

  express()
    .all(mockServer.url + "*", (req, res) => {
      res.json(mockServer.resolve(req.originalUrl));
    })
    .listen(4000);
}

it("can configure a server with express", async () => {
  createExpressMockServer();

  const client = config.client({
    address: "http://localhost:4000",
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
    '{"url":"/some/url","method":"POST"}': {
      foo: "foo",
    },
    '{"url":"/some/other/url","method":"POST"}': {
      bar: "bar",
    },
  });
});
