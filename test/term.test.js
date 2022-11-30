import { assertAlmostEquals, assertEquals, assertThrows } from "https://deno.land/std@0.165.0/testing/asserts.ts"
import { Term } from "../mothertode-import.js"

//============//
// PRIMITIVES //
//============//
Deno.test("string", () => {
	const hello = Term.string("hello")

	assertEquals(hello.translate("hello"), "hello")
	assertThrows(() => hello.translate("hi"), Error, 'Expected "hello" but found "hi"')

	assertEquals(hello.match("hello"), ["hello"])
	assertEquals(hello.match("hi"), [])

	assertEquals(hello.test("hello"), true)
	assertEquals(hello.test("hi"), false)

	assertEquals(hello.travel("hello"), "hello")
	assertEquals(hello.travel("hell"), "hell")
})

Deno.test("regular expression", () => {
	const hello = Term.regExp(/hello/)

	assertEquals(hello.translate("hello"), "hello")
	assertThrows(() => hello.translate("hi"), Error, 'Expected /hello/ but found "hi"')

	assertEquals(hello.match("hello"), ["hello"])
	assertEquals(hello.match("hi"), [])

	assertEquals(hello.test("hello"), true)
	assertEquals(hello.test("hi"), false)

	assertEquals(hello.travel("hello"), "hello")
	assertEquals(hello.travel("hell"), "")

	const yo = Term.regExp(/(yo)+/)
	assertEquals(yo.translate("yo"), "yo")
	assertEquals(yo.translate("yoyoyo"), "yoyoyo")

	assertEquals(yo.match("yo"), ["yo"])
	assertEquals(yo.match("yoyoyo"), ["yoyoyo"])
	assertEquals(yo.match("yolo"), ["yo"])
	assertEquals(yo.match("yoyolo"), ["yoyo"])
	assertEquals(yo.match("hi"), [])

	assertEquals(yo.test("yo"), true)
	assertEquals(yo.test("yoyoyo"), true)
	assertEquals(yo.test("hi"), false)

	assertEquals(yo.travel("yo"), "yo")
	assertEquals(yo.travel("yoyoyo"), "yoyoyo")
	assertEquals(yo.travel("yolo"), "yo")

	const greeting = Term.regExp(/(hello|hi)+/)
	assertEquals(greeting.translate("hello"), "hello")
	assertEquals(greeting.translate("hihi"), "hihi")

	assertEquals(greeting.match("hello"), ["hello"])
	assertEquals(greeting.match("hellohi"), ["hellohi"])

	assertEquals(greeting.travel("hello"), "hello")
	assertEquals(greeting.travel("hellohi"), "hellohi")
	assertEquals(greeting.travel("helloribbit"), "hello")
})

Deno.test("regular expression - set", () => {
	const digit = Term.regExp(/[0-9]+/)
	assertEquals(digit.translate("123"), "123")
	assertThrows(() => digit.translate("abc"), Error, 'Expected /[0-9]+/ but found "abc"')
	assertThrows(() => digit.translate("hello123"), Error, 'Expected /[0-9]+/ but found "hello123"')

	assertEquals(digit.match("123"), ["123"])
	assertEquals(digit.match("abc"), [])
	assertEquals(digit.match("hello123"), [])

	assertEquals(digit.test("123"), true)
	assertEquals(digit.test("abc"), false)
	assertEquals(digit.test("hello123"), false)

	assertEquals(digit.travel("123"), "123")
	assertEquals(digit.travel("abc"), "")
	assertEquals(digit.travel("123hello"), "123")
})

//================//
// BUILT-IN TERMS //
//================//
Deno.test("rest", () => {
	const rest = Term.rest

	assertEquals(rest.translate("hello"), "hello")
	assertEquals(rest.translate("hi"), "hi")

	assertEquals(rest.match("hello"), ["hello"])
	assertEquals(rest.match("hi"), ["hi"])

	assertEquals(rest.test("hello"), true)
	assertEquals(rest.test("hi"), true)

	assertEquals(rest.travel("hello"), "hello")
	assertEquals(rest.travel("hi"), "hi")
})

