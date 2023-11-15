<div align="center">
  <h1>Mockemon</h1>
  <p>A tiny agnostic mocking utility library, with a strong focus on type safety.</p>
  <hr/>
</div>

[version-badge]: https://img.shields.io/npm/v/mockemon.svg?style=flat-square
[downloads-badge]: https://img.shields.io/npm/dm/mockemon.svg?style=flat-square
[package]: https://www.npmjs.com/package/mockemon
[npmtrends]: http://www.npmtrends.com/mockemon

[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]

## Installation

Install with your favorite package manager.

```sh
npm install mockemon
```

```sh
yarn add mockemon
```

```sh
bun add mockemon
```

## The Mock Builder

The builder utility allows you to create strongly typed mocks for your tests, or anywhere else.

</br>

### Configuration

To use the builder, you must first configure it. This is done by importing and calling `configureMockBuilder`

```ts
import { configureMockBuilder } from "mockemon/builder";
import { faker } from "@faker-js/faker";

const { createMockBuilder } = configureMockBuilder({
  // A value that will be passed as the argument to all mock builders.
  // This is often a faker instance, but can be anything.
  faker: faker,
});
```

</br>

### Usage

Once the builder is configured, you can start creating mock builders.

```ts
const buildPetOwner = createMockBuilder((f) => ({
  name: f.person.firstName(),
  pet: f.animal.cat(),
}));
```

The mock builder will automatically infer the type from the provided mock builder function.

```ts
const petOwner = buildPetOwner();
// { name: string, pet: string }
```

</br>

### Overrides

Passing a value to the builder will override the default value.

```ts
const mock2 = mockBuilder({
  pet: "Daisy" as const,
});
// { name: string, pet: "Daisy" }
```

It's also possible to pass a function to the builder. This function will be called with the provided faker instance, just like when setting up the builder initially.

```ts
const mock3 = mockBuilder((f) => ({
  pet: f.helpes.arrayElement(["Daisy", "Bella", "Luna"] as const]),
}));
// { name: string, pet: "Daisy" | "Bella" | "Luna" }
```

</br>

### Mocking Other Types

The builder can also be used to mock other types of values as well, shich as primitives or arrays.

```ts
// Mocks a string value
const buildName = mockBuilder((f) => f.person.fullName);

const name1 = buildName();
const name2 = buildName("John Doe");
const name3 = buildName((f) => f.person.lastName());
```

```ts
// Mocks an array
const buildNames = mockBuilder((f) => {
  return f.helpers.multiple(() => f.person.fullName());
});

const names1 = buildNames();
const names2 = buildNames(["John Doe", "Jane Doe"]);
const names3 = buildNames((f) => {
  return f.helpers.multiple(() => f.person.lastName());
});
```
