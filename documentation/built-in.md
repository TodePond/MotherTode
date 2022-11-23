# Special Terms

There are some **special terms** that you can use.

## Global

The `global` keyword refers to the global term (the **language**).

This matches a number with one-or-more digits.

```
match /[0-9]/ [global]
```

## Self

The `self` keyword refers to the current **term**.

Both of these mean the same thing.

```
let Number = /[0-9]/ [self]
```

```
let Number = /[0-9]/ [Number]
```

## Start

The `start` keyword matches the start of the file/source.

This only matches "hello" when it is the first term in the file/source.

```
match start "hello"
```

## End

The `end` keyword matches the end of the file/source.

This matches everything until the end of the file/source.

```
match { !end }
```

## Rest

The `rest` term matches everything until the end of the file/source.

```
match rest
```

## Any

The `any` term matches any character.

```
match any
```

## Nothing

The `nothing` term matches nothing. It's useful for emitting something without needing to match anything.

```
match nothing
```
