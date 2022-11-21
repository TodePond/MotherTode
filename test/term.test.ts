import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts"
import { Term } from "../source/term.ts"

Deno.test("string literal term", () => {
	const helloTerm = Term.string("Hello")
	const snippet = helloTerm("Hello world!")
	assertEquals(snippet, "Hello")
})
