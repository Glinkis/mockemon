# mockemon

## A mocking utility library

[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]

### Installation

```sh
npm install mockemon
# or
yarn add mockemon
# or
pnpm add mockemon
# or
bun add mockemon
```

### The Mock Builder

The mock builder is a utility that allows you to create strongly typed mocks for your tests.

```ts
import { configureMockBuilder } from "mockemon/builder";
import { faker } from "@faker-js/faker";

const { createMockBuilder } = configureMockBuilder({
  // A value that will be passed as the argument to all mock builders.
  // This is usually a faker instance, but can be anything.
  faker: faker,
});

// Create a basic mock builder.
const mockBuilder = createMockBuilder((f) => ({
  name: f.person.firstName(),
  pet: f.animal.cat(),
}));
```

The mock builder will infer the type of the return value from the
return value of the function passed to it.

```ts
const mock1 = mockBuilder();
// { name: string, pet: string }
```

Passing a value to the mock builder will override the default value.

```ts
const mock2 = mockBuilder({
  pet: "Daisy" as const,
});
// { name: string, pet: "Daisy" }
```

You can also pass a function, which will be called with the provided "faker" instance.

```ts
const mock3 = mockBuilder((f) => ({
  name: f.helpers.arrayElement(["John", "Jane"] as const),
}));
// { name: "John" | "Jane", pet: string }
```

#### Primitive Values

You can also create builders for primitive values.

```ts
const mockBuilder = createMockBuilder((f) => f.helpers.random.number());

const mock1 = mockBuilder();
// number

const mock2 = mockBuilder(5);
// 5
```

[version-badge]: https://img.shields.io/npm/v/mockemon.svg?style=flat-square
[downloads-badge]: https://img.shields.io/npm/dm/mockemon.svg?style=flat-square
[package]: https://www.npmjs.com/package/mockemon
[npmtrends]: http://www.npmtrends.com/mockemon
