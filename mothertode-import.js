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
		
		//===========//
		// OPERATORS //
		//===========//
		

		MotherTodeFrogasaurus["./term/term.js"].Term = Term
	}



}

//=========//
// EXPORTS //
//=========//
export const Term = MotherTodeFrogasaurus["./term/term.js"].Term

export const MotherTode = {
	Term: MotherTodeFrogasaurus["./term/term.js"].Term,
}