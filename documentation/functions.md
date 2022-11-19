# Functions

You can make a **function** by writing some parameters before a custom term.

```
<indent> => indent "ribbit"
```

You can call the function by passing arguments to it.\
An argument can be a **term**.

```
match Line("    ")

let Line = <indent> => indent "ribbit"
```

An argument can be a **javascript value**.

```
match MultipleOf<3>
emit "Fizz"

let MultipleOf = <number> => {
    match /[0-9]/+
    check (multiple) => multiple % number === 0
}
```
