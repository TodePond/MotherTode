# Select

You can **select** which terms to pass into the emit function with the `@` symbol.

```
match "greet " @Name
emit (name) => `Hello ${name}!`

let Name = /[a-zA-Z]/+
```
