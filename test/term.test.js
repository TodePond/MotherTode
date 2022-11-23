import { assertEquals, assertThrows } from "https://deno.land/std@0.165.0/testing/asserts.ts"
import { Term } from "../mothertode-import.js"

const it = Deno.test

Deno.test("string literal", () => {
	const helloTerm = new Term.string("Hello")

	assertEquals(helloTerm.translate("Hello"), "Hello")
	assertThrows(() => helloTerm.translate("Goodbye"))

	assertEquals(helloTerm.match("Hello"), true)
	assertEquals(helloTerm.match("Goodbye"), false)
})

Deno.test("regular expression literal", () => {
	const helloTerm = new Term.regExp(/Hello/)

	assertEquals(helloTerm.translate("Hello"), "Hello")
	assertThrows(() => helloTerm.translate("Goodbye"))

	assertEquals(helloTerm.match("Hello"), true)
	assertEquals(helloTerm.match("Goodbye"), false)
})

Deno.test("rest term", () => {
	const restTerm = new Term.rest()

	assertEquals(restTerm.translate("Hello"), "Hello")
	assertEquals(restTerm.translate("Goodbye"), "Goodbye")

	assertEquals(restTerm.match("Hello"), true)
	assertEquals(restTerm.match("Goodbye"), true)
})
