# Changelog

## v5.5.4

- Updated types.

## v5.5.3

- Updated types.

## v5.5.2

- Improved handling of array overrides.

## v5.5.1

- Updated readme.

## v5.5.0

- Removed index file, and exports builder module directly.

## v4.4.1

- Fixed an incorrect return type.

## v4.4.0

- Improved excess property checks.

## v4.3.0

- Improved override handling between arrays and objects.

## v4.2.7

- Optimized type validation logic.

## v4.2.5

- Improved support for objects with union values.

## v4.2.2

- Updated exports.

## v4.2.1

- Slightly improved readme.

## v4.2.0

- Improved the type inferrence of the override when the original type is a union.

## v4.1.2

- Further improved the final result type when passing overrides.

## v4.1.0

- Improved the final result type when passing overrides.

## v4.0.0

- Removed the mock server API. [MSW](https://mswjs.io/) is a better alternative for this use case now that it supports intercepting backend requests.

## v3.1.0

- Added an alpha version of `configureMockServer`.
- Added `configureMockServer` to the readme.

## v3.0.0

- Renamed the `faker` option to `context`, as it can be any value.

## v2.0.3

- Disabled bundling in build.

## v2.0.2

- Updated package exports to include more import options.
- Export `configureMockBuilder` from from root.
- Updated readme to include more examples.

## v2.0.1

- Updated package exports to include more import options.

## v2.0.0

### Breaking

- `configureMockBuilder` now returns a function directly, instead of an object.
