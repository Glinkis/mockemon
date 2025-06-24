import { expect, it, describe } from "bun:test";
import { expectTypeOf } from "expect-type";
import { configureMockBuilder } from "../src/builder.js";

interface PetOwner {
  name: string;
  pet: string;
}

const createMockBuilder = configureMockBuilder({
  context: {
    name: (): string => "Gustavo",
    pet: (): string => "Dog",
    numbers: () => [1, 2, 3],
  },
});

it("can mock primitives", () => {
  const buildMock = createMockBuilder((f) => f.name());

  const mock = buildMock();

  expect(mock).toEqual("Gustavo");

  expectTypeOf(mock).toEqualTypeOf<string>();
});

it("can mock objects", () => {
  const buildMock = createMockBuilder(
    (f): PetOwner => ({
      name: f.name(),
      pet: f.pet(),
    }),
  );

  const mock = buildMock();

  expect(mock).toEqual({
    name: "Gustavo",
    pet: "Dog",
  });

  expectTypeOf(mock).toEqualTypeOf<PetOwner>();
});

it("can mock arrays", () => {
  const buildMock = createMockBuilder((f) => f.numbers());

  const mock = buildMock();

  expect(mock).toEqual([1, 2, 3]);

  expectTypeOf(mock).toEqualTypeOf<number[]>();
});

it("can mock 'null'", () => {
  const buildMock = createMockBuilder((): null => null);

  const mock = buildMock();

  expect(mock).toBeNull();

  expectTypeOf(mock).toEqualTypeOf<null>();
});

it("can mock 'undefined'", () => {
  const buildMock = createMockBuilder((): undefined => undefined);

  const mock = buildMock();

  expect(mock).toBeUndefined();

  expectTypeOf(mock).toEqualTypeOf<undefined>();
});

it("can override primitives", () => {
  const buildMock = createMockBuilder((f): string | null | undefined => f.name());

  const mock1 = buildMock("Parrot");
  const mock2 = buildMock(() => "Parrot");

  expect(mock1).toEqual("Parrot");
  expect(mock2).toEqual("Parrot");

  expectTypeOf(mock1).toEqualTypeOf<"Parrot">();
  expectTypeOf(mock2).toEqualTypeOf<"Parrot">();
});

it("can override primitives with objects", () => {
  const buildMock = createMockBuilder((f): string | PetOwner => f.name());

  const mock1 = buildMock({ name: "Rafael", pet: "Cat" });
  const mock2 = buildMock(() => ({ name: "Rafael", pet: "Cat" }));

  expect(mock1).toEqual({
    name: "Rafael",
    pet: "Cat",
  });
  expect(mock2).toEqual({
    name: "Rafael",
    pet: "Cat",
  });

  expectTypeOf(mock1).toEqualTypeOf<PetOwner>();
  expectTypeOf(mock2).toEqualTypeOf<PetOwner>();
});

it("can override primitives with 'null'", () => {
  const buildMock = createMockBuilder((f): string | null => f.name());

  const mock1 = buildMock(null);
  const mock2 = buildMock(() => null);

  expect(mock1).toBeNull();
  expect(mock2).toBeNull();

  expectTypeOf(mock1).toEqualTypeOf<null>();
  expectTypeOf(mock2).toEqualTypeOf<null>();
});

it("can override primitives with 'undefined'", () => {
  const buildMock = createMockBuilder((f): string | undefined => f.name());

  const mock1 = buildMock(undefined);
  const mock2 = buildMock(() => undefined);

  expect(mock1).toBeUndefined();
  expect(mock2).toBeUndefined();

  expectTypeOf(mock1).toEqualTypeOf<undefined>();
  expectTypeOf(mock2).toEqualTypeOf<undefined>();
});

