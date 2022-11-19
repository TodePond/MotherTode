# Intro

[MotherTode](https://github.com/TodePond/MotherTode) is a language that helps me to make languages. It's a language language.

You can embed it, like this:

```html
<script src="mothertode-embed.js"></script>
<script>
	const language = MotherTode("emit (name) => `Hello ${name}!`")
	console.log(language("world")) //Hello world!
</script>
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

## Basics

-   [Emit](emit.md)
-   [Match](match.md)

## Using Terms

-   [Literals](literals.md)
-   [Constants](constants.md)
-   [Operators](operators.md)
-   [Built-In Terms](built-in.md)

## Making Terms

-   [Properties](properties.md)
-   [Functions](functions.md)
-   [Scope](scope.md)

## Properties

-   [Match](match.md)
-   [Skip](skip.md)
-   [Then](then.md)
-   [Emit](emit.md)
-   [Check](check.md)
-   [Throw](throw.md)
-   [Print](print.md)

## Library

-   [Library](library.md)

## Examples

-   [Examples](examples.md)
