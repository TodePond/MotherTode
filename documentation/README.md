<img align="right" height="100" src="http://todepond.com/IMG/MotherTode@0.25x.png">

# Intro

[MotherTode](https://github.com/TodePond/MotherTode) is a language that helps me to make languages. It's a language language.

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
