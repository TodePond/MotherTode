<img align="right" height="100" src="http://todepond.com/IMG/frogasaurus.jpg">

# Frogasaurus
Frogasaurus is a template for making a javascript project.<br>
I made it because I wanted an easy way to make a project that can be used in any of these ways:
* Importing with the `import` keyword.
* Embedding with a single `script` tag.
* Embedding with multiple `script` tags, without needing to re-bundle the project.

# How does it work?
Write your code inside the `source` folder.<br>
Then run the `make.js` file with [Deno](https://deno.land).<br>
Your bundled project will appear inside the `build` folder.<br>
Use `build-import.js` when importing the project.<br>
Use `build-embed.js` when embedding the project.

By the way, you can use this command to run the `make.js` file securely:
```
deno run --allow-read=. --allow-write=. make.js
```

# Flags
You can give flags to your source files, so that Frogasaurus knows what to do with them.<br>
For example, a file named `greet.js` has no flags.<br>
You can name it `greet-import.js` instead, to give it the `import` flag.<br>
Files can have multiple flags. For example, `greet-footer-import.js` has the `footer` and `import` flags.

These are the different flags you can use:
| Flag     | Description                                                    | 
|----------|----------------------------------------------------------------|
| `header` | The code in this file is placed at the start.                  |
| `footer` | The code in this file is placed at the end.                    |
| `import` | The code in this file is only inserted into `build-import.js`. | 
| `embed`  | The code in this file is only inserted into `build-embed.js`.  | 

# Examples
There are examples in the `examples` folder to show you how to use your bundled project.<br>

# Tinker
The files in the `tinker` folder might be handy for tinkering with quick iterations to the project, without needing to rebuild.
