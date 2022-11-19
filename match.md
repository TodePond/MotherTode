# Match

The `match` keyword makes your language **match** a list of **terms**.\
In other words, what your user needs to write.

This makes a language where the user needs to write "ribbit" (otherwise it fails).

```
match "ribbit"
```

This **matches** "ribbit!"

```
match "ribbit" "!"
```

This **matches** a digit.

```
match /[0-9]/
```
