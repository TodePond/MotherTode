import { assertEquals, assertThrows } from "https://deno.land/std@0.165.0/testing/asserts.ts"
import { Term } from "../mothertode-import.js"

//============//
// PRIMITIVES //
//============//
Deno.test("string", () => {
	const helloTerm = Term.string("hello")

	assertEquals(helloTerm.translate("hello"), "hello")
	assertThrows(() => helloTerm.translate("hi"), Error, 'Expected "hello" but found "hi"')

	assertEquals(helloTerm.match("hello"), ["hello"])
	assertEquals(helloTerm.match("hi"), [])

	assertEquals(helloTerm.test("hello"), true)
	assertEquals(helloTerm.test("hi"), false)
})

Deno.test("regular expression", () => {
	const helloTerm = Term.regExp(/hello/)

	assertEquals(helloTerm.translate("hello"), "hello")
	assertThrows(() => helloTerm.translate("hi"), Error, 'Expected /hello/ but found "hi"')

	assertEquals(helloTerm.match("hello"), ["hello"])
	assertEquals(helloTerm.match("hi"), [])

	assertEquals(helloTerm.test("hello"), true)
	assertEquals(helloTerm.test("hi"), false)

	const yoTerm = Term.regExp(/(?:yo)+/)
	assertEquals(yoTerm.translate("yo"), "yo")
	assertEquals(yoTerm.translate("yoyoyo"), "yoyoyo")

	assertEquals(yoTerm.match("yo"), ["yo"])
	assertEquals(yoTerm.match("yoyoyo"), ["yoyoyo"])
	assertEquals(yoTerm.match("yolo"), ["yo"])
	assertEquals(yoTerm.match("yoyolo"), ["yoyo"])
	assertEquals(yoTerm.match("hi"), [])

	assertEquals(yoTerm.test("yo"), true)
	assertEquals(yoTerm.test("yoyoyo"), true)
	assertEquals(yoTerm.test("hi"), false)
})

//================//
// BUILT-IN TERMS //
//================//
Deno.test("rest", () => {
	const restTerm = Term.rest

	assertEquals(restTerm.translate("hello"), "hello")
	assertEquals(restTerm.translate("hi"), "hi")

	assertEquals(restTerm.match("hello"), ["hello"])
	assertEquals(restTerm.match("hi"), ["hi"])

	assertEquals(restTerm.test("hello"), true)
	assertEquals(restTerm.test("hi"), true)
})

Deno.test("anything", () => {
	const anyTerm = Term.anything

	assertEquals(anyTerm.translate("hello"), "h")
	assertEquals(anyTerm.translate("hi"), "h")

	assertEquals(anyTerm.match("hello"), ["h"])
	assertEquals(anyTerm.match("hi"), ["h"])
	assertEquals(anyTerm.match(""), [])

	assertEquals(anyTerm.test("hello"), true)
	assertEquals(anyTerm.test("hi"), true)
	assertThrows(() => anyTerm.translate(""), Error, "Expected any character but found end of input")
})

Deno.test("end", () => {
	const endTerm = Term.end

	assertEquals(endTerm.translate(""), "")
	assertThrows(() => endTerm.translate("hello"), Error, 'Expected end of input but found "hello"')

	assertEquals(endTerm.match(""), [""])
	assertEquals(endTerm.match("hello"), [])

	assertEquals(endTerm.test(""), true)
	assertEquals(endTerm.test("hello"), false)
})

Deno.test("nothing", () => {
	const nothingTerm = Term.nothing

	assertEquals(nothingTerm.translate("hello"), "")
	assertEquals(nothingTerm.translate(""), "")

	assertEquals(nothingTerm.match("hello"), [""])
	assertEquals(nothingTerm.match(""), [""])

	assertEquals(nothingTerm.test("hello"), true)
	assertEquals(nothingTerm.test(""), true)
})

