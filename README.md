<img align="right" height="100" src="http://todepond.com/IMG/MotherTode@0.25x.png">

# MotherTode

MotherTode is a language that lets you make languages. It's a language language.<br>
For more info, check out the [documentation](https://l2wilson94.gitbook.io/mothertode/).

## How does it work?
Define your language by defining terms, like these:

```
Expression :: Number | String
Greeting :: "greet" >> "Hello world!"
```

## What does it look like?
This is a mini language that reads number and string literals (don't worry if you don't understand it yet):
```
:: Expression {"\n" Expression}
Expression :: Number | String
Number :: /[0-9]/+
String (
    :: '"' /[^"]/* '"'
    >> ([left, inner, right]) => "`" + inner + "`"
)
```
