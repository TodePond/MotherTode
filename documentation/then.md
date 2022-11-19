# Then

The `then` keyword adds an extra **step** to a term.

This languages matches any Name, and then checks that it matches any Friend.&#x20;

```
match Name
then Friend

let Name = /[a-zA-Z]/+
let Friend = "Bob" | "Kevin"
```

You can chain together different **emit** steps too.\
This language converts an input to upper case and then shouts hello to it.

```
match Input
then UpperCase

let Input = {
    match /[a-zA-Z]/+
    emit (name) => name.toUpperCase()
}

let UpperCase = {
    match /[A-Z/+
    emit (name) => `HELLO ${name}!`
}
```

You can also curry an emit function to access the output of each step.

```
match /[a-zA-Z]/+
then UpperCase

emit (name) => (greeting) => `I say '${greeting}' to ${name}!`

let Input = {
    match /[a-zA-Z]/+
    emit (name) => name.toUpperCase()
}

let UpperCase = {
    match /[A-Z]/+
    emit (name) => `HELLO ${name}!`
}
```