Deno.test("anything", () => {
	const any = Term.anything

	assertEquals(any.translate("hello"), "h")
	assertEquals(any.translate("hi"), "h")

	assertEquals(any.match("hello"), ["h"])
	assertEquals(any.match("hi"), ["h"])
	assertEquals(any.match(""), [])

	assertEquals(any.test("hello"), true)
	assertEquals(any.test("hi"), true)
	assertThrows(() => any.translate(""), Error, "Expected anything but found end of input")

	assertEquals(any.travel("hello"), "h")
	assertEquals(any.travel("hi"), "h")
	assertEquals(any.travel(""), "")
})

Deno.test("end", () => {
	const end = Term.end

	assertEquals(end.translate(""), "")
	assertThrows(() => end.translate("hello"), Error, 'Expected end of input but found "hello"')

	assertEquals(end.match(""), [""])
	assertEquals(end.match("hello"), [])

	assertEquals(end.test(""), true)
	assertEquals(end.test("hello"), false)

	assertEquals(end.travel(""), "")
	assertEquals(end.travel("hello"), "")
})

Deno.test("nothing", () => {
	const nothing = Term.nothing

	assertEquals(nothing.translate("hello"), "")
	assertEquals(nothing.translate(""), "")

	assertEquals(nothing.match("hello"), [""])
	assertEquals(nothing.match(""), [""])

	assertEquals(nothing.test("hello"), true)
	assertEquals(nothing.test(""), true)

	assertEquals(nothing.travel("hello"), "")
	assertEquals(nothing.travel(""), "")
})

//===========//
// OPERATORS //
//===========//
Deno.test("list", () => {
	const list = Term.list([Term.string("hello"), Term.string("hi")])

	assertEquals(list.translate("hellohi"), "hellohi")
	assertThrows(() => list.translate("helloh"), Error, 'Expected "hi" but found "h"')
	assertThrows(() => list.translate("hello"), Error, 'Expected "hi" but found end of input')
	assertThrows(() => list.translate(""), Error, 'Expected "hello" but found end of input')

	assertEquals(list.match("hellohi"), [["hello"], ["hi"]])
	assertEquals(list.match("helloh").length, 0)

	assertEquals(list.test("hellohi"), true)
	assertEquals(list.test("helloh"), false)

	assertEquals(list.travel("hellohi"), "hellohi")
	assertEquals(list.travel("helloh"), "helloh")
	assertEquals(list.travel("hell"), "hell")

	const custom = Term.emit(list, ([hello, hi]) => `${hello} ${hi}`)
	assertEquals(custom.translate("hellohi"), "hello hi")
	assertThrows(() => custom.translate("helloh"), Error, 'Expected "hi" but found "h"')

	const shout = Term.emit(Term.string("hello"), (hello) => hello + "!")
	const listShout = Term.list([shout, shout])
	assertEquals(listShout.translate("hellohello"), "hello!hello!")
	assertThrows(() => listShout.translate("hello"), Error, 'Expected "hello" but found end of input')
})

