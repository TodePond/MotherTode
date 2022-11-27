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
		const Term = {}
		
		/*
		
		type Tree<T> = [T] | Array<Tree<T>>
		
		type Term = {
			type: string
			translate: (source: string) => string
			test: (source: string) => boolean
			throw: (source: string) => string | undefined
			match: (source: string) => Tree<string>
			select: (...matches: string[]) => Array<string>
			emit: (...selected: string[]) => string
			check: (...selected: string[]) => string
			then: (result: string) => string
		}
		
		*/
		
		//=========//
		// DEFAULT //
		//=========//
		Term.ERROR_SNIPPET_LENGTH = 20
		
		Term.default = {
			type: "anonymous",
		
			// If the source matches the term, translate it
			// Otherwise, throw an error (if the term has one)
			translate(source) {
				const matches = this.match(source)
		
				if (matches.length > 0) {
					const selected = this.select(...matches)
					if (this.check(...selected)) {
						const result = this.emit(...selected)
						return this.then(result)
					}
				}
		
				const error = this.throw(source)
				if (error !== undefined) {
					throw Error(error)
				}
			},
		
			// Does the source satisfy the term?
			test(source) {
				const matches = this.match(source)
				return matches.length > 0
			},
		
			// Find matches for the term in the source
			match(source) {
				return [source]
			},
		
			// What to pass to the check and emit functions
			select(...matches) {
				return matches.flat(Infinity)
			},
		
			// Additional check to perform after selecting
			check(...selected) {
				return true
			},
		
			// What to emit if the term matches
			emit(...selected) {
				return selected.join("")
			},
		
			// What to do after emitting
			then(result) {
				return result
			},
		
			// Error message to throw if the term does not match
			throw(source) {
				const snippet = source.slice(0, Term.ERROR_SNIPPET_LENGTH)
				return `Expected '${this.type}' term but found '${snippet}'`
			},
		}
		
		//============//
		// PRIMITIVES //
		//============//
		Term.string = (string) => ({
			...Term.default,
			type: "string",
		
			match(source) {
				return source.startsWith(string) ? [string] : []
			},
		
			throw(source) {
				if (source.length === 0) {
					return `Expected '${string}' but found end of input`
				}
				const snippet = source.slice(0, string.length)
				return `Expected '${string}' but found '${snippet}'`
			},
		})
		
		Term.regExp = (regExp) => ({
			...Term.default,
			type: "regExp",
		
			match(source) {
				const matches = source.match(regExp)
				return matches === null ? [] : [...matches]
			},
		
			throw(source) {
				if (source.length === 0) {
					return `Expected ${regExp} term but found end of input`
				}
		
				const snippet = source.slice(0, Term.ERROR_SNIPPET_LENGTH)
				return `Expected ${regExp} but found '${snippet}'`
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
		
			throw(source) {
				return `Expected any character but found end of input`
			},
		}
		
		Term.end = {
			...Term.default,
			type: "end",
		
			match(source) {
				return source.length === 0 ? [""] : []
			},
		
			throw(source) {
				const snippet = source.slice(0, Term.ERROR_SNIPPET_LENGTH)
				return `Expected end of input but found '${snippet}'`
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
		Term.emit = (term, emit) => ({
			...term,
			emit,
		})
		
		Term.check = (term, check) => ({
			...term,
			check,
		})
		
		//===========//
		// OPERATORS //
		//===========//
		// Match terms in sequence
		Term.list = (terms) => ({
			...Term.default,
			type: "list",
		
			match(source) {
				const matches = []
		
				for (const term of terms) {
					const match = term.match(source)
					if (match.length === 0) {
						const result = []
						result.progress = matches.length
						result.source = source
						return result
					}
		
					matches.push(match)
					source = source.slice(match.join("").length)
				}
		
				return matches
			},
		
			// Translate each match based on its term
			select(...matches) {
				const selected = []
		
				for (let i = 0; i < terms.length; i++) {
					const term = terms[i]
					const match = matches[i]
					const termSelected = term.select(...match)
					const termEmitted = term.emit(...termSelected)
					selected.push(termEmitted)
				}
		
				return selected
			},
		
			throw(source) {
				const result = this.match(source)
				const term = terms[result.progress]
				return term.throw(result.source)
			},
		})
		
		// Optionally match a term
		Term.maybe = (term) => ({
			...term,
			type: "maybe",
			match(source) {
				const matches = term.match(source)
				if (matches.length === 0) {
					return [""]
				}
				return matches
			},
		})
		
		// Match a term one or more times
		Term.many = (term) => ({
			...term,
			type: "many",
			match(source) {
				const matches = []
		
				while (true) {
					const match = term.match(source)
					if (match.length === 0) {
						break
					}
		
					matches.push(match)
					source = source.slice(match.join("").length)
				}
		
				return matches
			},
		
			// Translate each match
			select(...matches) {
				const selected = []
		
				for (const match of matches) {
					const termSelected = term.select(...match)
					const termEmitted = term.emit(...termSelected)
					selected.push(termEmitted)
				}
		
				return selected
			},
		
			emit(...selected) {
				return selected.join("")
			},
		})
		
		// Match a term zero or more times
		Term.any = (term) => ({
			...term,
			type: "any",
		
			match(source) {
				const matches = []
		
				while (true) {
					const match = term.match(source)
					if (match.length === 0) {
						break
					}
		
					matches.push(match)
					source = source.slice(match.join("").length)
				}
		
				if (matches.length === 0) {
					return [""]
				}
				return matches
			},
		
			// Translate each match
			select(...matches) {
				if (matches.length === 1 && matches[0] === "") {
					return []
				}
		
				const selected = []
		
				for (const match of matches) {
					const termSelected = term.select(...match)
					const termEmitted = term.emit(...termSelected)
					selected.push(termEmitted)
				}
		
				return selected
			},
		
			emit(...selected) {
				return selected.join("")
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