//===========//
// OPERATORS //
//===========//
Deno.test("list", () => {
	const listTerm = Term.list([Term.string("hello"), Term.string("hi")])

	assertEquals(listTerm.translate("hellohi"), "hellohi")
	assertThrows(() => listTerm.translate("helloh"), Error, 'Expected "hi" but found "h"')
	assertThrows(() => listTerm.translate("hello"), Error, 'Expected "hi" but found end of input')
	assertThrows(() => listTerm.translate(""), Error, 'Expected "hello" but found end of input')

	assertEquals(listTerm.match("hellohi"), [["hello"], ["hi"]])
	assertEquals(listTerm.match("helloh").length, 0)

	assertEquals(listTerm.test("hellohi"), true)
	assertEquals(listTerm.test("helloh"), false)

	const customTerm = Term.emit(listTerm, ([hello, hi]) => `${hello} ${hi}`)
	assertEquals(customTerm.translate("hellohi"), "hello hi")
	assertThrows(() => customTerm.translate("helloh"), Error, 'Expected "hi" but found "h"')

	const shoutTerm = Term.emit(Term.string("hello"), (hello) => hello + "!")
	const listShoutTerm = Term.list([shoutTerm, shoutTerm])
	assertEquals(listShoutTerm.translate("hellohello"), "hello!hello!")
	assertThrows(() => listShoutTerm.translate("hello"), Error, 'Expected "hello" but found end of input')
})

Deno.test("list - nested", () => {
	const listTerm = Term.list([Term.string("hello"), Term.list([Term.string("hi"), Term.string("yo")])])

	assertEquals(listTerm.translate("hellohiyo"), "hellohiyo")
	assertThrows(() => listTerm.translate("hellohi"), Error, 'Expected "yo" but found end of input')
	assertThrows(() => listTerm.translate("hello"), Error, 'Expected "hi" but found end of input')
	assertThrows(() => listTerm.translate(""), Error, 'Expected "hello" but found end of input')

	assertEquals(listTerm.match("hellohiyo"), [["hello"], [["hi"], ["yo"]]])
	assertEquals(listTerm.match("hellohi").length, 0)

	assertEquals(listTerm.test("hellohiyo"), true)
	assertEquals(listTerm.test("hellohi"), false)

	const listTerm2 = Term.list([
		Term.string("hello"),
		Term.list([Term.string("hi"), Term.string("yo")]),
		Term.string("hi"),
	])

	assertEquals(listTerm2.translate("hellohiyohi"), "hellohiyohi")
	assertThrows(() => listTerm2.translate("hellohiyo"), Error, 'Expected "hi" but found end of input')
	assertThrows(() => listTerm2.translate("hellohi"), Error, 'Expected "yo" but found end of input')
	assertThrows(() => listTerm2.translate("hello"), Error, 'Expected "hi" but found end of input')
	assertThrows(() => listTerm2.translate(""), Error, 'Expected "hello" but found end of input')

	assertEquals(listTerm2.match("hellohiyohi"), [["hello"], [["hi"], ["yo"]], ["hi"]])
	assertEquals(listTerm2.match("hellohiyo").length, 0)

	assertEquals(listTerm2.test("hellohiyohi"), true)
	assertEquals(listTerm2.test("hellohiyo"), false)

	const customTerm = Term.emit(listTerm, ([hello, hiyo]) => `${hello} ${hiyo}`)
	assertEquals(customTerm.translate("hellohiyo"), "hello hiyo")
	assertEquals(customTerm.match("hellohiyo"), [["hello"], [["hi"], ["yo"]]])
	assertThrows(() => customTerm.translate("hellohi"), Error, 'Expected "yo" but found end of input')

	const shoutTerm = Term.emit(Term.string("hello"), (hello) => hello + "!")
	const listShoutTerm = Term.list([shoutTerm, Term.list([shoutTerm, shoutTerm])])
	assertEquals(listShoutTerm.translate("hellohellohello"), "hello!hello!hello!")
	assertEquals(listShoutTerm.match("hellohellohello"), [["hello"], [["hello"], ["hello"]]])
	assertThrows(() => listShoutTerm.translate("hellohello"), Error, 'Expected "hello" but found end of input')
})

