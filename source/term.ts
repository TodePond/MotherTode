type Term = TermFunction & {
	type: TermType
	error: TermFunction
}

type TermFunction = (source: string) => string
type TermType = (...args: any[]) => Term

export const Term: { [name: string]: TermType } = {}

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
