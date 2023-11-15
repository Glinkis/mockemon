import { describe, expect, it } from "bun:test";
import { configureMockBuilder } from "../src/builder.js";
import { faker } from "@faker-js/faker";

describe("builder", () => {
  interface PetOwner {
    name: string;
    pet: string;
  }

  const { createMockBuilder } = configureMockBuilder({
    faker: faker,
  });

  it("should create a mock builder", () => {
    const buildMock = createMockBuilder<PetOwner>((f) => ({
      name: f.person.fullName(),
      pet: f.animal.dog(),
    }));

    const mocked = buildMock();

    expect(mocked).toEqual({
      name: mocked.name,
      pet: mocked.pet,
    });
  });

  it("should allow overriding the default mock", () => {
    const buildMock = createMockBuilder<PetOwner>((f) => ({
      name: f.person.fullName(),
      pet: f.animal.dog(),
    }));

    const mocked = buildMock({
      name: "baz",
    });

    expect(mocked).toEqual({
      name: "baz",
      pet: mocked.pet,
    });
  });

  it("should allow overriding the default mock with a function", () => {
    const buildMock = createMockBuilder<PetOwner>((f) => ({
      name: f.person.fullName(),
      pet: f.animal.dog(),
    }));

    const mocked = buildMock(() => ({
      pet: "Parrot",
    }));

    expect(mocked).toEqual({
      name: mocked.name,
      pet: "Parrot",
    });
  });

  it("should allow mocking primitive values", () => {
    const buildMock = createMockBuilder((f) => f.animal.cat());

    const mocked = buildMock();
    expect(mocked).toEqual(mocked);
  });

  it("should allow overriding primitive value mocks", () => {
    const buildMock = createMockBuilder<string | null | undefined>((f) => f.animal.cat());

    expect(buildMock("Parrot")).toEqual("Parrot");

    expect(buildMock(null)).toEqual(null);

    expect(buildMock(undefined)).toEqual(undefined);
  });

  it("should allow overriding primitive value mocks with a function", () => {
    const buildMock = createMockBuilder<string | null | undefined>((f) => f.animal.cat());

    expect(buildMock(() => "Parrot")).toEqual("Parrot");

    expect(buildMock(() => null)).toEqual(null);

    expect(buildMock(() => undefined)).toEqual(undefined);
  });

  it("should allow mocking arrays", () => {
    const buildMock = createMockBuilder((f) => f.helpers.arrayElements([1, 2, 3]));

    const mocked = buildMock();

    expect(mocked).toEqual(mocked);
  });

  it("should allow overriding array mocks", () => {
    const buildMock = createMockBuilder<number[]>((f) => f.helpers.arrayElements([1, 2, 3]));

    expect(buildMock([4, 5, 6])).toEqual([4, 5, 6]);
  });

  it("should allow overriding array mocks with a function", () => {
    const buildMock = createMockBuilder<number[]>((f) => f.helpers.arrayElements([1, 2, 3]));

    expect(buildMock(() => [4, 5, 6])).toEqual([4, 5, 6]);
  });
});
