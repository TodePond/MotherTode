import { assertEquals, assertThrows } from "https://deno.land/std@0.165.0/testing/asserts.ts"
import { Term } from "../mothertode-import.js"

const it = Deno.test

Deno.test("string literal", () => {
	const helloTerm = new Term.string("hello")

	assertEquals(helloTerm.translate("hello"), "hello")
	assertThrows(() => helloTerm.translate("bye"))

	assertEquals(helloTerm.match("hello"), ["hello"])
	assertEquals(helloTerm.match("bye"), [])

	assertEquals(helloTerm.test("hello"), true)
	assertEquals(helloTerm.test("bye"), false)
})

Deno.test("regular expression literal", () => {
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
})
/*
Deno.test("rest term", () => {
	const restTerm = new Term.rest()

	assertEquals(restTerm.translate("hello"), "hello")
	assertEquals(restTerm.translate("bye"), "bye")

	assertEquals(restTerm.match("hello"), true)
	assertEquals(restTerm.match("bye"), true)
})

Deno.test("any term", () => {
	const anyTerm = new Term.any()

	assertEquals(anyTerm.translate("hello"), "h")
	assertEquals(anyTerm.translate("bye"), "b")

	assertEquals(anyTerm.match("hello"), true)
	assertEquals(anyTerm.match("bye"), true)
})

Deno.test("end term", () => {
	const endTerm = new Term.end()

	assertEquals(endTerm.translate(""), "")
	assertThrows(() => endTerm.translate("hello"))

	assertEquals(endTerm.match(""), true)
	assertEquals(endTerm.match("hello"), false)
})

Deno.test("nothing term", () => {
	const nothingTerm = new Term.nothing()

	assertEquals(nothingTerm.translate("hello"), "")
	assertEquals(nothingTerm.translate(""), "")

	assertEquals(nothingTerm.match("hello"), true)
	assertEquals(nothingTerm.match(""), true)
})
*/
