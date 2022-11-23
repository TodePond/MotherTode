//=============//
// FROGASAURUS //
//=============//
const MotherTodeFrogasaurus: any = {}

//========//
// SOURCE //
//========//
{
	//====== ./term.ts ======
	{
		MotherTodeFrogasaurus["./term.ts"] = {}
		type Term = TermFunction & {
			type: TermType
			error: TermFunction
		}
		
		type TermFunction = (source: string) => string
		type TermType = (...args: any[]) => Term
		
		const Term: { [name: string]: TermType } = {}
		
		Term.string = (string: string) => {
			const term = (source: string) => {
				const snippet = source.slice(0, string.length)
				if (snippet !== string) {
					throw Error(term.error(source))
				}
				return snippet
			}
		
			term.error = (source: string) => {
				const snippet = source.slice(0, string.length)
				return `Expected '${string}' but found '${snippet}'`
			}
		
			term.type = Term.string
		
			return term
		}
		
		Term.regExp = (regExp: RegExp) => {
			const term = (source: string) => {
				const match = regExp.exec(source)
				if (!match) {
					throw Error(term.error(source))
				}
				return match[0]
			}
		
			const SNIPPET_LENGTH = 15
			term.error = (source: string) => {
				const snippetLength = Math.min(SNIPPET_LENGTH, source.length)
				const snippet = source.slice(0, snippetLength)
				return `Expected '${regExp}' but found '${snippet}'`
			}
		
			term.type = Term.regExp
		
			return term
		}
		

		MotherTodeFrogasaurus["./term.ts"].Term = Term
	}



}

//=========//
// EXPORTS //
//=========//
const MotherTode = {
	Term: MotherTodeFrogasaurus["./term.ts"].Term,
}