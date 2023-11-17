import { expect, it } from "bun:test";
import { configureMockServer } from "../src/server";
import express from "express";

it("can configure a server with express", async () => {
  const config = configureMockServer({
    getStorageKey: (req: express.Request) => [req.originalUrl],
  });

  const app = express();

  app.post("/mock", express.json(), (req, res) => {
    config.mocks.set(req, req.body);
    res.json();
  });

  app.get("/mock", (req, res) => {
    res.json(config.mocks.get(req));
  });

  app.get("/mocks", (_, res) => {
    res.json(config.mocks.getAll());
  });

  app.listen(3000);

  await fetch("http://localhost:3000/mock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ foo: "bar" }),
  });

  const mock = await fetch("http://localhost:3000/mock").then((res) => res.json());

  expect(mock).toEqual({ foo: "bar" });

  const mocks = await fetch("http://localhost:3000/mocks").then((res) => res.json());

  expect(mocks).toEqual({ "/mock": { foo: "bar" } });
});
