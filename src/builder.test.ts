import { describe, expect, it } from "bun:test";
import { configureMockBuilder } from "./builder";
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

  it("should override the default mock", () => {
    const buildMock = createMockBuilder((f) => ({
      foo: f.animal.cat(),
      bar: f.animal.dog(),
    }));

    const mocked = buildMock({ foo: "baz" });

    expect(mocked).toEqual({ foo: "baz", bar: mocked.bar });
  });
});