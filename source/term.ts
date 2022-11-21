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

Term.regExp = (regExp: RegExp) => {
	const term = (source: string) => {
		const match = regExp.exec(source)
		if (!match) {
			throw Error(term.error(source))
		}
		return match[0]
	}

	term.error = (source: string) => {
		const snippet = source.slice(0, 10)
		return `Expected '${regExp}' but found '${snippet}'`
	}

	term.type = Term.regExp

	return term
}
