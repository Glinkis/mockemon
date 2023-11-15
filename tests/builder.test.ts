import { describe, expect, it } from "bun:test";
import { configureMockBuilder } from "../src/builder.js";

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

describe("primitives", () => {
  it("allows mocking primitives", () => {
    const buildMock = createMockBuilder((f) => f.name());

    expect(buildMock()).toEqual("Gustavo");
  });

  it("allows overriding primitives", () => {
    const buildMock = createMockBuilder<string | null | undefined>((f) => f.name());

    expect(buildMock("Parrot")).toEqual("Parrot");

    expect(buildMock(null)).toBeNull();

    expect(buildMock(undefined)).toBeUndefined();
  });

  it("allows overriding primitives via a function", () => {
    const buildMock = createMockBuilder<string | null | undefined>((f) => f.name());

    expect(buildMock(() => "Parrot")).toEqual("Parrot");

    expect(buildMock(() => null)).toBeNull();

    expect(buildMock(() => undefined)).toBeUndefined();
  });
});

describe("objects", () => {
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

  it("allows overriding objects", () => {
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

  it("allows overriding objects via a function", () => {
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
});

describe("arrays", () => {
  it("allows mocking arrays", () => {
    const buildMock = createMockBuilder((f) => f.numbers());

    expect(buildMock()).toEqual([1, 2, 3]);
  });

  it("allows overriding arrays", () => {
    const buildMock = createMockBuilder<number[]>((f) => f.numbers());

    expect(buildMock([4, 5, 6])).toEqual([4, 5, 6]);
  });

  it("allows overriding arrays via a function", () => {
    const buildMock = createMockBuilder<number[]>((f) => f.numbers());

    expect(buildMock(() => [4, 5, 6])).toEqual([4, 5, 6]);
  });
});

describe("null", () => {
  it("allows using 'null' as the default value", () => {
    const buildMock = createMockBuilder<null>(() => null);

    expect(buildMock()).toBeNull();
  });
});

describe("undefined", () => {
  it("allows using 'undefined' as the default value", () => {
    const buildMock = createMockBuilder<undefined>(() => undefined);

    expect(buildMock()).toBeUndefined();
  });
});

describe("mixing types", () => {
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
});
