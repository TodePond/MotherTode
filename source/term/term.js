export const Term = class {
	constructor(type = "anonymous") {
		this.type = type
	}

	// If the term matches the source, translate it
	translate(source) {
		const matches = this.match(source)

		if (matches.length > 0) {
			const selected = this.select(matches)
			if (this.check(...selected)) {
				return this.emit(...selected)
			}
		}

		if (this.throw(source)) {
			const error = this.throw(source)
			if (error !== undefined) {
				throw Error(error)
			}
		}
	}

	// Does the source satisfy the term?
	test(source) {
		return this.match(source).length > 0 && this.check(source)
	}

	// Find a match for the term in the source
	match(source) {
		return [source]
	}

	// Which matches to select (and pass through to check and emit)
	select(matches) {
		return matches
	}

	// Error message to throw if the term does not match the source
	throw(source) {
		return "Error matching term"
	}

	// Additional checks to perform after matching
	check(...selected) {
		return true
	}

	// What to emit if the term matches the source
	emit(...selected) {
		return selected.join("")
	}

	// After translating, what to do with the result
	then() {
		return
	}
}

//==========//
// LITERALS //
//==========//
Term.string = class extends Term {
	constructor(string) {
		super("string")
		this.string = string
	}

	match(source) {
		return source.startsWith(this.string) ? [this.string] : []
	}

	throw(source) {
		return `Expected '${this.string}' but found '${source.slice(0, this.string.length)}'`
	}
}

Term.regExp = class extends Term {
	constructor(regExp) {
		super("regExp")
		this.regExp = regExp
	}

	match(source) {
		const matches = source.match(this.regExp)
		return matches ? [...matches] : []
	}

	throw(source) {
		const SNIPPET_LENGTH = 15
		const snippet = source.slice(0, SNIPPET_LENGTH)
		return `Expected '${this.regExp}' but found '${snippet}'`
	}
}

//===========//
// BUILT-INS //
//===========//
Term.rest = class extends Term {
	constructor() {
		super("rest")
	}
}

Term.any = class extends Term {
	constructor() {
		super("any")
	}

	match(source) {
		return source.length > 0 ? [source[0]] : []
	}

	throw(source) {
		return "Expected any character but found nothing"
	}
}

Term.end = class extends Term {
	constructor() {
		super("end")
	}

	match(source) {
		return source.length === 0 ? [""] : []
	}

	throw(source) {
		return "Expected end of source but found something"
	}
}

Term.nothing = class extends Term {
	constructor() {
		super("nothing")
	}

	match(source) {
		return [""]
	}
}

//===========//
// OPERATORS //
//===========//
Term.maybe = class extends Term {
	constructor(term) {
		super("maybe")
		this.term = term
	}

	match(source) {
		const matches = this.term.match(source)
		return matches.length > 0 ? matches : [""]
	}
}