Deno.test("maybe", () => {
	const helloTerm = Term.string("hello")
	const maybeTerm = Term.maybe(helloTerm)

	assertEquals(maybeTerm.translate("hello"), "hello")
	assertEquals(maybeTerm.translate("hi"), "")

	assertEquals(maybeTerm.match("hello"), ["hello"])
	assertEquals(maybeTerm.match("hi"), [""])

	assertEquals(maybeTerm.test("hello"), true)
	assertEquals(maybeTerm.test("hi"), true)

	const customTerm = Term.emit(maybeTerm, (string) => string + "!")
	assertEquals(customTerm.match("hello"), ["hello"])
	assertEquals(customTerm.translate("hello"), "hello!")
	assertEquals(customTerm.translate("hi"), "!")

	const shoutTerm = Term.emit(Term.string("hello"), (hello) => hello + "!")
	const maybeShoutTerm = Term.maybe(shoutTerm)
	assertEquals(maybeShoutTerm.match("hello"), ["hello"])
	assertEquals(maybeShoutTerm.translate("hello"), "hello!")
	assertEquals(maybeShoutTerm.match("hi"), [""])
})

Deno.test("many", () => {
	const manyTerm = Term.many(Term.string("hello"))

	assertEquals(manyTerm.translate("hello"), "hello")
	assertEquals(manyTerm.translate("hellohello"), "hellohello")
	assertThrows(() => manyTerm.translate(""), Error, 'Expected "hello"+ but found end of input')

	assertEquals(manyTerm.match("hello"), [["hello"]])
	assertEquals(manyTerm.match("hellohello"), [["hello"], ["hello"]])
	assertEquals(manyTerm.match(""), [])

	assertEquals(manyTerm.test("hello"), true)
	assertEquals(manyTerm.test("hellohello"), true)
	assertEquals(manyTerm.test(""), false)

	const shoutTerm = Term.emit(Term.string("hello"), (hello) => hello + "!")
	const manyShoutTerm = Term.many(shoutTerm)
	assertEquals(manyShoutTerm.translate("hello"), "hello!")
	assertEquals(manyShoutTerm.translate("hellohello"), "hello!hello!")
})

// Test matching zero or more terms
Deno.test("any", () => {
	const anyTerm = Term.any(Term.string("hello"))

	assertEquals(anyTerm.translate("hello"), "hello")
	assertEquals(anyTerm.translate("hellohello"), "hellohello")
	assertEquals(anyTerm.translate(""), "")

	assertEquals(anyTerm.match("hello"), [["hello"]])
	assertEquals(anyTerm.match("hellohello"), [["hello"], ["hello"]])
	assertEquals(anyTerm.match(""), [""])

	assertEquals(anyTerm.test("hello"), true)
	assertEquals(anyTerm.test("hellohello"), true)
	assertEquals(anyTerm.test(""), true)

	const shoutTerm = Term.emit(Term.string("hello"), (hello) => hello + "!")
	const anyShoutTerm = Term.any(shoutTerm)
	assertEquals(anyShoutTerm.translate("hello"), "hello!")
	assertEquals(anyShoutTerm.translate("hellohello"), "hello!hello!")
	assertEquals(anyShoutTerm.translate(""), "")
})