Deno.test("list - nested", () => {
	const list = Term.list([Term.string("hello"), Term.list([Term.string("hi"), Term.string("yo")])])

	assertEquals(list.translate("hellohiyo"), "hellohiyo")
	assertThrows(() => list.translate("hellohi"), Error, 'Expected "yo" but found end of input')
	assertThrows(() => list.translate("hello"), Error, 'Expected "hi" but found end of input')
	assertThrows(() => list.translate(""), Error, 'Expected "hello" but found end of input')

	assertEquals(list.match("hellohiyo"), [["hello"], [["hi"], ["yo"]]])
	assertEquals(list.match("hellohi").length, 0)

	assertEquals(list.test("hellohiyo"), true)
	assertEquals(list.test("hellohi"), false)

	const list2 = Term.list([
		Term.string("hello"),
		Term.list([Term.string("hi"), Term.string("yo")]),
		Term.string("hi"),
	])

	assertEquals(list2.translate("hellohiyohi"), "hellohiyohi")
	assertThrows(() => list2.translate("hellohiyo"), Error, 'Expected "hi" but found end of input')
	assertThrows(() => list2.translate("hellohi"), Error, 'Expected "yo" but found end of input')
	assertThrows(() => list2.translate("hello"), Error, 'Expected "hi" but found end of input')
	assertThrows(() => list2.translate(""), Error, 'Expected "hello" but found end of input')

	assertEquals(list2.match("hellohiyohi"), [["hello"], [["hi"], ["yo"]], ["hi"]])
	assertEquals(list2.match("hellohiyo").length, 0)

	assertEquals(list2.test("hellohiyohi"), true)
	assertEquals(list2.test("hellohiyo"), false)

	assertEquals(list2.travel("hellohiyohi"), "hellohiyohi")
	assertEquals(list2.travel("hellohiyo"), "hellohiyo")
	assertEquals(list2.travel("hellohiy"), "hellohiy")

	const custom = Term.emit(list, ([hello, hiyo]) => `${hello} ${hiyo}`)
	assertEquals(custom.translate("hellohiyo"), "hello hiyo")
	assertEquals(custom.match("hellohiyo"), [["hello"], [["hi"], ["yo"]]])
	assertThrows(() => custom.translate("hellohi"), Error, 'Expected "yo" but found end of input')

	assertEquals(custom.travel("hellohiyo"), "hellohiyo")
	assertEquals(custom.travel("hellohiy"), "hellohiy")

	const shout = Term.emit(Term.string("hello"), (hello) => hello + "!")
	const listShout = Term.list([shout, Term.list([shout, shout])])
	assertEquals(listShout.translate("hellohellohello"), "hello!hello!hello!")
	assertEquals(listShout.match("hellohellohello"), [["hello"], [["hello"], ["hello"]]])
	assertThrows(() => listShout.translate("hellohello"), Error, 'Expected "hello" but found end of input')

	assertEquals(listShout.travel("hellohellohello"), "hellohellohello")
	assertEquals(listShout.travel("hellohellohe"), "hellohellohe")
})

Deno.test("maybe", () => {
	const hello = Term.string("hello")
	const maybe = Term.maybe(hello)

	assertEquals(maybe.translate("hello"), "hello")
	assertEquals(maybe.translate("hi"), "")

	assertEquals(maybe.match("hello"), ["hello"])
	assertEquals(maybe.match("hi"), [""])

	assertEquals(maybe.test("hello"), true)
	assertEquals(maybe.test("hi"), true)

	assertEquals(maybe.travel("hello"), "hello")
	assertEquals(maybe.travel("he"), "he")

	const customTerm = Term.emit(maybe, (string) => string + "!")
	assertEquals(customTerm.match("hello"), ["hello"])
	assertEquals(customTerm.translate("hello"), "hello!")
	assertEquals(customTerm.translate("hi"), "!")

	assertEquals(customTerm.travel("hello"), "hello")
	assertEquals(customTerm.travel("he"), "he")

	const shout = Term.emit(Term.string("hello"), (hello) => hello + "!")
	const maybeShoutTerm = Term.maybe(shout)
	assertEquals(maybeShoutTerm.match("hello"), ["hello"])
	assertEquals(maybeShoutTerm.translate("hello"), "hello!")
	assertEquals(maybeShoutTerm.match("hi"), [""])

	assertEquals(maybeShoutTerm.travel("hello"), "hello")
	assertEquals(maybeShoutTerm.travel("he"), "he")
})

