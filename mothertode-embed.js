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
		
			translate(source) {
				if (this.match(source)) {
					if (this.check(source)) {
						return this.emit(source)
					}
				}
		
				if (this.throw(source)) {
					throw Error(this.error(source))
				}
			}
		
			match(source) {
				return true
			}
		
			check(source) {
				return true
			}
		
			error(source) {
				return "Error matching term"
			}
		
			throw(source) {
				return true
			}
		
			emit(source) {
				return source
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
				return source.startsWith(this.string)
			}
		
			emit(source) {
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
				return this.regExp.test(source)
			}
		
			emit(source) {
				return source.match(this.regExp)[0]
			}
		
			error(source) {
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
		

		MotherTodeFrogasaurus["./term/term.js"].Term = Term
	}



}

//=========//
// EXPORTS //
//=========//
const MotherTode = {
	Term: MotherTodeFrogasaurus["./term/term.js"].Term,
}