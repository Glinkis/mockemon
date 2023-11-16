import { expect, it } from "bun:test";
import { configureMockBuilder } from "../src/builder.js";

interface PetOwner {
  name: string;
  pet: string;
}

const createMockBuilder = configureMockBuilder({
  context: {
    name: () => "Gustavo",
    pet: () => "Dog",
    numbers: () => [1, 2, 3],
  },
});

it("allows mocking primitives", () => {
  const buildMock = createMockBuilder((f) => f.name());

  expect(buildMock()).toEqual("Gustavo");
});

it("allows mocking objects", () => {
  const buildMock = createMockBuilder<PetOwner>((f) => ({
    name: f.name(),
    pet: f.pet(),
  }));

  expect(buildMock()).toEqual({
    name: "Gustavo",
    pet: "Dog",
  });
});

it("allows mocking arrays", () => {
  const buildMock = createMockBuilder((f) => f.numbers());

  expect(buildMock()).toEqual([1, 2, 3]);
});

it("allows mocking 'null'", () => {
  const buildMock = createMockBuilder<null>(() => null);

  expect(buildMock()).toBeNull();
});

it("allows mocking 'undefined'", () => {
  const buildMock = createMockBuilder<undefined>(() => undefined);

  expect(buildMock()).toBeUndefined();
});

it("allows overriding primitives", () => {
  const buildMock = createMockBuilder<string | null | undefined>((f) => f.name());

  expect(buildMock("Parrot")).toEqual("Parrot");
  expect(buildMock(() => "Parrot")).toEqual("Parrot");
});

it("allows overriding primitives with objects", () => {
  const buildMock = createMockBuilder<string | PetOwner>((f) => f.name());

  expect(buildMock({ name: "Rafael", pet: "Cat" })).toEqual({
    name: "Rafael",
    pet: "Cat",
  });

  expect(buildMock(() => ({ name: "Rafael", pet: "Cat" }))).toEqual({
    name: "Rafael",
    pet: "Cat",
  });
});

it("allows overriding primitives with 'null'", () => {
  const buildMock = createMockBuilder<string | null>((f) => f.name());

  expect(buildMock(null)).toBeNull();
  expect(buildMock(() => null)).toBeNull();
});

it("allows overriding primitives with 'undefined'", () => {
  const buildMock = createMockBuilder<string | undefined>((f) => f.name());

  expect(buildMock(undefined)).toBeUndefined();
  expect(buildMock(() => undefined)).toBeUndefined();
});

it("allows overriding objects", () => {
  const buildMock = createMockBuilder<PetOwner>((f) => ({
    name: f.name(),
    pet: f.pet(),
  }));

  expect(buildMock({ name: "Rafael" })).toEqual({
    name: "Rafael",
    pet: "Dog",
  });

  expect(buildMock(() => ({ pet: "Parrot" }))).toEqual({
    name: "Gustavo",
    pet: "Parrot",
  });
});

it("allows overriding objects with primitives", () => {
  const buildMock = createMockBuilder<string | PetOwner>((f) => ({
    name: f.name(),
    pet: f.pet(),
  }));

  expect(buildMock("Rafael")).toEqual("Rafael");
  expect(buildMock(() => "Rafael")).toEqual("Rafael");
});

it("allows overriding objects with 'null'", () => {
  const buildMock = createMockBuilder<PetOwner | null>((f) => ({
    name: f.name(),
    pet: f.pet(),
  }));

  expect(buildMock(null)).toBeNull();
  expect(buildMock(() => null)).toBeNull();
});

it("allows overriding objects with 'undefined'", () => {
  const buildMock = createMockBuilder<PetOwner | undefined>((f) => ({
    name: f.name(),
    pet: f.pet(),
  }));

  expect(buildMock(undefined)).toBeUndefined();
  expect(buildMock(() => undefined)).toBeUndefined();
});

