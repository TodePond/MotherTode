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
