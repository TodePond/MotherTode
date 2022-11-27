# Operators

You can use **operators** to change how **terms** get **matched**.

## Maybe

Makes a term **optional**.\
These match "ribbit" or "ribbit!"

```
match "ribbit" ["!"]
```

```
match "ribbit" "!"?
```

## Many

Allows a term to be matched **one-or-more times**.\
This matches "ribbit!" or "ribbit!!" or "ribbit!!!" or etc...

```
match "ribbit" "!"+
```

## Any

Allows a term to be matched **any number of times**.\
These match "ribbit" or "ribbit!" or "ribbit!!" etc...

```
match "ribbit" {"!"}
```

```
match "ribbit" "!"*
```

## Or

Matches **either** term.\
This matches "ribbit" or "hello".

```
match "ribbit" | "hello"
```

## Not

Matches **anything other** than the term.\
This matches anything other than "ribbit".

```
match !"ribbit"
```

## And

Must match **both** terms.\
This matches any word except for "ribbit".

```
match /[a-zA-Z]/+ & !"ribbit"
```

## Except

Remove a term from an 'or' operation.\
This matches "hello".

```
match ("hello" | "ribbit") - "ribbit"
```

## Select

You can **select** which terms to pass into the emit function with the `@` symbol.

```
match "greet " @/a-zA-Z/+
emit (name) => `Hello ${name}!`

let Name = /[a-zA-Z]/+
```

## Until

When using an **any** or **many** operator, you can choose to carry on **until** a certain term is matches.<br>
By default, they carry on until the end of the file/source.

This matches any character until you get to a full-stop.

```
match any* until "."
```

## Before

You can say what the term should be **before**.

This only matches "ribbit" if it's before an exclamation mark.

```
match "ribbit" before "!"
```
