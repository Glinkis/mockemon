import { expect, it } from "bun:test";
import { configureMockServer } from "../src/server";
import express from "express";

interface RequestMock {
  url: string;
  method: string;
  body: unknown;
}

function createExpressMockServer() {
  const config = configureMockServer({
    resolve: (request: RequestMock) => ({
      key: JSON.stringify({
        url: request.url,
        method: request.method,
      }),
      value: request.body,
    }),
  });

  const app = express().use(express.json());

  app.post("/mock", (req, res) => {
    config.mocks.set(req.body);
    res.json();
  });

  app.get("/mock/:request", (req, res) => {
    const mock = config.mocks.get(JSON.parse(req.params.request));
    res.json(mock);
  });

  app.get("/mocks", (_, res) => {
    res.json(config.mocks.getAll());
  });

  app.listen(4000);
}

it("can configure a server with express", async () => {
  createExpressMockServer();

  const mock1: RequestMock = {
    url: "/some/url",
    method: "POST",
    body: {
      foo: "foo",
    },
  };

  await fetch("http://localhost:4000/mock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mock1),
  });

  const mock1Request = await fetch("http://localhost:4000/mock/" + encodeURIComponent(JSON.stringify(mock1)), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  expect(await mock1Request.json()).toStrictEqual({
    foo: "foo",
  });

  const mock2: RequestMock = {
    url: "/some/other/url",
    method: "POST",
    body: {
      bar: "bar",
    },
  };

  await fetch("http://localhost:4000/mock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mock2),
  });

  const mocksRequest = await fetch("http://localhost:4000/mocks");

  expect(await mocksRequest.json()).toStrictEqual({
    '{"url":"/some/url","method":"POST"}': {
      foo: "foo",
    },
    '{"url":"/some/other/url","method":"POST"}': {
      bar: "bar",
    },
  });
});
