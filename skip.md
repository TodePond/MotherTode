# Skip

The `skip` keyword lets you **skip** stuff between each term.

This language allows for whitespace in between each term.

```
match "greet" Name
skip Whitespace

let Whitespace = { " " | "    " | "\n" }
let Name = /[a-zA-Z]/+
```