it("can override objects", () => {
  const buildMock = createMockBuilder(
    (f): PetOwner => ({
      name: f.name(),
      pet: f.pet(),
    }),
  );

  const mock1 = buildMock({ name: "Rafael" });
  const mock2 = buildMock(() => ({ pet: "Parrot" }));

  expect(mock1).toEqual({
    name: "Rafael",
    pet: "Dog",
  });
  expect(mock2).toEqual({
    name: "Gustavo",
    pet: "Parrot",
  });

  expectTypeOf(mock1).toEqualTypeOf<PetOwner>();
  expectTypeOf(mock2).toEqualTypeOf<PetOwner>();
});

it("can override objects with union values", () => {
  type Message = {
    type: "A" | "B" | "C";
    brand: "X" | "Y" | "Z";
  };

  const buildMock = createMockBuilder(
    (): Message => ({
      type: "A",
      brand: "X",
    }),
  );

  const mock1 = buildMock({
    type: "B",
  });
  const mock2 = buildMock(() => ({
    brand: "X",
  }));

  expect(mock1).toEqual({
    type: "B",
    brand: "X",
  });
  expect(mock2).toEqual({
    type: "A",
    brand: "X",
  });

  expectTypeOf(mock1).toEqualTypeOf<Message & { type: "B" }>();
  expectTypeOf(mock2).toEqualTypeOf<Message & { brand: "X" }>();
});

it("can override objects with computed keys", () => {
  const buildMock = createMockBuilder(
    (f): PetOwner => ({
      name: f.name(),
      pet: f.pet(),
    }),
  );

  for (const key of ["name", "pet"] as const) {
    const mock1 = buildMock<Partial<PetOwner>>({
      [key]: "Bob",
    });

    const mock2 = buildMock<Partial<PetOwner>>(() => ({
      [key]: "Bob",
    }));

    expectTypeOf(mock1).toMatchTypeOf<PetOwner>();
    expectTypeOf(mock2).toEqualTypeOf<PetOwner>();
  }
});

it("can override objects with primitives", () => {
  const buildMock = createMockBuilder((f): string | PetOwner => ({
    name: f.name(),
    pet: f.pet(),
  }));

  const mock1 = buildMock("Rafael");
  const mock2 = buildMock(() => "Rafael");

  expect(mock1).toEqual("Rafael");
  expect(mock2).toEqual("Rafael");

  expectTypeOf(mock1).toEqualTypeOf<"Rafael">();
  expectTypeOf(mock2).toEqualTypeOf<"Rafael">();
});

it("can override objects with 'null'", () => {
  const buildMock = createMockBuilder((f): PetOwner | null => ({
    name: f.name(),
    pet: f.pet(),
  }));

  const mock1 = buildMock(null);
  const mock2 = buildMock(() => null);

  expect(mock1).toBeNull();
  expect(mock2).toBeNull();

  expectTypeOf(mock1).toEqualTypeOf<null>();
  expectTypeOf(mock2).toEqualTypeOf<null>();
});

it("can override objects with 'undefined'", () => {
  const buildMock = createMockBuilder((f): PetOwner | undefined => ({
    name: f.name(),
    pet: f.pet(),
  }));

  const mock1 = buildMock(undefined);
  const mock2 = buildMock(() => undefined);

  expect(mock1).toBeUndefined();
  expect(mock2).toBeUndefined();

  expectTypeOf(mock1).toEqualTypeOf<undefined>();
  expectTypeOf(mock2).toEqualTypeOf<undefined>();
});

it("can override objects with arrays", () => {
  const buildMock = createMockBuilder((f): PetOwner | number[] => ({
    name: f.name(),
    pet: f.pet(),
  }));

  const mock1 = buildMock([4, 5, 6]);
  const mock2 = buildMock(() => [4, 5, 6]);

  expect(mock1).toEqual([4, 5, 6]);
  expect(mock2).toEqual([4, 5, 6]);
});

