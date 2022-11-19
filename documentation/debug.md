# Debug

The `debug` keyword lets you translate your language and print the output to the console.

```
match /[a-zA-Z]/
emit (name) => `Hello ${name}!`

debug "world" //Hello world!
```
