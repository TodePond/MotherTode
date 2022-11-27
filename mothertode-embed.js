//=============//
// FROGASAURUS //
//=============//
const MotherTodeFrogasaurus = {}

//========//
// SOURCE //
//========//
{
	//====== ./term/term.js ======
	{
		MotherTodeFrogasaurus["./term/term.js"] = {}
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
		
		const Term = {}
		
		//=========//
		// DEFAULT //
		//=========//
		Term.ERROR_SNIPPET_LENGTH = 20
		
		Term.default = {
			type: "anonymous",
		
			// If the source matches the term, translate it
			// Otherwise, throw an error (if the term has one)
			translate(source, options = {}) {
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
				return `${this.type} term`
			},
		}
		
		//=========//
		// OPTIONS //
		//=========//
		Term.options = (term, defaultOptions) => ({
			...Term.default,
			type: "options",
		
			translate(source, options = {}) {
				return term.translate(source, { ...defaultOptions, ...options })
			},
		
			test(source, options = {}) {
				return term.test(source, { ...defaultOptions, ...options })
			},
		
			match(source, options = {}) {
				return term.match(source, { ...defaultOptions, ...options })
			},
		
			select(matches, options = {}) {
				return term.select(matches, { ...defaultOptions, ...options })
			},
		
			emit(selected, options = {}) {
				return term.emit(selected, { ...defaultOptions, ...options })
			},
		
			check(selected, options = {}) {
				return term.check(selected, { ...defaultOptions, ...options })
			},
		
			then(result, options = {}) {
				return term.then(result, { ...defaultOptions, ...options })
			},
		
			throw(source, options = {}) {
				return term.throw(source, { ...defaultOptions, ...options })
			},
		
			toString(options = {}) {
				return term.toString({ ...defaultOptions, ...options })
			},
		})
		
		//============//
		// PRIMITIVES //
		//============//
		Term.string = (string) => ({
			...Term.default,
			type: "string",
		
			match(source) {
				return source.startsWith(string) ? [string] : []
			},
		
			toString() {
				return `"${string}"`
			},
		})
		
		Term.regExp = (regExp) => ({
			...Term.default,
			type: "regExp",
		
			match(source) {
				const matches = source.match(regExp)
				return matches === null ? [] : [...matches]
			},
		
			toString() {
				return `${regExp}`
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
		
			toString() {
				return "any character"
			},
		}
		
		Term.end = {
			...Term.default,
			type: "end",
		
			match(source) {
				return source.length === 0 ? [""] : []
			},
		
			toString() {
				return "end of input"
			},
		}
		
		Term.nothing = {
			...Term.default,
			type: "nothing",
		
			match(source) {
				return [""]
			},
		
			toString() {
				return "nothing"
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
		
			toString(options = {}) {
				return `${terms.map((term) => term.toString(options)).join(", ")}`
			},
		})
		
		// Optionally match a term
		Term.maybe = (term) => ({
			...term,
			type: "maybe",
			match(source, options = {}) {
				const matches = term.match(source, options)
				if (matches.length === 0) {
					return [""]
				}
				return matches
			},
		
			toString(options = {}) {
				return `[${term.toString(options)}]`
			},
		})
		
		// Match a term one or more times
		Term.many = (term) => ({
			...term,
			type: "many",
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
		
			toString(options = {}) {
				return `${term.toString(options)}+`
			},
		})
		
		// Match a term zero or more times
		Term.any = (term) => ({
			...term,
			type: "any",
		
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
		
			toString(options = {}) {
				return `{${term.toString(options)}}`
			},
		})
		
		Term.or = (terms) => ({
			...Term.default,
			type: "or",
		
			match(source, { exceptions = [], ...options } = {}) {
				const exceptionsRemaining = new Set(exceptions)
				for (const term of terms) {
					if (exceptionsRemaining.has(term)) {
						exceptionsRemaining.delete(term)
						continue
					}
					const match = term.match(source, { ...exceptionsRemaining, ...options })
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
		
			toString({ exceptions = [], ...options } = {}) {
				return `${"("}${terms
					.filter((term) => !exceptions.includes(term))
					.map((term) => term.toString({ ...exceptions, ...options }))
					.join(" | ")}${")"}`
			},
		})
		
		Term.and = (terms) => ({
			...Term.default,
			type: "and",
		
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
		
			toString() {
				return `${"("}${terms.join(" & ")}${")"}`
			},
		})
		
		Term.not = (term) => ({
			...Term.default,
			type: "not",
		
			match(source) {
				const match = term.match(source)
				if (match.length === 0) {
					return [source]
				}
				return []
			},
		
			toString() {
				return `!${term}`
			},
		})
		

		MotherTodeFrogasaurus["./term/term.js"].Term = Term
	}



}

//=========//
// EXPORTS //
//=========//
const MotherTode = {
	Term: MotherTodeFrogasaurus["./term/term.js"].Term,
}