# Class / Type / Interface Usage Guidelines

This guide outlines the rules for using `class`, `type`, and `interface` consistently across the codebase.

## class

- Used for: DTOs and Entities only
- Validation: `class-validator`
- Purpose:
  - Concrete implementations
  - For complicated objects with methods or transformation logic
  - Suitable for use cases like request validation or persistence

## type

- Validation: `zod`
- Used for: Internal data structures defined within the application domain
- Features:
  - Supports intersection via `type A = B & C`
  - Lightweight and composable

## interface

- Validation: `zod`
- Used for: External data structures such as incoming requests or third-party responses
- Features:
  - Acts as a blueprint for external contracts
  - Supports extension via `interface A extends B`
  - Can be declared multiple times and will be merged
