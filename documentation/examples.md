# Examples

## Hello World

```
emit "Hello world!"
```

## Greet

```
emit (name) => `Hello ${name}!`
```

## Double

```
match Digit+ ["." Digit+]
emit (number) => number * 2

let Digit = /[0-9]/
```

## Sum

```
let Number = /[0-9]/+

match @Number {"," @Number}
skip {" "}
emit (...numbers) => numbers.reduce((a, b) => a + b, 0)
```

```
let Number = /[0-9]/+

match @Number ["," @self]
skip {" "}
emit (head, tail = 0) => head + tail
```

## Fizzbuzz

```
match FizzBuzz | Fizz | Buzz | Number

let Number = /[0-9]/+
let FizzBuzz = Fizz & Buzz
let MultipleOf = <n> => {
    match Number
    check (v) => v % n === 0
}

let Fizz = {
    match MultipleOf<3>
    emit "Fizz"
}

let Buzz = {
    match MultipleOf<5>
    emit "Buzz"
}
```

```
match FizzBuzz | Fizz | Buzz | Number

let FizzBuzz = Fizz & Buzz
let Fizz = MultipleOf<3> & emit "Fizz"
let Buzz = MultipleOf<5> & emit "Buzz"
let Number = /[0-9]/+
let MultipleOf = <n> => Number & check (v) => v % n === 0
```

## Calculator

```
match Number

let Number = Add | Subtract | Literal
let Literal = /[0-9]/+

let Add = {
    match @(Number & !Add) "+" @Number
    emit (left, right) => left + right
}

let Subtract = {
    match @(Number & !Subtract) "-" @Number
    emit (left, right) => left - right
}
```

```
match Number

let Number = Add | Subtract | Literal
let Literal = /[0-9]/+
let Add = Operation<"+", (a, b) => a + b>
let Subtract = Operation<"-", (a, b) => a - b>

let Operation = <operator, emitter> => {
    match @(Number & !self) operator @Number
    emit (a, b) => emitter(a, b)
}
```

## Fibonacci

```
match Zero | One | Number

let Zero = "0" & emit "1"
let One = "1"

let Number = {
    match /[0-9]/+
    emit (n) => global(n-1) + global(n-2)
}
```
