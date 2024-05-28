# Changelog

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
