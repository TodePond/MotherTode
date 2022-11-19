# Special Terms

There are some **special terms** that you can use.

## Global

The `global` keyword refers to the global term (the **language**).

This matches a number.

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

## End

The `end` keyword matches the end of the file/source.

This matches anything until the end of the file.

```
match { !end }
```

## Start

The `start` keyword matches the start of the file/source.

This only matches "hello" when it is the first term in the file/source.

```
match start "hello"
```

## Anything

The `anything` keyword matches anything (until the end of the file/source).

```
match anything
```

## Nothing

The `nothing` keyword matches nothing. It's useful for emitting something without

```
match nothing
```
