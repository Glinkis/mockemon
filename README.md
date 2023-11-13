# mockemon

## A mocking utility library

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
  name: f.name.findName(),
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
