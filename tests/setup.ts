import { afterAll, beforeAll } from "bun:test";
import { cleanup, setup } from "@arktype/attest";

beforeAll(() => {
  setup();
});

afterAll(() => {
  cleanup();
});
