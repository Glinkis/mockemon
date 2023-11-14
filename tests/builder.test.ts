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

  it("should allow mocking primitive values", () => {
    const buildMock = createMockBuilder((f) => f.animal.cat());

    const mocked = buildMock();

    expect(mocked).toEqual(mocked);
  });

  it("should allow overriding primitive value mocks", () => {
    const buildMock = createMockBuilder<string | null>((f) => f.animal.cat());

    const mocked1 = buildMock("Parrot");

    expect(mocked1).toEqual("Parrot");

    const mocked2 = buildMock(null);

    expect(mocked2).toEqual(null);
  });

  it("should allow overriding primitive value mocks with a function", () => {
    const buildMock = createMockBuilder<string | null>((f) => f.animal.cat());

    const mocked1 = buildMock(() => "Parrot");

    expect(mocked1).toEqual("Parrot");

    const mocked2 = buildMock(() => null);

    expect(mocked2).toEqual(null);
  });
});
