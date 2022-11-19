# Custom Terms

You can make your own **custom term** by using brace brackets.

```
{
    match "greeting"
    emit "Hello world!"
}
```

You can **match** your term, like usual.

```
match {
    match "greeting"
    emit "Hello world!"
}
```

You can define your term as a **constant**, like usual.

```
let Greeting = {
    match "greeting"
    emit "Hello world!"
}
```