Deno.test("many", () => {
	const many = Term.many(Term.string("hello"))

	assertEquals(many.translate("hello"), "hello")
	assertEquals(many.translate("hellohello"), "hellohello")
	assertThrows(() => many.translate(""), Error, 'Expected ("hello")+ but found end of input')

	assertEquals(many.match("hello"), [["hello"]])
	assertEquals(many.match("hellohello"), [["hello"], ["hello"]])
	assertEquals(many.match(""), [])

	assertEquals(many.test("hello"), true)
	assertEquals(many.test("hellohello"), true)
	assertEquals(many.test(""), false)

	assertEquals(many.travel("hello"), "hello")
	assertEquals(many.travel("hellohello"), "hellohello")
	assertEquals(many.travel("hellohellohello"), "hellohellohello")
	assertEquals(many.travel("hellohellohe"), "hellohellohe")

	const shout = Term.emit(Term.string("hello"), (hello) => hello + "!")
	const manyShout = Term.many(shout)
	assertEquals(manyShout.translate("hello"), "hello!")
	assertEquals(manyShout.translate("hellohello"), "hello!hello!")

	assertEquals(manyShout.travel("hello"), "hello")
	assertEquals(manyShout.travel("hellohe"), "hellohe")
})

// Test matching zero or more terms
Deno.test("any", () => {
	const any = Term.any(Term.string("hello"))

	assertEquals(any.translate("hello"), "hello")
	assertEquals(any.translate("hellohello"), "hellohello")
	assertEquals(any.translate(""), "")

	assertEquals(any.match("hello"), [["hello"]])
	assertEquals(any.match("hellohello"), [["hello"], ["hello"]])
	assertEquals(any.match(""), [""])

	assertEquals(any.test("hello"), true)
	assertEquals(any.test("hellohello"), true)
	assertEquals(any.test(""), true)

	assertEquals(any.travel("hello"), "hello")
	assertEquals(any.travel("hellohello"), "hellohello")
	assertEquals(any.travel("hellohellohello"), "hellohellohello")
	assertEquals(any.travel("hellohellohe"), "hellohellohe")
	assertEquals(any.travel(""), "")

	const shout = Term.emit(Term.string("hello"), (hello) => hello + "!")
	const anyShout = Term.any(shout)
	assertEquals(anyShout.translate("hello"), "hello!")
	assertEquals(anyShout.translate("hellohello"), "hello!hello!")
	assertEquals(anyShout.translate(""), "")

	assertEquals(anyShout.travel("hello"), "hello")
	assertEquals(anyShout.travel("hellohe"), "hellohe")
})

Deno.test("or", () => {
	const or = Term.or([Term.string("hello"), Term.string("hi")])

	assertEquals(or.translate("hello"), "hello")
	assertEquals(or.translate("hi"), "hi")
	assertThrows(() => or.translate("yo"), Error, 'Expected ("hello" | "hi") but found "yo"')

	assertEquals(or.match("hello")[0][0], "hello")
	assertEquals(or.match("hi")[0][0], "hi")
	assertEquals(or.match("yo").length, 0)

	assertEquals(or.test("hello"), true)
	assertEquals(or.test("hi"), true)
	assertEquals(or.test("yo"), false)

	assertEquals(or.travel("hello"), "hello")
	assertEquals(or.travel("hi"), "hi")
	assertEquals(or.travel("hell"), "hell")
	assertEquals(or.travel("h"), "h")
	assertEquals(or.travel("yo"), "")

	const shout = Term.emit(Term.string("hello"), ([hello]) => hello + "!")
	const orShout = Term.or([shout, Term.string("hi")])
	assertEquals(orShout.translate("hello"), "hello!")
	assertEquals(orShout.translate("hi"), "hi")
	assertThrows(() => orShout.translate("yo"), Error, 'Expected ("hello" | "hi") but found "yo"')

	assertEquals(orShout.travel("hello"), "hello")
	assertEquals(orShout.travel("hi"), "hi")
	assertEquals(orShout.travel("hell"), "hell")
	assertEquals(orShout.travel("h"), "h")
	assertEquals(orShout.travel("yo"), "")

	const or2 = Term.or([Term.string("hello"), Term.string("hi"), Term.string("yo")])
	assertEquals(or2.translate("hello"), "hello")
	assertEquals(or2.translate("hi"), "hi")
	assertEquals(or2.translate("yo"), "yo")
	assertThrows(() => or2.translate("wassup"), Error, 'Expected ("hello" | "hi" | "yo") but found "wassup"')

	assertEquals(or2.travel("hello"), "hello")
	assertEquals(or2.travel("hi"), "hi")
	assertEquals(or2.travel("yo"), "yo")
	assertEquals(or2.travel("wassup"), "")
})

