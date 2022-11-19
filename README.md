# As of 17th August 2022... I'm currently redesigning and rewriting MotherTode. Everything is broken and work-in-progress. For the old version, go to the [legacy](https://github.com/TodePond/MotherTodeLegacy) repo.

<img align="right" height="100" src="http://todepond.com/IMG/MotherTode@0.25x.png">

# MotherTode

MotherTode is a language that helps me to make languages. It's a language language.<br>
For more info, check out the [documentation](https://l2wilson94.gitbook.io/mothertode/).

## How does it work?

Define your language by defining terms, like these:

```
let Expression = Number | String
```

```
let Greeting = {
    match "greeting"
    emit "Hello world!"
}
```

## What does it look like?

This is a mini language that lets you add numbers (don't worry if you don't understand it yet):

```
match Number

let Number = Add | Literal
let Literal = /[0-9]/+
let Add = {
    match @(Number & !Add) "+" @Number
    emit (left, right) => left + right
)
```

## How do I use it?

You can embed it, like this:

```html
<script src="mothertode-embed.js"></script>
<script>
    const language = MotherTode("emit (name) => `Hello ${name}!`")
    console.log(language("world")) //Hello world!
<script>
```

Or import it, like this:

```javascript
import { MotherTode } from "./mothertode-import.js"
const language = MotherTode("emit (name) => `Hello ${name}!`")
console.log(language("world")) //Hello world!
```

Or use it from the command line, like this:

```bash
mothertode ./hello.mt "world"
```