it("allows overriding arrays", () => {
  const buildMock = createMockBuilder<number[]>((f) => f.numbers());

  expect(buildMock([4, 5, 6])).toEqual([4, 5, 6]);
  expect(buildMock(() => [4, 5, 6])).toEqual([4, 5, 6]);
});

it("allows overriding arrays with primitives", () => {
  const buildMock = createMockBuilder<number[] | string>((f) => f.numbers());

  expect(buildMock("Rafael")).toEqual("Rafael");
  expect(buildMock(() => "Rafael")).toEqual("Rafael");
});

it("allows overriding arrays with 'null'", () => {
  const buildMock = createMockBuilder<number[] | null>((f) => f.numbers());

  expect(buildMock(null)).toBeNull();
  expect(buildMock(() => null)).toBeNull();
});

it("allows overriding arrays with 'undefined'", () => {
  const buildMock = createMockBuilder<number[] | undefined>((f) => f.numbers());

  expect(buildMock(undefined)).toBeUndefined();
  expect(buildMock(() => undefined)).toBeUndefined();
});

it("allows overriding 'null'", () => {
  const buildMock = createMockBuilder<null>(() => null);

  expect(buildMock(null)).toBeNull();
  expect(buildMock(() => null)).toBeNull();
});

it("allows overriding 'undefined'", () => {
  const buildMock = createMockBuilder<undefined>(() => undefined);

  expect(buildMock(undefined)).toBeUndefined();
  expect(buildMock(() => undefined)).toBeUndefined();
});

it("allows overriding 'null' with primitives", () => {
  const buildMock = createMockBuilder<null | string>(() => null);

  expect(buildMock("Rafael")).toEqual("Rafael");
  expect(buildMock(() => "Rafael")).toEqual("Rafael");
});

it("allows overriding 'null' with objects", () => {
  const buildMock = createMockBuilder<null | PetOwner>(() => null);

  expect(buildMock({ name: "Rafael", pet: "Cat" })).toEqual({
    name: "Rafael",
    pet: "Cat",
  });

  expect(buildMock(() => ({ name: "Rafael", pet: "Cat" }))).toEqual({
    name: "Rafael",
    pet: "Cat",
  });
});

it("allows overriding 'null' with arrays", () => {
  const buildMock = createMockBuilder<null | number[]>(() => null);

  expect(buildMock([4, 5, 6])).toEqual([4, 5, 6]);
  expect(buildMock(() => [4, 5, 6])).toEqual([4, 5, 6]);
});

it("allows overriding 'undefined' with primitives", () => {
  const buildMock = createMockBuilder<undefined | string>(() => undefined);

  expect(buildMock("Rafael")).toEqual("Rafael");
  expect(buildMock(() => "Rafael")).toEqual("Rafael");
});

it("allows overriding 'undefined' with objects", () => {
  const buildMock = createMockBuilder<undefined | PetOwner>(() => undefined);

  expect(buildMock({ name: "Rafael", pet: "Cat" })).toEqual({
    name: "Rafael",
    pet: "Cat",
  });

  expect(buildMock(() => ({ name: "Rafael", pet: "Cat" }))).toEqual({
    name: "Rafael",
    pet: "Cat",
  });
});

it("allows overriding 'undefined' with arrays", () => {
  const buildMock = createMockBuilder<undefined | number[]>(() => undefined);

  expect(buildMock([4, 5, 6])).toEqual([4, 5, 6]);
  expect(buildMock(() => [4, 5, 6])).toEqual([4, 5, 6]);
});

it("allows overriding 'null' with 'undefined'", () => {
  const buildMock = createMockBuilder<null | undefined>(() => null);

  expect(buildMock(undefined)).toBeUndefined();
  expect(buildMock(() => undefined)).toBeUndefined();
});

it("allows overriding 'undefined' with 'null'", () => {
  const buildMock = createMockBuilder<null | undefined>(() => undefined);

  expect(buildMock(null)).toBeNull();
  expect(buildMock(() => null)).toBeNull();
});
