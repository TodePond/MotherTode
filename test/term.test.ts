import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts"
import { Term } from "../source/term.ts"

Deno.test("string literal term", () => {
	const helloTerm = Term.string("Hello")
	const helloSnippet = helloTerm("Hello world!")
	assertEquals(helloSnippet, "Hello")
})

Deno.test("regExp term", () => {
	const helloTerm = Term.regExp(/Hello/)
	const snippet = helloTerm("Hello world!")
	assertEquals(snippet, "Hello")
}