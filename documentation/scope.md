# Scope

Terms that are defined in the same **scope** can be referenced by each other.\
Value can reference Number because they are defined in the same scope.

```
let Value = Number
let Number = /[0-9]/+
```

Terms can be defined within the scope of another term, keeping it **private**.\
Value can reference Number because it is defined inside its scope.

```
let Value = {
    match Number
    let Number = /[0-9]/+
}
```

You can also reference terms in your **javascript**.\
Terms are functions that take one argument - an input string.

```
emit ToUpperCase

let ToUpperCase = {
    match /[a-zA-Z]/+
    emit (value) => value.toUpperCase()
}
```
