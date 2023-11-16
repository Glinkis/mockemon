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

it("can mock primitives", () => {
  const buildMock = createMockBuilder((f) => f.name());

  expect(buildMock()).toEqual("Gustavo");
});

it("can mock objects", () => {
  const buildMock = createMockBuilder<PetOwner>((f) => ({
    name: f.name(),
    pet: f.pet(),
  }));

  expect(buildMock()).toEqual({
    name: "Gustavo",
    pet: "Dog",
  });
});

it("can mock arrays", () => {
  const buildMock = createMockBuilder((f) => f.numbers());

  expect(buildMock()).toEqual([1, 2, 3]);
});

it("can mock 'null'", () => {
  const buildMock = createMockBuilder<null>(() => null);

  expect(buildMock()).toBeNull();
});

it("can mock 'undefined'", () => {
  const buildMock = createMockBuilder<undefined>(() => undefined);

  expect(buildMock()).toBeUndefined();
});

it("can override primitives", () => {
  const buildMock = createMockBuilder<string | null | undefined>((f) => f.name());

  expect(buildMock("Parrot")).toEqual("Parrot");
  expect(buildMock(() => "Parrot")).toEqual("Parrot");
});

it("can override primitives with objects", () => {
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

it("can override primitives with 'null'", () => {
  const buildMock = createMockBuilder<string | null>((f) => f.name());

  expect(buildMock(null)).toBeNull();
  expect(buildMock(() => null)).toBeNull();
});

it("can override primitives with 'undefined'", () => {
  const buildMock = createMockBuilder<string | undefined>((f) => f.name());

  expect(buildMock(undefined)).toBeUndefined();
  expect(buildMock(() => undefined)).toBeUndefined();
});

it("can override objects", () => {
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

it("can override objects with primitives", () => {
  const buildMock = createMockBuilder<string | PetOwner>((f) => ({
    name: f.name(),
    pet: f.pet(),
  }));

  expect(buildMock("Rafael")).toEqual("Rafael");
  expect(buildMock(() => "Rafael")).toEqual("Rafael");
});

it("can override objects with 'null'", () => {
  const buildMock = createMockBuilder<PetOwner | null>((f) => ({
    name: f.name(),
    pet: f.pet(),
  }));

  expect(buildMock(null)).toBeNull();
  expect(buildMock(() => null)).toBeNull();
});

it("can override objects with 'undefined'", () => {
  const buildMock = createMockBuilder<PetOwner | undefined>((f) => ({
    name: f.name(),
    pet: f.pet(),
  }));

  expect(buildMock(undefined)).toBeUndefined();
  expect(buildMock(() => undefined)).toBeUndefined();
});

it("can override arrays", () => {
  const buildMock = createMockBuilder<number[]>((f) => f.numbers());

  expect(buildMock([4, 5, 6])).toEqual([4, 5, 6]);
  expect(buildMock(() => [4, 5, 6])).toEqual([4, 5, 6]);
});

it("can override arrays with primitives", () => {
  const buildMock = createMockBuilder<number[] | string>((f) => f.numbers());

  expect(buildMock("Rafael")).toEqual("Rafael");
  expect(buildMock(() => "Rafael")).toEqual("Rafael");
});

it("can override arrays with 'null'", () => {
  const buildMock = createMockBuilder<number[] | null>((f) => f.numbers());

  expect(buildMock(null)).toBeNull();
  expect(buildMock(() => null)).toBeNull();
});

it("can override arrays with 'undefined'", () => {
  const buildMock = createMockBuilder<number[] | undefined>((f) => f.numbers());

  expect(buildMock(undefined)).toBeUndefined();
  expect(buildMock(() => undefined)).toBeUndefined();
});

it("can override 'null'", () => {
  const buildMock = createMockBuilder<null>(() => null);

  expect(buildMock(null)).toBeNull();
  expect(buildMock(() => null)).toBeNull();
});

it("can override 'undefined'", () => {
  const buildMock = createMockBuilder<undefined>(() => undefined);

  expect(buildMock(undefined)).toBeUndefined();
  expect(buildMock(() => undefined)).toBeUndefined();
});

it("can override 'null' with primitives", () => {
  const buildMock = createMockBuilder<null | string>(() => null);

  expect(buildMock("Rafael")).toEqual("Rafael");
  expect(buildMock(() => "Rafael")).toEqual("Rafael");
});

it("can override 'null' with objects", () => {
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

it("can override 'null' with arrays", () => {
  const buildMock = createMockBuilder<null | number[]>(() => null);

  expect(buildMock([4, 5, 6])).toEqual([4, 5, 6]);
  expect(buildMock(() => [4, 5, 6])).toEqual([4, 5, 6]);
});

it("can override 'undefined' with primitives", () => {
  const buildMock = createMockBuilder<undefined | string>(() => undefined);

  expect(buildMock("Rafael")).toEqual("Rafael");
  expect(buildMock(() => "Rafael")).toEqual("Rafael");
});

it("can override 'undefined' with objects", () => {
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

it("can override 'undefined' with arrays", () => {
  const buildMock = createMockBuilder<undefined | number[]>(() => undefined);

  expect(buildMock([4, 5, 6])).toEqual([4, 5, 6]);
  expect(buildMock(() => [4, 5, 6])).toEqual([4, 5, 6]);
});

it("can override 'null' with 'undefined'", () => {
  const buildMock = createMockBuilder<null | undefined>(() => null);

  expect(buildMock(undefined)).toBeUndefined();
  expect(buildMock(() => undefined)).toBeUndefined();
});

it("can override 'undefined' with 'null'", () => {
  const buildMock = createMockBuilder<null | undefined>(() => undefined);

  expect(buildMock(null)).toBeNull();
  expect(buildMock(() => null)).toBeNull();
});
