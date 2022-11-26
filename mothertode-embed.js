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
		//=========//
		// DEFAULT //
		//=========//
		const Term = class {
			constructor(type = "anonymous") {
				this.type = type
			}
		
			// If the term matches the source, translate it
			// Otherwise, (maybe) throw an error
			translate(source) {
				const matches = this.match(source)
		
				if (matches.length > 0) {
					const selected = this.select(matches)
					if (this.check(...selected)) {
						const result = this.emit(...selected)
						return this.then(result)
					}
				}
		
				const error = this.throw(source)
				if (error !== undefined) {
					throw Error(error)
				}
			}
		
			// Does the source satisfy the term?
			test(source) {
				return this.match(source).length > 0 && this.check(source)
			}
		
			// Find matches for the term in the source
			match(source) {
				return [source]
			}
		
			// What to pass through to the check and emit functions
			select(matches) {
				return matches.flat(Infinity)
			}
		
			// What to emit if the term matches the source
			emit(...selected) {
				return selected.join("")
			}
		
			// Additional checks to perform after matching
			check(...selected) {
				return true
			}
		
			// After translating, what to do with the result
			then(result) {
				return result
			}
		
			// Error message to throw if the term does not match the source
			throw(source) {
				return "Error matching term"
			}
		
			// For debugging: What to translate (and print) when the term is created
			print(message) {
				if (message === undefined) return
				return this.translate(message)
			}
		}
		
		//===========//
		// EXTENSION //
		//===========//
		Term.extension = class extends Term {
			constructor(base, extension) {
				super("extension")
				this.base = base
				this.extension = extension
				Object.assign(this, base)
				Object.assign(this, extension)
			}
		
			route(method, [args]) {
				if (this.extension[method] !== undefined) {
					return this.extension[method](args)
				}
				return this.base[method].apply(this, [args])
			}
		
			translate(source) {
				return this.route("translate", [source])
			}
		
			test(source) {
				return this.route("test", [source])
			}
		
			match(source) {
				return this.route("match", [source])
			}
		
			select(matches) {
				return this.route("select", [matches])
			}
		
			emit(...selected) {
				return this.route("emit", [...selected])
			}
		
			check(...selected) {
				return this.route("check", [...selected])
			}
		
			then(result) {
				return this.route("then", [result])
			}
		
			throw(source) {
				return this.route("throw", [source])
			}
		
			print(message) {
				return this.route("print", [message])
			}
		}
		
		//============//
		// PRIMITIVES //
		//============//
		Term.string = class extends Term {
			constructor(string) {
				super("string")
				this.string = string
			}
		
			match(source) {
				return source.startsWith(this.string) ? [this.string] : []
			}
		
			throw(source) {
				if (source.length === 0) {
					return `Expected '${this.string}' but found end of input`
				}
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
				return `Expected ${this.regExp} but found '${snippet}'`
			}
		}
		
		//===========//
		// BUILT-INS //
		//===========//
		Term.rest = new Term.extension(new Term(), { type: "rest" })
		Term.anything = new Term.extension(new Term(), {
			type: "anything",
			match(source) {
				return source.length > 0 ? [source[0]] : []
			},
			throw(source) {
				return "Expected any character but found end of input"
			},
		})
		
		Term.end = new Term.extension(new Term(), {
			type: "end",
			match(source) {
				return source.length === 0 ? [""] : []
			},
			throw(source) {
				return `Expected end of input but found '${source[0]}'`
			},
		})
		
		Term.nothing = new Term.extension(new Term(), {
			type: "nothing",
			match(source) {
				return [""]
			},
		})
		
		//===========//
		// OPERATORS //
		//===========//
		// Match terms in sequence
		Term.list = class extends Term {
			constructor(terms) {
				super("list")
				this.terms = terms
			}
		
			match(source) {
				const matches = []
		
				for (const term of this.terms) {
					const termMatches = term.match(source)
					if (termMatches.length === 0) {
						const result = []
						result.progress = matches.length
						result.source = source
						return result
					}
		
					if (termMatches.length === 1) {
						matches.push(termMatches[0])
					} else {
						matches.push(termMatches)
					}
					source = source.slice(termMatches.join("").length)
				}
		
				return matches
			}
		
			throw(source) {
				const result = this.match(source)
				const term = result.progress === -1 ? this.skip : this.terms[result.progress]
				return term.throw(result.source)
			}
		}
		
		// Optionally match a term
		Term.maybe = class extends Term {
			constructor(term) {
				return new Term.extension(term, {
					type: "maybe",
					match(source) {
						const matches = term.match(source)
						if (matches.length === 0) {
							return [""]
						}
						return matches
					},
				})
			}
		}
		
		// Match a term one or more times
		Term.many = class extends Term {
			constructor(term) {
				super("many")
				this.term = term
			}
		
			match(source) {
				const matches = []
		
				while (true) {
					const termMatches = this.term.match(source)
					if (termMatches.length === 0) {
						break
					}
		
					matches.push(...termMatches)
					source = source.slice(termMatches.join("").length)
				}
		
				return matches
			}
		
			throw(source) {
				return this.term.throw(source)
			}
		}
		
		// Match a term zero or more times
		Term.any = class extends Term {
			constructor(term) {
				super("any")
				this.term = term
			}
		
			match(source) {
				const matches = []
		
				while (true) {
					const termMatches = this.term.match(source)
					if (termMatches.length === 0) {
						break
					}
		
					matches.push(...termMatches)
					source = source.slice(termMatches.join("").length)
				}
		
				if (matches.length === 0) {
					return [""]
				}
		
				return matches
			}
		}
		

		MotherTodeFrogasaurus["./term/term.js"].Term = Term
	}



}

//=========//
// EXPORTS //
//=========//
const MotherTode = {
	Term: MotherTodeFrogasaurus["./term/term.js"].Term,
}