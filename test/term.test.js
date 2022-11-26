import { assertEquals, assertThrows } from "https://deno.land/std@0.165.0/testing/asserts.ts"
import { Term } from "../mothertode-import.js"

//============//
// PRIMITIVES //
//============//
Deno.test("string", () => {
	const helloTerm = new Term.string("hello")

	assertEquals(helloTerm.translate("hello"), "hello")
	assertThrows(() => helloTerm.translate("hi"), Error, "Expected 'hello' but found 'hi'")

	assertEquals(helloTerm.match("hello"), ["hello"])
	assertEquals(helloTerm.match("hi"), [])

	assertEquals(helloTerm.test("hello"), true)
	assertEquals(helloTerm.test("hi"), false)
})

Deno.test("regular expression", () => {
	const helloTerm = new Term.regExp(/hello/)

	assertEquals(helloTerm.translate("hello"), "hello")
	assertThrows(() => helloTerm.translate("hi"), Error, "Expected /hello/ but found 'hi'")

	assertEquals(helloTerm.match("hello"), ["hello"])
	assertEquals(helloTerm.match("hi"), [])

	assertEquals(helloTerm.test("hello"), true)
	assertEquals(helloTerm.test("hi"), false)

	const yoTerm = new Term.regExp(/(?:yo)+/)
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
	assertThrows(() => endTerm.translate("hello"), Error, "Expected end of input but found 'h'")

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
Deno.test("maybe", () => {
	const helloTerm = new Term.string("hello")
	const maybeTerm = new Term.maybe(helloTerm)

	assertEquals(maybeTerm.translate("hello"), "hello")
	assertEquals(maybeTerm.translate("hi"), "")

	assertEquals(maybeTerm.match("hello"), ["hello"])
	assertEquals(maybeTerm.match("hi"), [""])

	assertEquals(maybeTerm.test("hello"), true)
	assertEquals(maybeTerm.test("hi"), true)

	const customTerm = new Term.maybe(
		new Term.extension(helloTerm, {
			emit(string) {
				return string + "!"
			},
		}),
	)

	assertEquals(customTerm.translate("hello"), "hello!")
	assertEquals(customTerm.translate("hi"), "!")
})

Deno.test("many", () => {
	const manyTerm = new Term.many(new Term.string("hello"))

	assertEquals(manyTerm.translate("hello"), "hello")
	assertEquals(manyTerm.translate("hellohello"), "hellohello")
	assertThrows(() => manyTerm.translate(""), Error, "Expected 'hello' but found end of input")

	assertEquals(manyTerm.match("hello"), ["hello"])
	assertEquals(manyTerm.match("hellohello"), ["hello", "hello"])
	assertEquals(manyTerm.match(""), [])

	assertEquals(manyTerm.test("hello"), true)
	assertEquals(manyTerm.test("hellohello"), true)
	assertEquals(manyTerm.test(""), false)
})

Deno.test("list", () => {
	const listTerm = new Term.list([new Term.string("hello"), new Term.string("hi")])

	assertEquals(listTerm.translate("hellohi"), "hellohi")
	assertThrows(() => listTerm.translate("helloh"), Error, "Expected 'hi' but found 'h'")
	assertThrows(() => listTerm.translate("hello"), Error, "Expected 'hi' but found end of input")
	assertThrows(() => listTerm.translate(""), Error, "Expected 'hello' but found end of input")

	assertEquals(listTerm.match("hellohi"), ["hello", "hi"])
	assertEquals(listTerm.match("helloh").length, 0)

	assertEquals(listTerm.test("hellohi"), true)
	assertEquals(listTerm.test("helloh"), false)
})

Deno.test("list - nested", () => {
	const listTerm = new Term.list([
		new Term.string("hello"),
		new Term.list([new Term.string("hi"), new Term.string("yo")]),
	])

	assertEquals(listTerm.translate("hellohiyo"), "hellohiyo")
	assertThrows(() => listTerm.translate("hellohi"), Error, "Expected 'yo' but found end of input")
	assertThrows(() => listTerm.translate("hello"), Error, "Expected 'hi' but found end of input")
	assertThrows(() => listTerm.translate(""), Error, "Expected 'hello' but found end of input")

	assertEquals(listTerm.match("hellohiyo"), ["hello", ["hi", "yo"]])
	assertEquals(listTerm.match("hellohi").length, 0)

	assertEquals(listTerm.test("hellohiyo"), true)
	assertEquals(listTerm.test("hellohi"), false)

	const listTerm2 = new Term.list([
		new Term.string("hello"),
		new Term.list([new Term.string("hi"), new Term.string("yo")]),
		new Term.string("hi"),
	])

	assertEquals(listTerm2.translate("hellohiyohi"), "hellohiyohi")
	assertThrows(() => listTerm2.translate("hellohiyo"), Error, "Expected 'hi' but found end of input")
	assertThrows(() => listTerm2.translate("hellohi"), Error, "Expected 'yo' but found end of input")
	assertThrows(() => listTerm2.translate("hello"), Error, "Expected 'hi' but found end of input")
	assertThrows(() => listTerm2.translate(""), Error, "Expected 'hello' but found end of input")

	assertEquals(listTerm2.match("hellohiyohi"), ["hello", ["hi", "yo"], "hi"])
	assertEquals(listTerm2.match("hellohiyo").length, 0)

	assertEquals(listTerm2.test("hellohiyohi"), true)
	assertEquals(listTerm2.test("hellohiyo"), false)
})

//============//
// EXTENSIONS //
//============//
Deno.test("custom - emit", () => {
	const helloTerm = new Term.string("hello")
	const customTerm = new Term.extension(helloTerm, {
		emit() {
			return this.string.toUpperCase() + "!"
		},
	})

	assertEquals(customTerm.translate("hello"), "HELLO!")
	assertThrows(() => customTerm.translate("hi"), Error, "Expected 'hello' but found 'hi'")

	assertEquals(customTerm.match("hello"), ["hello"])
	assertEquals(customTerm.match("hi"), [])

	assertEquals(customTerm.test("hello"), true)
	assertEquals(customTerm.test("hi"), false)

	const listTerm = new Term.list([customTerm, customTerm])
	//assertEquals(listTerm.translate("hellohello"), "HELLO!HELLO!")
})
