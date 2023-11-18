<div align="center">
  <h1>Mockemon  🏗️</h1>

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

<hr/>

## The Mock Builder

The builder utility allows you to create strongly typed mocks for your tests, or anywhere else.

### Configuration

To use the builder, you must first configure it. This is done by importing and calling `configureMockBuilder`

```ts
import { configureMockBuilder } from "mockemon/builder";
import { faker } from "@faker-js/faker";

const createMockBuilder = configureMockBuilder({
  // A value that will be passed as the argument to all mock builders.
  // This is often a faker instance, but can be anything.
  context: faker,
});
```

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

### Overrides

Passing a value to the builder will override the default value.

```ts
const petOwner = buildPetOwner({
  pet: "Daisy" as const,
});
// { name: string, pet: "Daisy" }
```

It's also possible to pass a function to the builder. This function will be called with the provided faker instance, just like when setting up the builder initially.

```ts
const petOwner = buildPetOwner((f) => ({
  pet: f.helpes.arrayElement(["Daisy", "Bella", "Luna"] as const]),
}));
// { name: string, pet: "Daisy" | "Bella" | "Luna" }
```

### Mocking Other Types

The builder can also be used to mock other types of values as well, shich as primitives or arrays.

```ts
// Mocks a string value
const buildName = createMockBuilder((f) => f.person.fullName);

const name1 = buildName();
const name2 = buildName("John Doe");
const name3 = buildName((f) => f.person.lastName());
```

```ts
// Mocks an array
const buildNames = createMockBuilder((f) => {
  return f.helpers.multiple(() => f.person.fullName());
});

const names1 = buildNames();
const names2 = buildNames(["John Doe", "Jane Doe"]);
const names3 = buildNames((f) => {
  return f.helpers.multiple(() => f.person.lastName());
});
```

### Advanced Patterns

#### Combining Builders

If you have a value that that is a superset of another, you can reuse the builder of the subset in the builder of the superset by simply spreading it. Since the builder is a function, the values will still be generated at the time of the call.

```ts
interface Person {
  name: string;
  age: number;
}

const buildPerson = createMockBuilder(
  (f): Person => ({
    name: f.person.firstName(),
    age: f.random.number(),
  }),
);

interface PetOwner extends Person {
  pet: string;
}

const buildPetOwner = createMockBuilder(buildPerson
  (f): PetOwner => ({
    ...buildPerson(),
    pet: f.animal.cat(),
  }),
);
```

```ts
const buildCatNames = createMockBuilder((f) => {
  return f.helpers.shuffle(["Daisy", "Bella", "Luna"]);
});

const buildDogNames = createMockBuilder((f) => {
  return f.helpers.shuffle(["Max", "Charlie", "Cooper"]);
});

const buildPets = createMockBuilder((f) => {
  return f.helpers.shuffle([...buildCatNames(), ...buildDogNames()]);
});
```

<hr/>

## The Mock Server

This utility provides an easy way for creating and interacting with a local mock server.

### Configuration

To use the mock server, you must first configure it. This is done by importing and calling `configureMockServer`

```ts
import { configureMockServer } from "mockemon/server";

// The payload type is used to define the shape of the data that will be sent to the server. This can be any shape, since you have full control over how you use it. We'll see this further down.
type Payload = {
  path: string;
  method: string;
  params: Record<string, string>;
  body: unknown;
};

// Since a single server will handle both the "real" requests that we want to serve our mocks to as well as the requests that facilitates the mocking, we need to be able to distinguish between the two.
export const mockServer = configureMockServer<Payload>({
  realApiUrl: "/api", // <- This is where your application will make regular requests.
  mockApiUrl: "/mocks",
});
```

### Server

Then configure a server with the mock handlers. This should be compatible with any server setup.
For this example, we will use express.

```ts
import express from "express";
import { mockServer } from "./mock-server";

const server = mockServer.server();
const app = express();

app.all(server.realApiUrl + "*", (req, res) => {
  const result = server.resolveRealApiRequest({
    url: req.originalUrl,
    getKey: (path) => `${req.method} ${path}`,
  });
  res.json(result);
});

app.all(server.mockApiUrl + "*", (req, res) => {
  const result = server.resolveMockApiRequest({
    url: req.originalUrl,
    getKey: (payload) => `${payload.method} ${payload.path}`,
    getValue: (payload) => payload.body,
  });
  res.json(result);
});

app.listen(4000);
```

That's it for the server!

### Client

Now let's look at how create the client part.

```ts
import { mockServer } from "./mock-server";

export const client = mockServer.client({
  // This should be the address of the server we just created.
  address: "http://localhost:4000",
  // We also need to provide how to send requests.
  request({ url, method }) {
    // We're using fetch here, but any way to make a request will work,
    // as long as it supprts passing a method and a url.
    const response = await fetch(url, {
      method,
    });
    return response.json();
  },
});
```

Now we can start creating mocks.

```ts
import { client } from "./client";

// Since we've already provided the shape of the payload in the initial configuration, we get some nice intellisense here.
client.set({
  path: "/animals/cat",
  method: "GET",
  body: {
    name: "Luna",
    breed: "British Shorthair",
  },
});
```

Making a regular request now responds with the mocked data!

```ts
const cat = await fetch("http://localhost:4000/api/animals/cat").then((res) => res.json());

console.log(cat);
// { name: "Luna", breed: "Brithish Shorthair" }
```
