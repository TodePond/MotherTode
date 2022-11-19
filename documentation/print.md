# Print

The `print` keyword lets you translate your language and print the output to the console.

```
match /[a-zA-Z]/
emit (name) => `Hello ${name}!`

print "world" //Hello world!
```
