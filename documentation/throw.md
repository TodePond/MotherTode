# Throw

The `throw` keyword lets you throw an **error** if the term fails to match.

```
match "ribbit"
throw "Expected 'ribbit' but got something else"
```

You can use an error function to make it dynamic.

```
match "ribbit"
throw (input) => `Expected 'ribbit' but got '${input}'`
```

You can use the `error` keyword to throw the default error message.

```
match "ribbit"
throw error
```
