/*

type Tree<T> = [T] | Array<Tree<T>>

type Term = {
	type: string
	translate: (source: string) => string
	test: (source: string) => boolean
	throw: (source: string) => string | undefined
	match: (source: string) => Tree<string>
	select: (matches: string[]) => Array<string>
	emit: (selected: string[]) => string
	check: (selected: string[]) => string
	then: (result: string) => string
}

*/

export const Term = {}

//=========//
// DEFAULT //
//=========//
Term.ERROR_SNIPPET_LENGTH = 20

Term.default = {
	type: "default",
	name: undefined,

	// If the source matches the term, translate it
	// Otherwise, throw an error (if the term has one)
	translate(source, options = {}) {
		try {
			const matches = this.match(source, options)

			if (matches.length > 0) {
				const selected = this.select(matches, options)
				if (this.check(selected)) {
					const result = this.emit(selected, options)
					return this.then(result, options)
				}
			}

			const error = this.throw(source, options)
			if (error !== undefined) {
				throw Error(error)
			}
		} catch (error) {
			if (error instanceof RangeError) {
				const message = Term.default.throw.apply(this, [source, options])
				throw Error(message)
			} else {
				throw error
			}
		}
	},

	// Does the source satisfy the term?
	test(source, options = {}) {
		const matches = this.match(source, options)
		return matches.length > 0
	},

	// Find matches for the term in the source
	match(source, options = {}) {
		return [source]
	},

	// What to pass to the check and emit functions
	select(matches, options = {}) {
		return matches.flat(Infinity)
	},

	// Additional check to perform after selecting
	check(selected, options = {}) {
		return true
	},

	// What to emit if the term matches
	emit(selected, options = {}) {
		return selected.join("")
	},

	// What to do after emitting
	then(result, options = {}) {
		return result
	},

	// Error message to throw if the term does not match
	throw(source, options = {}) {
		if (source.length === 0) {
			return `Expected ${this.toString(options)} but found end of input`
		}
		return `Expected ${this.toString(options)} but found "${source.slice(0, Term.ERROR_SNIPPET_LENGTH)}"`
	},

	toString(options = {}) {
		if (this.name !== undefined) {
			return this.name
		}
		return this.type
	},
}

//=======//
// PROXY //
//=======//
Term.proxy = (term, proxy) => ({
	...term,
	type: "proxy",

	translate(source, options = {}) {
		return proxy("translate", source, options)
	},

	test(source, options = {}) {
		return proxy("test", source, options)
	},

	match(source, options = {}) {
		return proxy("match", source, options)
	},

	select(matches, options = {}) {
		return proxy("select", matches, options)
	},

	emit(selected, options = {}) {
		return proxy("emit", selected, options)
	},

	check(selected, options = {}) {
		return proxy("check", selected, options)
	},

	then(result, options = {}) {
		return proxy("then", result, options)
	},

	throw(source, options = {}) {
		return proxy("throw", source, options)
	},

	toString(options = {}) {
		return proxy("toString", undefined, options)
	},
})

//=========//
// OPTIONS //
//=========//
Term.options = (term, defaultOptions) => {
	return Term.proxy(term, (methodName, arg, options) => {
		return term[methodName](arg, { ...defaultOptions, ...options })
	})
}

//============//
// PRIMITIVES //
//============//
Term.string = (string) => ({
	...Term.default,
	type: "string",
	name: `"${string}"`,

	match(source) {
		return source.startsWith(string) ? [string] : []
	},
})

Term.regExp = (regExp) => ({
	...Term.default,
	type: "regExp",
	name: `${regExp}`,

	match(source) {
		const startRegExp = new RegExp(`^${regExp.source}`)
		const matches = source.match(startRegExp)
		return matches === null ? [] : [...matches]
	},
})

//===========//
// BUILT-INS //
//===========//
Term.rest = {
	...Term.default,
	type: "rest",
}

Term.anything = {
	...Term.default,
	type: "anything",

	match(source) {
		return source.length > 0 ? [source[0]] : []
	},
}

Term.end = {
	...Term.default,
	type: "end of input",

	match(source) {
		return source.length === 0 ? [""] : []
	},
}

Term.nothing = {
	...Term.default,
	type: "nothing",

	match(source) {
		return [""]
	},
}

//==========//
// OVERRIDE //
//==========//
Term.throw = (term, throw_) => ({
	...term,
	throw: throw_,
})

Term.match = (term, match) => ({
	...term,
	match,
})

Term.select = (term, select) => ({
	...term,
	select,
})

Term.emit = (term, emit) => ({
	...term,
	emit,
})

Term.check = (term, check) => ({
	...term,
	check,
})

Term.then = (term, then) => ({
	...term,
	then,
})

//===========//
// OPERATORS //
//===========//
// Match terms in sequence
Term.list = (terms) => ({
	...Term.default,
	type: "list",
	name: `(${terms.map((term) => term.name).join(", ")})`,

	match(source, options = {}) {
		const matches = []

		for (const term of terms) {
			const match = term.match(source, options)
			if (match.length === 0) {
				const result = []
				result.term = term
				result.source = source
				return result
			}

			matches.push(match)
			const snippet = match.flat(Infinity).join("")
			source = source.slice(snippet.length)
		}

		return matches
	},

	// Translate each match based on its term
	select(matches, options = {}) {
		const selected = []

		for (let i = 0; i < terms.length; i++) {
			const term = terms[i]
			const match = matches[i]
			const termSelected = term.select(match, options)
			const termEmitted = term.emit(termSelected, options)
			selected.push(termEmitted)
		}

		return selected
	},

	throw(source, options = {}) {
		const result = this.match(source, options)
		return result.term.throw(result.source, options)
	},
})

