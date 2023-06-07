//=============//
// FROGASAURUS //
//=============//
const MotherTodeFrogasaurus = {}

//========//
// SOURCE //
//========//
{
	//====== ./term.js ======
	{
		MotherTodeFrogasaurus["./term.js"] = {}
		const Term = {}
		
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
						const result = this.emit(selected, options)
						return this.then(result, options)
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
		
			// Find the longest possible snippet that is compatible with the term
			travel(source, options = {}) {
				return this.match(source, options).flat(Infinity).join("")
			},
		
			// What to pass to the emit function
			select(matches, options = {}) {
				return matches.flat(Infinity)
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
		
			travel(source, options = {}) {
				return proxy("travel", source, options)
			},
		
			select(matches, options = {}) {
				return proxy("select", matches, options)
			},
		
			emit(selected, options = {}) {
				return proxy("emit", selected, options)
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
		
			travel(source) {
				let snippet = ""
				for (let i = 0; i < string.length; i++) {
					if (source[i] !== string[i]) {
						break
					}
					snippet += source[i]
				}
				return snippet
			},
		})
		
		Term.regExp = (regExp) => ({
			...Term.default,
			type: "regExp",
			name: `${regExp}`,
		
			match(source) {
				const startRegExp = new RegExp(`^${regExp.source}`)
				const matches = source.match(startRegExp)
				return matches === null ? [] : [matches[0]]
			},
		
			travel(source) {
				const matches = this.match(source)
				return matches.join("")
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
		Term.withEmit = (term, emit) => ({
			...term,
			emit,
		})
		
		//===========//
		// OPERATORS //
		//===========//
		// Match terms in sequence
		Term.list = (terms) => ({
			...Term.default,
			type: "list",
			name: terms.length === 1 ? terms.name : `(${terms.map((term) => term.name).join(", ")})`,
		
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
		
			travel(source, options = {}) {
				let snippet = ""
		
				for (const term of terms) {
					const match = term.match(source, options)
					const travel = term.travel(source, options)
		
					if (match.length === 0) {
						snippet += travel
						break
					}
		
					const termSnippet = match.flat(Infinity).join("")
					snippet += termSnippet
					source = source.slice(termSnippet.length)
				}
		
				return snippet
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
		
			travel(source, options = {}) {
				return term.travel(source, options)
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
		
			travel(source, options = {}) {
				let snippet = ""
		
				while (true) {
					const match = term.match(source, options)
					if (match.length === 0) {
						const travel = term.travel(source, options)
						snippet += travel
						break
					}
		
					const termSnippet = match.flat(Infinity).join("")
					snippet += termSnippet
					source = source.slice(termSnippet.length)
				}
		
				return snippet
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
		
			travel(source, options = {}) {
				let snippet = ""
		
				while (true) {
					const match = term.match(source, options)
					if (match.length === 0) {
						const travel = term.travel(source, options)
						snippet += travel
						break
					}
		
					const termSnippet = match.flat(Infinity).join("")
					snippet += termSnippet
					source = source.slice(termSnippet.length)
				}
		
				return snippet
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
		
			// Return the longest travel snippet of all terms
			travel(source, { exceptions = [], ...options } = {}) {
				let snippet = ""
		
				for (const term of terms) {
					if (exceptions.includes(term)) {
						exceptions = exceptions.filter((exception) => exception !== term)
						continue
					}
					const travel = term.travel(source, { exceptions, ...options })
					if (travel.length > snippet.length) {
						snippet = travel
					}
				}
		
				return snippet
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
		
			throw(source, { exceptions = [], ...options } = {}) {
				const snippets = []
				let length = 0
		
				for (const term of terms) {
					if (exceptions.includes(term)) {
						exceptions = exceptions.filter((exception) => exception !== term)
						snippets.push("")
					}
					const travel = term.travel(source, { exceptions, ...options })
					snippets.push(travel)
					if (travel.length > length) {
						length = travel.length
					}
				}
		
				const longestTerms = snippets
					.map((snippet, index) => (snippet.length === length ? index : null))
					.filter((index) => index !== null)
					.map((index) => terms[index])
		
				// todo: fix: some of the longest terms are not terms or something, they are just arrays
		
				if (longestTerms.length === 1) {
					const term = longestTerms[0]
					return term.throw(source, { exceptions, ...options })
				}
		
				const found = source.length === 0 ? "end of input" : '"' + source.slice(0, Term.ERROR_SNIPPET_LENGTH) + '"'
				const termNames = longestTerms.map((term) => term.toString()).join(" | ")
				const message = `Expected ${termNames} but found ${found}`
		
				return message
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
		
			// Return the longest travel snippet that satisfies all terms
			travel(source, options = {}) {
				let snippet = source
		
				for (let i = 0; i < terms.length; i++) {
					const term = terms[i]
					const travel = term.travel(source, options)
					if (travel.length < snippet.length) {
						snippet = travel
						if (snippet.length === 0) {
							break
						} else {
							i = 0
						}
					}
				}
		
				return snippet
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
		
			travel(source, options = {}) {
				const match = term.match(source, options)
				if (match.length === 0) {
					return source
				}
		
				let snippet = term.travel(source, options)
				while (snippet.length > 0) {
					snippet = snippet.slice(0, -1)
					const match = term.match(snippet, options)
					if (match.length === 0) {
						return snippet
					}
				}
		
				return snippet
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
		

		MotherTodeFrogasaurus["./term.js"].Term = Term
	}



}

//=========//
// EXPORTS //
//=========//
export const Term = MotherTodeFrogasaurus["./term.js"].Term

export const MotherTode = {
	Term: MotherTodeFrogasaurus["./term.js"].Term,
}