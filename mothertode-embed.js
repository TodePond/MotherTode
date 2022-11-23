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
		const Term = class {
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
				return source
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
		
			emit() {
				return this.string
			}
		
			error(source) {
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
				return source.length > 0
			}
		
			emit(source) {
				return source[0]
			}
		
			error(source) {
				return "Expected any character but found none"
			}
		}
		
		Term.end = class extends Term {
			constructor() {
				super("end")
			}
		
			match(source) {
				return source.length === 0
			}
		
			error(source) {
				return "Expected end of source but found more"
			}
		}
		
		Term.nothing = class extends Term {
			constructor() {
				super("nothing")
			}
		
			emit(source) {
				return ""
			}
		}
		
		//===========//
		// OPERATORS //
		//===========//
		Term.list = class extends Term {
			constructor(terms) {
				super("list")
				this.terms = terms
			}
		
			match(source) {
				for (const term of this.terms) {
					if (!term.match(source)) {
						return false
					}
					source = source.slice(term.emit(source).length)
				}
				return true
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