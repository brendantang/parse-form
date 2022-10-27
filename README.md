Handle form data with a functional style.

Write little functions to validate individual fields, then snap them together.

- Use `mapX` to return either a valid object or the first error.

- Use `validateX` to return either a list of validation failures or the valid object.

TODO: How to handle when one field should depend on the value of another?