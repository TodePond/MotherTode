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
