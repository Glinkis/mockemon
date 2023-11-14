import { describe, expect, it } from "bun:test";
import { configureMockBuilder } from "../src/builder.js";
import { faker } from "@faker-js/faker";

describe("builder", () => {
  const { createMockBuilder } = configureMockBuilder({
    faker: faker,
  });

  it("should create a mock builder", () => {
    const buildMock = createMockBuilder((f) => ({
      foo: f.animal.cat(),
      bar: f.animal.dog(),
    }));

    const mocked = buildMock();

    expect(mocked).toEqual({ foo: mocked.foo, bar: mocked.bar });
  });

  it("should allow overriding the default mock", () => {
    const buildMock = createMockBuilder((f) => ({
      foo: f.animal.cat(),
      bar: f.animal.dog(),
    }));

    const mocked = buildMock({ foo: "baz" });

    expect(mocked).toEqual({ foo: "baz", bar: mocked.bar });
  });

  it("should allow overriding the default mock with a function", () => {
    const buildMock = createMockBuilder((f) => ({
      foo: f.animal.cat(),
      bar: f.animal.dog(),
    }));

    const mocked = buildMock((f) => ({ foo: "Parrot" as const }));

    expect(mocked).toEqual({ foo: "Parrot", bar: mocked.bar });
  });
});
