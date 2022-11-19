# Emit

The `emit` keyword tells your language what to **emit**.\
In other words, its output.

You can emit a **javascript value**.\
This language emits "Hello world!"

```
emit "Hello world!"
```

You can write a **javascript function** to emit different things based on what the user writes.\
This language says hello to whatever the user writes.

```
emit (name) => `Hello ${name}!`
```