Deno.test("and", () => {
	const and = Term.and([Term.string("hello"), Term.regExp(/hello/)])

	assertEquals(and.translate("hello"), "hello")
	assertThrows(() => and.translate("hi"), Error, 'Expected "hello" but found "hi"')

	assertEquals(and.match("hello"), ["hello"])
	assertEquals(and.match("hi").length, 0)

	assertEquals(and.test("hello"), true)
	assertEquals(and.test("hi"), false)

	assertEquals(and.travel("hello"), "hello")
	assertEquals(and.travel("hi"), "")
	assertEquals(and.travel("h"), "")

	const and2 = Term.and([Term.regExp(/(yo)+/), Term.string("yo")])
	assertEquals(and2.translate("yo"), "yo")
	assertEquals(and2.translate("yoyo"), "yo")

	assertEquals(and2.match("yo"), ["yo"])
	assertEquals(and2.match("yoyo"), ["yo"])

	assertEquals(and2.test("yo"), true)
	assertEquals(and2.test("yoyo"), true)
	assertEquals(and2.test("y"), false)

	assertEquals(and2.travel("yo"), "yo")
	assertEquals(and2.travel("yoyo"), "yo")
	assertEquals(and2.travel("y"), "")
})

Deno.test("not", () => {
	const not = Term.not(Term.string("hello"))

	assertEquals(not.translate("hi"), "hi")
	assertThrows(() => not.translate("hello"), Error, 'Expected !"hello" but found "hello"')

	assertEquals(not.match("hi"), ["hi"])
	assertEquals(not.match("hello").length, 0)

	assertEquals(not.test("hi"), true)
	assertEquals(not.test("hello"), false)

	assertEquals(not.travel("hi"), "hi")
	assertEquals(not.travel("hello"), "hell")

	const not2 = Term.and([Term.regExp(/[a-z]+/), Term.not(Term.string("hello"))])
	assertEquals(not2.translate("hi"), "hi")
	assertThrows(() => not2.translate("hello"), Error, 'Expected !"hello" but found "hello"')

	assertEquals(not2.match("hi"), ["hi"])
	assertEquals(not2.match("hello").length, 0)

	assertEquals(not2.test("hi"), true)
	assertEquals(not2.test("hello"), false)

	assertEquals(not2.travel("hi"), "hi")
	assertEquals(not2.travel("hello"), "hell")
})

Deno.test("except", () => {
	const hello = Term.string("hello")
	const hi = Term.string("hi")
	const or = Term.or([hello, hi])

	const exceptTerm = Term.except(or, [hello])

	assertEquals(exceptTerm.translate("hi"), "hi")
	assertThrows(() => exceptTerm.translate("hello"), Error, 'Expected ("hi") but found "hello"')

	assertEquals(exceptTerm.travel("hi"), "hi")
	assertEquals(exceptTerm.travel("hello"), "h")
})

Deno.test("reference", () => {
	const object = { hello: Term.string("hello") }
	const reference = Term.reference(object, "hello")

	assertEquals(reference.translate("hello"), "hello")
	assertThrows(() => reference.translate("hi"), Error, 'Expected "hello" but found "hi"')

	assertEquals(reference.travel("hello"), "hello")
	assertEquals(reference.travel("hi"), "h")

	const reference2 = Term.reference(object, "hello")
	assertEquals(reference, reference2)
})

Deno.test("hoist", () => {
	const { hello } = Term.hoist(() => {
		return { hello: Term.string("hello") }
	})

	assertEquals(hello.translate("hello"), "hello")
	assertThrows(() => hello.translate("hi"), Error, 'Expected "hello" but found "hi"')

	assertEquals(hello.travel("hello"), "hello")
	assertEquals(hello.travel("hi"), "h")
})

