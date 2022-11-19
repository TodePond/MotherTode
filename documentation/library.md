# Library

MotherTode is built on top of a little library.<br>
If you want, you can use the library without using the language itself.

```javascript
import { emit } from "./mothertode-import.js"
const language = emit((name) => `Hello ${world}!`)
console.log(language("world")) //Hello world
```

```html
<script src="mothertode-embed.js"></script>
<script>
	const { emit } = MotherTode
	const language = emit((name) => `Hello ${world}!`)
	console.log(language("world")) //Hello world
</script>
```