Deno.test("or", () => {
	const orTerm = Term.or([Term.string("hello"), Term.string("hi")])

	assertEquals(orTerm.translate("hello"), "hello")
	assertEquals(orTerm.translate("hi"), "hi")
	assertThrows(() => orTerm.translate("yo"), Error, 'Expected ("hello" | "hi") but found "yo"')

	assertEquals(orTerm.match("hello")[0][0], "hello")
	assertEquals(orTerm.match("hi")[0][0], "hi")
	assertEquals(orTerm.match("yo").length, 0)

	assertEquals(orTerm.test("hello"), true)
	assertEquals(orTerm.test("hi"), true)
	assertEquals(orTerm.test("yo"), false)

	const shoutTerm = Term.emit(Term.string("hello"), ([hello]) => hello + "!")
	const orShoutTerm = Term.or([shoutTerm, Term.string("hi")])
	assertEquals(orShoutTerm.translate("hello"), "hello!")
	assertEquals(orShoutTerm.translate("hi"), "hi")
	assertThrows(() => orShoutTerm.translate("yo"), Error, 'Expected ("hello" | "hi") but found "yo"')

	const orTerm2 = Term.or([Term.string("hello"), Term.string("hi"), Term.string("yo")])
	assertEquals(orTerm2.translate("hello"), "hello")
	assertEquals(orTerm2.translate("hi"), "hi")
	assertEquals(orTerm2.translate("yo"), "yo")
	assertThrows(() => orTerm2.translate("wassup"), Error, 'Expected ("hello" | "hi" | "yo") but found "wassup"')
})

Deno.test("and", () => {
	const andTerm = Term.and([Term.string("hello"), Term.regExp(/hello/)])

	assertEquals(andTerm.translate("hello"), "hello")
	assertThrows(() => andTerm.translate("hi"), Error, 'Expected "hello" but found "hi"')

	assertEquals(andTerm.match("hello"), ["hello"])
	assertEquals(andTerm.match("hi").length, 0)

	const andTerm2 = Term.and([Term.regExp(/[yo]+/), Term.string("yo")])
	assertEquals(andTerm2.translate("yo"), "yo")
	assertEquals(andTerm2.translate("yoyo"), "yo")

	assertEquals(andTerm2.match("yo"), ["yo"])
	assertEquals(andTerm2.match("yoyo"), ["yo"])
})

Deno.test("not", () => {
	const notTerm = Term.not(Term.string("hello"))

	assertEquals(notTerm.translate("hi"), "hi")
	assertThrows(() => notTerm.translate("hello"), Error, 'Expected !"hello" but found "hello"')

	assertEquals(notTerm.match("hi"), ["hi"])
	assertEquals(notTerm.match("hello").length, 0)

	const notTerm2 = Term.and([Term.regExp(/[a-z]+/), Term.not(Term.string("hello"))])
	assertEquals(notTerm2.translate("hi"), "hi")
	assertThrows(() => notTerm2.translate("hello"), Error, 'Expected !"hello" but found "hello"')

	assertEquals(notTerm2.match("hi"), ["hi"])
	assertEquals(notTerm2.match("hello").length, 0)
})

Deno.test("or - except", () => {
	const helloTerm = Term.string("hello")
	const hiTerm = Term.string("hi")
	const orTerm = Term.or([helloTerm, hiTerm])

	assertEquals(orTerm.translate("hi", { exceptions: [helloTerm] }), "hi")
	assertThrows(
		() => orTerm.translate("hello", { exceptions: [helloTerm] }),
		Error,
		'Expected ("hi") but found "hello"',
	)

	assertEquals(orTerm.match("hi", { exceptions: [helloTerm] })[0][0], "hi")
	assertEquals(orTerm.match("hello", { exceptions: [helloTerm] }).length, 0)
})

Deno.test("declare", () => {
	const [numberTerm] = Term.declare((number, literal, add) => {
		const _literal = Term.regExp(/[0-9]+/)
		const _number = Term.or([add, literal])
		const _add = Term.emit(
			Term.list([Term.except(number, [add]), Term.string("+"), number]),
			([a, _, b]) => parseInt(a) + parseInt(b),
		)
		return [_number, _literal, _add]
	})

	assertEquals(numberTerm.translate("1"), "1")
	assertEquals(numberTerm.translate("1+2"), "3")
	assertEquals(numberTerm.translate("1+2+3"), "6")
	assertEquals(numberTerm.translate("1+2+3+4"), "10")
	assertEquals(numberTerm.translate("1+2+3+4+5"), "15")
})