Deno.test("hoist - list", () => {
	const { helloHello } = Term.hoist(({ hello }) => {
		return { hello: Term.string("hello"), helloHello: Term.list([hello, hello]) }
	})

	assertEquals(helloHello.translate("hellohello"), "hellohello")
	assertThrows(() => helloHello.translate("hi"), Error, 'Expected "hello" but found "hi"')
	assertThrows(() => helloHello.translate("hellohi"), Error, 'Expected "hello" but found "hi"')

	assertEquals(helloHello.travel("hellohello"), "hellohello")
	assertEquals(helloHello.travel("hi"), "h")
	assertEquals(helloHello.travel("hellohi"), "helloh")
})

Deno.test("hoist - except", () => {
	const { or, except } = Term.hoist(({ hello, hi }) => {
		return {
			hello: Term.string("hello"),
			hi: Term.string("hi"),
			or: Term.or([hello, hi]),
			except: Term.except(Term.or([hello, hi]), [hello]),
		}
	})

	assertEquals(or.translate("hello"), "hello")
	assertEquals(or.translate("hi"), "hi")
	assertEquals(except.translate("hi"), "hi")
	assertThrows(() => except.translate("hello"), Error, 'Expected ("hi") but found "hello"')

	assertEquals(or.travel("hello"), "hello")
	assertEquals(or.travel("hi"), "hi")
	assertEquals(except.travel("hi"), "hi")
	assertEquals(except.travel("hello"), "h")
})

Deno.test("list - maybe", () => {
	const hello = Term.string("hello")
	const hi = Term.string("hi")
	const maybe = Term.maybe(Term.list([hi, hi]))

	const list = Term.list([hello, maybe])

	assertEquals(list.translate("hello"), "hello")
	assertEquals(list.translate("hellohihi"), "hellohihi")
	assertThrows(() => list.translate("hihi"), Error, 'Expected "hello" but found "hihi"')

	assertEquals(list.travel("hello"), "hello")
	assertEquals(list.travel("hellohihi"), "hellohihi")
	assertEquals(list.travel("hihi"), "h")
})

Deno.test("hoist - recursive maybe", () => {
	const { list } = Term.hoist(({ list, hello }) => {
		return {
			list: Term.list([hello, Term.maybe(list)]),
			hello: Term.string("hello"),
		}
	})

	assertEquals(list.translate("hello"), "hello")
	assertEquals(list.translate("hellohello"), "hellohello")
	assertEquals(list.translate("hellohellohello"), "hellohellohello")

	assertEquals(list.travel("hello"), "hello")
	assertEquals(list.travel("hellohello"), "hellohello")
	assertEquals(list.travel("hellohellohe"), "hellohello")
})

Deno.test("hoist - or", () => {
	const { or, except } = Term.hoist(({ hello, hi }) => {
		return {
			hello: Term.string("hello"),
			hi: Term.string("hi"),
			or: Term.or([hello, hi]),
			except: Term.except(Term.or([hello, hi]), [hello]),
		}
	})

	assertEquals(or.translate("hello"), "hello")
	assertEquals(or.translate("hi"), "hi")
	//assertThrows(() => or.translate("yo"), Error, 'Expected ("hello" | "hi") but found "yo"')

	assertEquals(or.travel("hi"), "hi")
	assertEquals(or.travel("hello"), "hello")
	assertEquals(or.travel("ho"), "h")

	assertEquals(except.translate("hi"), "hi")
	//assertThrows(() => except.translate("hello"), Error, 'Expected ("hi") but found "hello"')

	assertEquals(except.travel("hi"), "hi")
	assertEquals(except.travel("hello"), "h")
})

Deno.test("hoist - recursive or", () => {
	const { list } = Term.hoist(({ list, hello, tail }) => {
		return {
			list: Term.list([hello, tail]),
			hello: Term.string("hello"),
			tail: Term.or([list, hello]),
		}
	})

	assertEquals(list.translate("hellohello"), "hellohello")
	assertEquals(list.translate("hellohellohello"), "hellohellohello")
	//assertThrows(() => list.translate("hello"), Error, '((hello, tail) | "hello")')

	assertEquals(list.travel("hellohello"), "hellohello")
	assertEquals(list.travel("hello"), "hello")
	assertEquals(list.travel("hellohellohe"), "hellohello")
})

