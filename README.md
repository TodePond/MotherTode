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
This is a mini language that lets you add numbers (don't worry if you don't understand it yet):
```
:: Number {"\n" Number}
Number :: Add | Literal
Literal :: /[0-9]/+
Add (
    :: Number~Add "+" Number
    >> ([left, operator, right]) => parseInt(left) + parseInt(right)
)
```

## How do I use it?
You can embed it or import it.
```js
<script src="mothertode-embed.js"></script>
```
```js
import MotherTode from "./mothertode-import.js"
```
Then use the `MotherTode` function.
```js
const language = MotherTode(`:: /[a-zA-Z]/+ >> (name) => "Hello " + name + "!"`)
const result = language("world")
console.log(result.output)
```