// Optionally match a term
Term.maybe = (term) => ({
	...term,
	type: "maybe",
	name: `[${term.name}]`,

	match(source, options = {}) {
		const matches = term.match(source, options)
		if (matches.length === 0) {
			return [""]
		}
		return matches
	},

	select(matches, options = {}) {
		const [match] = matches
		if (match === "") {
			return [""]
		}
		return term.select(matches, options)
	},
})

// Match a term one or more times
Term.many = (term) => ({
	...term,
	type: "many",
	name: `(${term.name})+`,
	match(source, options = {}) {
		const matches = []

		while (true) {
			const match = term.match(source, options)
			if (match.length === 0) {
				break
			}

			matches.push(match)
			const snippet = match.flat(Infinity).join("")
			source = source.slice(snippet.length)
		}

		return matches
	},

	// Translate each match
	select(matches, options = {}) {
		const selected = []

		for (const match of matches) {
			const termSelected = term.select(match, options)
			const termEmitted = term.emit(termSelected, options)
			selected.push(termEmitted)
		}

		return selected
	},

	emit(selected, options = {}) {
		return selected.join("")
	},
})

// Match a term zero or more times
Term.any = (term) => ({
	...term,
	type: "any",
	name: `{${term.name}}`,

	match(source, options = {}) {
		const matches = []

		while (true) {
			const match = term.match(source, options)
			if (match.length === 0) {
				break
			}

			matches.push(match)
			const snippet = match.flat(Infinity).join("")
			source = source.slice(snippet.length)
		}

		if (matches.length === 0) {
			return [""]
		}
		return matches
	},

	// Translate each match
	select(matches, options = {}) {
		if (matches.length === 1 && matches[0] === "") {
			return []
		}

		const selected = []

		for (const match of matches) {
			const termSelected = term.select(match, options)
			const termEmitted = term.emit(termSelected, options)
			selected.push(termEmitted)
		}

		return selected
	},

	emit(selected) {
		return selected.join("")
	},
})

Term.or = (terms) => ({
	...Term.default,
	type: "or",
	name: `(${terms.map((term) => term.name).join(" | ")})`,

	match(source, { exceptions = [], ...options } = {}) {
		for (const term of terms) {
			if (exceptions.includes(term)) {
				exceptions = exceptions.filter((exception) => exception !== term)
				continue
			}
			const match = term.match(source, { exceptions, ...options })
			match.term = term
			if (match.length > 0) {
				const matches = [match]
				matches.term = term
				return matches
			}
		}

		return []
	},

	select(matches, options = {}) {
		const selected = []

		for (const match of matches) {
			const term = match.term
			const termSelected = term.select(match, options)
			const termEmitted = term.emit(termSelected, options)
			selected.push(termEmitted)
		}

		return selected
	},

	throw(source, options = {}) {
		// TODO: travel along each term to find the longest match!
		return Term.default.throw.apply(this, [source, options])
	},

	toString({ exceptions = [], ...options } = {}) {
		return `(${terms
			.filter((term) => !exceptions.includes(term))
			.map((term) => term.toString({ ...exceptions, ...options }))
			.join(" | ")})`
	},
})

Term.except = (term, exceptions) => {
	return Term.proxy(term, (methodName, arg, options) => {
		const optionExceptions = options.exceptions || []
		const mergedExceptions = [...optionExceptions, ...exceptions]
		const mergedOptions = { ...options, exceptions: mergedExceptions }
		return term[methodName](arg, mergedOptions)
	})
}

Term.and = (terms) => ({
	...Term.default,
	type: "and",
	name: `"("${terms.map((term) => term.name).join(" & ")}")"`,

	match(source) {
		let matches = []

		for (const term of terms) {
			const match = term.match(source)
			if (match.length === 0) {
				const result = []
				result.term = term
				return result
			}

			matches = match
		}

		return matches
	},

	throw(source) {
		const result = this.match(source)
		return result.term.throw(source)
	},

	select(matches) {
		const term = terms.at(-1)
		return term.select(matches)
	},

	emit(selected) {
		const term = terms.at(-1)
		return term.emit(selected)
	},

	toString(options) {
		return `${"("}${terms.toString(options).join(" & ")}${")"}`
	},
})

Term.not = (term) => ({
	...Term.default,
	type: "not",
	name: `!${term.name}`,

	match(source) {
		const match = term.match(source)
		if (match.length === 0) {
			return [source]
		}
		return []
	},
})

//=======//
// SCOPE //
//=======//
Term.references = new Map()
Term.reference = (object, property) => {
	if (Term.references.has(object)) {
		const references = Term.references.get(object)
		if (references.has(property)) {
			return references.get(property)
		}
	} else {
		Term.references.set(object, new Map())
	}

	const reference = Term.proxy(Term.default, (methodName, arg, options) => {
		return object[property][methodName](arg, options)
	})

	reference.name = property

	Term.references.get(object).set(property, reference)
	return reference
}

// declare: (references) => terms
Term.hoist = (declare) => {
	const terms = {}
	const references = new Proxy(terms, {
		get(target, key) {
			return Term.reference(target, key)
		},
	})

	const declared = declare(references)
	for (const key in declared) {
		terms[key] = declared[key]
	}

	return terms
}

// TODO: this is messy, clean it up
