# Library

MotherTode is built on top of a little library.<br>
If you want, you can use the library without using the language itself.

# Primitives

## String

```javascript
const name = Term.string("Lu")
name.test("Lu") // true
```

## Regular Expression

```javascript
const name = Term.regExp(/Lu/)
name.test("Lu") // true
```

```javascript
const name = Term.regExp(/Lu|Luke/)
name.test("Lu") // true
name.test("Luke") // true
```

```javascript
const number = Term.regExp(/[0-9]+/)
number.test("123") // true
```

# Built-In Terms

## Rest

```javascript
Term.rest.travel("Luke") // "Lu"
```

## Anything

```javascript
Term.anything.travel("Luke") // "L"
```

## Nothing

```javascript
Term.nothing.travel("Luke") // ""
```

## End

```javascript
Term.end.test("") // true
```

# Operators

## List

```javascript
const terms = [Term.string("Lu"), Term.string("ke")]
const list = Term.list(terms)
list.test("Luke") // true
```

## Maybe

```javascript
const maybe = Term.maybe(Term.string("Luke"))
maybe.travel("Luke") // "Luke"
maybe.travel("Duke") // ""
maybe.test("Luke") // true
maybe.test("Duke") // true
```

## Many

```javascript
const many = Term.many(Term.string("Lu"))
many.travel("Lu") // "Lu"
many.travel("LuLuLu") // "LuLuLu"
```

## Any

```javascript
const any = Term.any(Term.string("Lu"))
any.test("Lu") // true
any.test("") // true
```

## Or

```javascript
const terms = [Term.string("Luke"), Term.string("Lu")]
const or = Term.or(terms)
or.test("Luke") // true
or.test("Lu") // true
```

## Not

```javascript
const not = Term.not(Term.string("Luke"))
not.test("Luke") // false
not.test("Lu") // true
```

## And

```javascript
const terms = [Term.regExp(/[0-9]/), Term.not(Term.string("3"))]
const and = Term.and(terms)
and.test("1") // true
and.test("3") // false
```

## Except

```javascript
const luke = Term.string("Luke")
const lu = Term.string("Lu")
const terms = [luke, lu]
const or = Term.or(terms)
const except = Term.except(or, [luke])
except.test("Luke") // false
except.test("Lu") // true
```

# Scope Management

## Reference

```javascript
const name = Term.string("Lu")
const reference = Term.reference(name)
reference.test("Lu") // true
```

## Hoist

```javascript
const { name } = Term.hoist(() => ({
	name: Term.string("Lu"),
}))

name.test("Lu") // true
```

```javascript
const { laugh } = Term.hoist((terms) => ({
	laugh: Term.many(terms.ha),
	ha: Term.string("ha"),
}))

laugh.test("hahaha") // true
```
