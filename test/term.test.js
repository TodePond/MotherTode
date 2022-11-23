import { assertEquals, assertThrows } from "https://deno.land/std@0.165.0/testing/asserts.ts"
import { Term } from "../mothertode-import.js"

const it = Deno.test

Deno.test("string", () => {
	const helloTerm = new Term.string("hello")

	assertEquals(helloTerm.translate("hello"), "hello")
	assertThrows(() => helloTerm.translate("bye"))

	assertEquals(helloTerm.match("hello"), ["hello"])
	assertEquals(helloTerm.match("bye"), [])

	assertEquals(helloTerm.test("hello"), true)
	assertEquals(helloTerm.test("bye"), false)
})

Deno.test("regular expression", () => {
	const helloTerm = new Term.regExp(/hello/)

	assertEquals(helloTerm.translate("hello"), "hello")
	assertThrows(() => helloTerm.translate("bye"))

	assertEquals(helloTerm.match("hello"), ["hello"])
	assertEquals(helloTerm.match("bye"), [])

	assertEquals(helloTerm.test("hello"), true)
	assertEquals(helloTerm.test("bye"), false)

	const yoTerm = new Term.regExp(/(?:yo)+/)
	assertEquals(yoTerm.translate("yo"), "yo")
	assertEquals(yoTerm.translate("yoyoyo"), "yoyoyo")

	assertEquals(yoTerm.match("yo"), ["yo"])
	assertEquals(yoTerm.match("yoyoyo"), ["yoyoyo"])
	assertEquals(yoTerm.match("yolo"), ["yo"])
	assertEquals(yoTerm.match("yoyolo"), ["yoyo"])
	assertEquals(yoTerm.match("bye"), [])

	assertEquals(yoTerm.test("yo"), true)
	assertEquals(yoTerm.test("yoyoyo"), true)
	assertEquals(yoTerm.test("bye"), false)
})

Deno.test("rest", () => {
	const restTerm = new Term.rest()

	assertEquals(restTerm.translate("hello"), "hello")
	assertEquals(restTerm.translate("bye"), "bye")

	assertEquals(restTerm.match("hello"), ["hello"])
	assertEquals(restTerm.match("bye"), ["bye"])

	assertEquals(restTerm.test("hello"), true)
	assertEquals(restTerm.test("bye"), true)
})

Deno.test("any", () => {
	const anyTerm = new Term.any()

	assertEquals(anyTerm.translate("hello"), "h")
	assertEquals(anyTerm.translate("bye"), "b")

	assertEquals(anyTerm.match("hello"), ["h"])
	assertEquals(anyTerm.match("bye"), ["b"])
	assertEquals(anyTerm.match(""), [])

	assertEquals(anyTerm.test("hello"), true)
	assertEquals(anyTerm.test("bye"), true)
	assertThrows(() => anyTerm.translate(""))
})

Deno.test("end", () => {
	const endTerm = new Term.end()

	assertEquals(endTerm.translate(""), "")
	assertThrows(() => endTerm.translate("hello"))

	assertEquals(endTerm.match(""), [""])
	assertEquals(endTerm.match("hello"), [])

	assertEquals(endTerm.test(""), true)
	assertEquals(endTerm.test("hello"), false)
})

Deno.test("nothing", () => {
	const nothingTerm = new Term.nothing()

	assertEquals(nothingTerm.translate("hello"), "")
	assertEquals(nothingTerm.translate(""), "")

	assertEquals(nothingTerm.match("hello"), [""])
	assertEquals(nothingTerm.match(""), [""])

	assertEquals(nothingTerm.test("hello"), true)
	assertEquals(nothingTerm.test(""), true)
})