it("can override arrays", () => {
  const buildMock = createMockBuilder((f): number[] => f.numbers());

  const mock1 = buildMock([4, 5, 6]);
  const mock2 = buildMock(() => [4, 5, 6]);

  expect(mock1).toEqual([4, 5, 6]);
  expect(mock2).toEqual([4, 5, 6]);

  expectTypeOf(mock1).toEqualTypeOf<number[]>();
  expectTypeOf(mock2).toEqualTypeOf<number[]>();
});

it("can override arrays with primitives", () => {
  const buildMock = createMockBuilder((f): number[] | string => f.numbers());

  const mock1 = buildMock("Rafael");
  const mock2 = buildMock(() => "Rafael");

  expect(mock1).toEqual("Rafael");
  expect(mock2).toEqual("Rafael");

  expectTypeOf(mock1).toEqualTypeOf<"Rafael">();
  expectTypeOf(mock2).toEqualTypeOf<"Rafael">();
});

it("can override arrays with 'null'", () => {
  const buildMock = createMockBuilder((f): number[] | null => f.numbers());

  const mock1 = buildMock(null);
  const mock2 = buildMock(() => null);

  expect(mock1).toBeNull();
  expect(mock2).toBeNull();

  expectTypeOf(mock1).toEqualTypeOf<null>();
  expectTypeOf(mock2).toEqualTypeOf<null>();
});

it("can override arrays with 'undefined'", () => {
  const buildMock = createMockBuilder((f): number[] | undefined => f.numbers());

  const mock1 = buildMock(undefined);
  const mock2 = buildMock(() => undefined);

  expect(mock1).toBeUndefined();
  expect(mock2).toBeUndefined();

  expectTypeOf(mock1).toEqualTypeOf<undefined>();
  expectTypeOf(mock2).toEqualTypeOf<undefined>();
});

it("can override arrays with objects", () => {
  const buildMock = createMockBuilder((f): number[] | PetOwner => f.numbers());

  const mock1 = buildMock({ name: "Rafael", pet: "Cat" });
  const mock2 = buildMock(() => ({ name: "Rafael", pet: "Cat" }));

  expect(mock1).toEqual({
    name: "Rafael",
    pet: "Cat",
  });

  expect(mock2).toEqual({
    name: "Rafael",
    pet: "Cat",
  });
});

it("can override 'null'", () => {
  const buildMock = createMockBuilder((): null => null);

  const mock1 = buildMock(null);
  const mock2 = buildMock(() => null);

  expect(mock1).toBeNull();
  expect(mock2).toBeNull();

  expectTypeOf(mock1).toEqualTypeOf<null>();
  expectTypeOf(mock2).toEqualTypeOf<null>();
});

it("can override 'undefined'", () => {
  const buildMock = createMockBuilder((): undefined => undefined);

  const mock1 = buildMock(undefined);
  const mock2 = buildMock(() => undefined);

  expect(mock1).toBeUndefined();
  expect(mock2).toBeUndefined();

  expectTypeOf(mock1).toEqualTypeOf<undefined>();
  expectTypeOf(mock2).toEqualTypeOf<undefined>();
});

it("can override 'null' with primitives", () => {
  const buildMock = createMockBuilder((): null | string => null);

  const mock1 = buildMock("Rafael");
  const mock2 = buildMock(() => "Rafael");

  expect(mock1).toEqual("Rafael");
  expect(mock2).toEqual("Rafael");

  expectTypeOf(mock1).toEqualTypeOf<"Rafael">();
  expectTypeOf(mock2).toEqualTypeOf<"Rafael">();
});

it("can override 'null' with objects", () => {
  const buildMock = createMockBuilder((): null | PetOwner => null);

  const mock1 = buildMock({ name: "Rafael", pet: "Cat" });
  const mock2 = buildMock(() => ({ name: "Rafael", pet: "Cat" }));

  expect(mock1).toEqual({
    name: "Rafael",
    pet: "Cat",
  });
  expect(mock2).toEqual({
    name: "Rafael",
    pet: "Cat",
  });

  expectTypeOf(mock1).toEqualTypeOf<PetOwner>();
  expectTypeOf(mock2).toEqualTypeOf<PetOwner>();
});

