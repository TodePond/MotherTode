# Properties

You can make your own **term** by writing some **properties** in brace brackets.

```
{
    match "greeting"
    emit "Hello world!"
}
```

All properties are optional!

| Property            | Language   | Description                                                | Default            |
| ------------------- | ---------- | ---------------------------------------------------------- | ------------------ |
| [`match`](match.md) | MotherTode | Term to match                                              | `anything`         |
| [`skip`](skip.md)   | MotherTode | Term to ignore in-between terms                            | `nothing`          |
| [`then`](then.md)   | MotherTode | Term to match after this one                               | `nothing`          |
| [`emit`](emit.md)   | JavaScript | What to output (after matching)                            | `(input) => input` |
| [`check`](check.md) | JavaScript | What to check (after matching)                             | `() => true`       |
| [`throw`](throw.md) | JavaScript | What error to throw if this term fails (if any)            | `undefined`        |
| [`print`](print.md) | JavaScript | What to transpile and print to the console (for debugging) | `undefined`        |
