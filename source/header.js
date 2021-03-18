MotherTode = (source) => {
	const result = MotherTode.parse(source)
	const translation = result.output
	let term
	try {
		const func = new Function(translation)
		term = func()
	}
	catch(e) {
		console.error(`[MotherTode] Badly formed JavaScript:\n\n` + translation + "\n\n")
		throw e
	}
	
	console.log(translation)
	
	term.success = result.success
	term.output = result.output
	term.source = result.source
	term.tail = result.tail
	term.input = result.input
	term.args = result.args
	term.error = result.error
	term.log = (...args) => {
		result.log(...args)
		return term
	}
	return term
}

MotherTode.translate = (source) => {
	const result = MotherTode.parse(source)
	return result.output
}

MotherTode.parse = (source) => {
	const result = MotherTode.Term.term("MotherTode", MotherTode.scope)(source)
	if (!result.success) result.log(8)
	return result
}