it("can override 'null' with arrays", () => {
  const buildMock = createMockBuilder((): null | number[] => null);

  const mock1 = buildMock([4, 5, 6]);
  const mock2 = buildMock(() => [4, 5, 6]);

  expect(mock1).toEqual([4, 5, 6]);
  expect(mock2).toEqual([4, 5, 6]);

  expectTypeOf(mock1).toEqualTypeOf<number[]>();
  expectTypeOf(mock2).toEqualTypeOf<number[]>();
});

it("can override 'undefined' with primitives", () => {
  const buildMock = createMockBuilder((): undefined | string => undefined);

  const mock1 = buildMock("Rafael");
  const mock2 = buildMock(() => "Rafael");

  expect(mock1).toEqual("Rafael");
  expect(mock2).toEqual("Rafael");

  expectTypeOf(mock1).toEqualTypeOf<"Rafael">();
  expectTypeOf(mock2).toEqualTypeOf<"Rafael">();
});

it("can override 'undefined' with objects", () => {
  const buildMock = createMockBuilder((): undefined | PetOwner => undefined);

  const mock1 = buildMock({ name: "Rafael", pet: "Cat" });
  const mock2 = buildMock(() => ({ name: "Rafael", pet: "Cat" }));

  expect(mock1).toEqual({
    name: "Rafael",
    pet: "Cat",
  });
  expect(mock2).toEqual({
    name: "Rafael",
    pet: "Cat",
  });

  expectTypeOf(mock1).toEqualTypeOf<PetOwner>();
  expectTypeOf(mock2).toEqualTypeOf<PetOwner>();
});

it("can override 'undefined' with arrays", () => {
  const buildMock = createMockBuilder((): undefined | number[] => undefined);

  const mock1 = buildMock([4, 5, 6]);
  const mock2 = buildMock(() => [4, 5, 6]);

  expect(mock1).toEqual([4, 5, 6]);
  expect(mock2).toEqual([4, 5, 6]);

  expectTypeOf(mock1).toEqualTypeOf<number[]>();
  expectTypeOf(mock2).toEqualTypeOf<number[]>();
});

it("can override 'null' with 'undefined'", () => {
  const buildMock = createMockBuilder((): null | undefined => null);

  const mock1 = buildMock(undefined);
  const mock2 = buildMock(() => undefined);

  expect(mock1).toBeUndefined();
  expect(mock2).toBeUndefined();

  expectTypeOf(mock1).toEqualTypeOf<undefined>();
  expectTypeOf(mock2).toEqualTypeOf<undefined>();
});

it("can override 'undefined' with 'null'", () => {
  const buildMock = createMockBuilder((): null | undefined => undefined);

  const mock1 = buildMock(null);
  const mock2 = buildMock(() => null);

  expect(mock1).toBeNull();
  expect(mock2).toBeNull();

  expectTypeOf(mock1).toEqualTypeOf<null>();
  expectTypeOf(mock2).toEqualTypeOf<null>();
});

describe("validation", () => {
  it("should warn if passing an incomplete override when using incompatible types", () => {
    type Shape1 = { a: string; b: string };
    const build1 = createMockBuilder((): Shape1 | null => null);

    // @ts-expect-error - Missing 'b' property.
    build1({ a: "a" });
    // @ts-expect-error - Missing 'a' property.
    build1(() => ({ b: "b" }));

    type Shape2 = { c: string };
    const build2 = createMockBuilder((): Shape1 | Shape2 => ({ c: "c" }));

    // @ts-expect-error - Missing 'b' property.
    build2({ a: "a" });
    // @ts-expect-error - Missing 'a' property.
    build2(() => ({ b: "b" }));

    type Tuple2 = [number, number];
    const build3 = createMockBuilder((): Tuple2 | null => null);

    // @ts-expect-error - Missing second element.
    build3([1]);
    // @ts-expect-error - Missing first element.
    build3(() => [, 1]);
  });
});