Deno.test("hoist - left recursion", () => {
	const { number } = Term.hoist(({ number, add, literal }) => {
		return {
			literal: Term.regExp(/[0-9]+/),
			number: Term.or([add, literal]),
			add: Term.list([Term.except(number, [add]), Term.string("+"), number]),
		}
	})

	assertEquals(number.translate("1"), "1")
	assertEquals(number.translate("1+2"), "1+2")
	assertEquals(number.translate("1+2+3"), "1+2+3")

	assertEquals(number.travel("1"), "1")
	assertEquals(number.travel("1+"), "1+")
	assertEquals(number.travel("1+2"), "1+2")
	assertEquals(number.travel("1+2+"), "1+2")
	assertEquals(number.travel("1+2+3"), "1+2+3")
	assertEquals(number.travel("1+2+3+"), "1+2+3")
})

Deno.test("hoist - deep left recursion", () => {
	const { number } = Term.hoist(({ number, add, subtract, literal }) => {
		return {
			literal: Term.regExp(/[0-9]+/),
			number: Term.or([add, subtract, literal]),
			add: Term.list([Term.except(number, [add]), Term.string("+"), number]),
			subtract: Term.list([Term.except(number, [subtract]), Term.string("-"), number]),
		}
	})

	assertEquals(number.translate("1"), "1")
	assertEquals(number.translate("1+2"), "1+2")
	assertEquals(number.translate("1-2"), "1-2")
	assertEquals(number.translate("1+2-3"), "1+2-3")
	assertEquals(number.translate("1-2+3-4"), "1-2+3-4")

	assertEquals(number.travel("1"), "1")
	assertEquals(number.travel("1+2"), "1+2")
	assertEquals(number.travel("1+"), "1+")
	assertEquals(number.travel("1-2"), "1-2")
	assertEquals(number.travel("1-"), "1-")
	assertEquals(number.travel("1+2-3"), "1+2-3")
	assertEquals(number.travel("1+2-"), "1+2-")
	assertEquals(number.travel("1-2+3-4"), "1-2+3-4")
	assertEquals(number.travel("1-2+3-"), "1-2+3") //TODO: fix, this is weird
})

Deno.test("hoist - deeper left recursion", () => {
	const { number } = Term.hoist(({ number, add, subtract, literal, group }) => {
		return {
			literal: Term.regExp(/[0-9]+/),
			number: Term.or([group, add, subtract, literal]),
			add: Term.list([Term.except(number, [add]), Term.string("+"), number]),
			subtract: Term.list([Term.except(number, [subtract]), Term.string("-"), number]),
			group: Term.list([Term.string("("), number, Term.string(")")]),
		}
	})

	assertEquals(number.translate("1"), "1")
	assertEquals(number.translate("1+2"), "1+2")
	assertEquals(number.translate("1+2-3"), "1+2-3")

	assertEquals(number.translate("(1+2)"), "(1+2)")
	//assertThrows(() => number.translate("(1+2"), Error, 'Expected ")" but found end of input')

	assertEquals(number.translate("(1+2-3)"), "(1+2-3)")
	assertEquals(number.translate("(1+2-(3+4))"), "(1+2-(3+4))")
	assertEquals(number.translate("(1+2-(3+4-5))"), "(1+2-(3+4-5))")

	assertEquals(number.travel("1"), "1")
	assertEquals(number.travel("1+"), "1+")
	assertEquals(number.travel("1+2"), "1+2")
	assertEquals(number.travel("1+2-"), "1+2-")
	assertEquals(number.travel("1+2-3"), "1+2-3")
	assertEquals(number.travel("(1+2)-(3+4)"), "(1+2)-(3+4)")
	assertEquals(number.travel("(1+2)-(3+4-"), "(1+2)-(3+4")
})
