import { describe, expect, it } from "bun:test";
import { configureMockBuilder } from "../src/builder.js";
import { faker } from "@faker-js/faker";

describe("builder", () => {
  interface PetOwner {
    name: string;
    pet: string;
  }

  const { createMockBuilder } = configureMockBuilder({
    faker: {
      name: () => "Gustavo",
      pet: () => "Dog",
      numbers: () => [1, 2, 3],
    },
  });

  it("allows mocking objects", () => {
    const buildMock = createMockBuilder<PetOwner>((f) => ({
      name: f.name(),
      pet: f.pet(),
    }));

    const mocked = buildMock();

    expect(mocked).toEqual({
      name: "Gustavo",
      pet: "Dog",
    });
  });

  it("allows overriding object mocks", () => {
    const buildMock = createMockBuilder<PetOwner>((f) => ({
      name: f.name(),
      pet: f.pet(),
    }));

    const mocked = buildMock({
      name: "Rafael",
    });

    expect(mocked).toEqual({
      name: "Rafael",
      pet: "Dog",
    });
  });

  it("allows overriding object mocks with a function", () => {
    const buildMock = createMockBuilder<PetOwner>(() => ({
      name: "Gustavo",
      pet: "Dog",
    }));

    const mocked = buildMock(() => ({
      pet: "Parrot",
    }));

    expect(mocked).toEqual({
      name: "Gustavo",
      pet: "Parrot",
    });
  });

  it("allows mocking primitive values", () => {
    const buildMock = createMockBuilder((f) => f.name());

    expect(buildMock()).toEqual("Gustavo");
  });

  it("allows overriding primitive value mocks", () => {
    const buildMock = createMockBuilder<string | null | undefined>((f) => f.name());

    expect(buildMock("Parrot")).toEqual("Parrot");

    expect(buildMock(null)).toEqual(null);

    expect(buildMock(undefined)).toEqual(undefined);
  });

  it("allows overriding primitive value mocks with a function", () => {
    const buildMock = createMockBuilder<string | null | undefined>((f) => f.name());

    expect(buildMock(() => "Parrot")).toEqual("Parrot");

    expect(buildMock(() => null)).toEqual(null);

    expect(buildMock(() => undefined)).toEqual(undefined);
  });

  it("allows mocking arrays", () => {
    const buildMock = createMockBuilder((f) => f.numbers());

    const mocked = buildMock();

    expect(mocked).toEqual(mocked);
  });

  it("allows overriding array mocks", () => {
    const buildMock = createMockBuilder<number[]>((f) => f.numbers());

    expect(buildMock([4, 5, 6])).toEqual([4, 5, 6]);
  });

  it("allows overriding array mocks with a function", () => {
    const buildMock = createMockBuilder<number[]>((f) => f.numbers());

    expect(buildMock(() => [4, 5, 6])).toEqual([4, 5, 6]);
  });
});
