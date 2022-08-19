//======//
// Term //
//======//
{
	
	Term = {}
	MotherTode.Term = Term
	
	const STYLE_SUCCESS = `font-weight: bold; color: rgb(0, 128, 255)`
	const STYLE_FAILURE = `font-weight: bold; color: rgb(255, 70, 70)`
	const STYLE_DEPTH = `font-weight: bold;`
	
	Term.result = ({type, success, source, output = source, tail, term, error = "", children = []} = {}) => {
		const self = (input = "", args = {exceptions: []}) => {			
			const result = [...children]
			result.success = success
			result.output = output
			result.source = source
			result.tail = tail === undefined? input : tail
			result.term = term
			result.error = error
			
			result.input = input
			result.args = cloneArgs(args)
			result.toString = function() { return this.output }
			return result
		}
		return self
	}
	
	Term.succeed = (properties = {}) => Term.result({...properties, success: true})
	Term.fail    = (properties = {}) => Term.result({...properties, success: false})
	
	Term.string = (string) => {
		const term = (input = "", args = {exceptions: []}) => {
			const snippet = input.slice(0, term.string.length)
			const success = snippet === term.string
			if (!success) return Term.fail({
				term,
			})(input, args)
			return Term.succeed({
				source: term.string,
				tail: input.slice(term.string.length),
				term,
				children: [],
			})(input, args)
		}
		term.resolve = () => term.string
		term.string = string
		term.type = Term.string
		return term
	}
	
	Term.regExp = (regExp) => {
		if (typeof regExp === "string") {
			regExp = RegExp(regExp)
		}
		const term = (input = "", args = {exceptions: []}) => {
			const finiteRegExp = new RegExp("^" + term.regExp.source + "$")
			let i = 0
			while (i <= input.length) {
				const snippet = input.slice(0, i)
				const success = finiteRegExp.test(snippet)
				if (success) return Term.succeed({
					source: snippet,
					tail: input.slice(snippet.length),
					term,
					children: [],
				})(input, args)
				i++
			}
			return Term.fail({
				term,
			})(input, args)
		}
		term.resolve = () => term.regExp.source
		term.regExp = regExp
		term.type = Term.regExp
		return term
	}
	
	const cloneArgs = (args = {exceptions: []}) => {
		const clone = {...args}
		if (args.exceptions !== undefined) clone.exceptions = [...args.exceptions]
		return clone
	}
	
	Term.list = (terms) => {
		const self = (input = "", args = {exceptions: []}) => {
			
			const state = {
				input,
				i: 0,
			}
			
			const results = []
			
			while (state.i < self.terms.length) {
				const clonedArgs = cloneArgs(args)
				const term = self.terms[state.i]
				if (typeof term !== "function") console.log(term)
				const result = term(state.input, clonedArgs)
				results.push(result)
				if (!result.success) break
				else {
					state.input = result.tail
				}
				state.i++
			}
			
			const success = state.i >= self.terms.length
			if (!success) {
				return Term.fail({
					self,
					children: results,
					term: self,
				})(input, args)
			}
			
			const source = results.map(result => result.source).join("")
			
			//let error = `Found ${self.toLogString()} with '${source}'`
			return Term.succeed({
				output: results.map(result => result.output).join(""),
				source,
				tail: state.input,
				term: self,
				children: results,
			})(input, args)
			
		}

		self.terms = terms
		self.type = Term.list
		return self
	}
	
	Term.or = (terms) => {
		const self = (input = "", args = {exceptions: []}) => {
			
			const state = {
				i: 0,
				exceptions: args.exceptions === undefined? [] : [...args.exceptions]
			}
			const results = []
			
			const terms = self.terms
			
			while (state.i < terms.length) {
				const term = terms[state.i]
				const newArgs = {...args}
				newArgs.exceptions = [...state.exceptions]
				if (term.resolve !== undefined) {
					if (state.exceptions.some(e => e.resolve && e.resolve() === term.resolve())) {
						state.i++
						//console.log(state.exceptions)
						state.exceptions = state.exceptions.filter(e => e.resolve && e.resolve() !== term.resolve())
						continue
					}
				}
				const result = term(input, newArgs)
				results.push(result)
				if (result.success) {
					const finalResult = Term.succeed({
						output: result.output,
						source: result.source,
						tail: result.tail,
						term: self,
						children: [...result/*, rejects*/]
					})(input, args)
					finalResult.winner = term
					return finalResult
				}
				state.i++
			}
			
			return Term.fail({
				term: self,
				children: results,
			})(input, args)
		}
		
		self.type = Term.or
		self.terms = terms
		return self
	}
	
	Term.maybe = (term) => {
		const self = (input = "", args = {exceptions: []}) => {
			const result = self.term(input, args)
			if (!result.success) {
				result.success = true
				result.trueSuccess = false
				result.source = result.source === undefined? "": result.source
				result.output = result.output === undefined? "": result.output
			}
			else result.trueSuccess = true
			result.error = result.error
			result.term = self
			return result
		}
		self.type = Term.maybe
		self.term = term
		return self
	}
	
	Term.many = (term) => {
		const self = (input = "", args = {exceptions: []}) => {
			
			const state = {
				input,
				i: 0,
			}
			
			const results = []
			
			while (true) {
				const clonedArgs = cloneArgs(args)
				const result = self.term(state.input, clonedArgs)
				results.push(result)
				if (!result.success) break
				state.input = result.tail
				state.i++
			}
			
			const success = results.length > 1
			if (!success) {
				return Term.fail({
					term: self,
					children: results,
				})(input, args)
			}
			const source = results.map(result => result.source).join("")
			return Term.succeed({
				output: results.map(result => result.output).join(""),
				source,
				tail: state.input,
				term: self,
				children: results.slice(0, -1),
			})(input, args)
		}
		self.term = term
		self.type = Term.many
		return self
	}
	
	Term.args = (term, func) => {
		const self = (input = "", args = {exceptions: []}) => {
			const newArgs = self.func(cloneArgs(args), input)
			const result = self.term(input, newArgs)
			result.term = self
			return result
		}
		self.type = Term.args
		self.term = term
		self.func = func
		return self
	}
	
	Term.emit = (term, func) => {
		if (typeof func !== "function") {
			const value = func
			func = () => value
		}
		const self = (input = "", args = {exceptions: []}) => {
			const result = self.term(input, args)
			result.term = self
			if (result.success) result.output = self.func(result)
			return result
		}
		self.type = Term.emit
		self.term = term
		self.func = func
		return self
	}
	
	Term.check = (term, func) => {
		if (typeof func !== "function") {
			const value = func
			func = () => value
		}
		const self = (input = "", args = {exceptions: []}) => {
			const result = self.term(input, args)
			if (!result.success) {
				return result
			}
			const checkResult = self.func(result)
			if (checkResult) {
				return result
			}
			return Term.fail({
				term: self,
				children: [...result],
			})(input, args)
		}
		self.type = Term.check
		self.term = term
		self.func = func
		return self
	}
	
	Term.eof = (input = "", args = {exceptions: []}) => {
		if (input.length === 0) return Term.succeed({
			source: "",
			tail: "",
			term: Term.eof,
			error: `Found end of file`,
		})(input, args)
		return Term.fail({
			term: Term.eof,
			error: `Expected end of file but got '${input}'`,
		})(input, args)
	}
	Term.eof.type = Term.eof
	
	Term.except = (term, exceptions) => {
		const self = (input = "", args = {exceptions: []}) => {
			const exceptions = args.exceptions === undefined? [] : args.exceptions
			const result = self.term(input, {...args, exceptions: [...exceptions, ...self.exceptions]})
			result.term = self
			return result
		}
		self.type = Term.except
		self.term = term
		self.exceptions = exceptions
		return self
	}
	
	Term.any = (term) => {
		const self = (input = "", args = {exceptions: []}) => {
			const result = self.term(input, {...args, exceptions: []})
			result.term = self
			return result
		}
		self.type = Term.any
		self.term = term
		return self
	}
	
	const getResultKey = (name, input = "", args = {exceptions: []}) => {
		const lines = []
		lines.push(name)
		lines.push(input)
		for (const key in args) {
			if (key === "exceptions") {
				lines.push("exceptions:" + args.exceptions.map(exception => exception.id.toString()))
				continue
			}
			const value = args[key]
			if (typeof value === "number") {
				lines.push(key + ":" + value)
				continue
			}
			
			if (typeof value === "string") {
				lines.push(key + `:"` + value + `"`)
				continue
			}
			
			if (typeof value === "boolean") {
				lines.push(key + `:` + value)
				continue
			}

			if (typeof value === "object" && value instanceof Array) {
				
				const keys = []
				for (const v of value) {
					const type = typeof v
					if (type === "number") keys.push(value.toString())
					else if (type === "string") keys.push('"' + value + '"')
					else if (type === "boolean") keys.push(value.toString())
					else break
				}
				if (keys.length === value.length) {
					lines.push(keys.join(","))
					//console.log(lines)
					continue
				}
			}
			
			throw new Error("[MotherTode] Unimplemented: I don't know how to cache these arguments correctly...")
		}
		return lines.join("|")
	}
	
	Term.export = (term, global, name) => {
		global[name] = term
		return term
	}
	Term.export.type = Term.export
	
	const resultCachess = []
	Term.resetCache = () => {
		for (const caches of resultCachess) {
			caches.clear()
		}
	}
	
	const getValue = (object, key) => {
		if (object === undefined) return
		const [head, ...tail] = key.split(".")
		if (tail.length === 0) return object[head]
		const result = getValue(object[head], tail.join("."))
		if (result !== undefined) return result
		return getValue(object, tail.join("."))
	}
	
	const setValue = (object, key, value) => {
		const [head, tail] = key.split(".")
		if (tail === undefined) {
			object[head] = value
			return
		}
		return setValue(object[head], tail, value)
	}
	
	const termCaches = new Map()
	let termCount = 0
	Term.terms = []
	
	Term.term = (key, object) => {
		
		// Get term from cache
		let termCache = termCaches.get(object)
		if (termCache === undefined) {
			termCache = {}
			termCaches.set(object, termCache)
		}
		
		if (termCache[key] !== undefined) {
			return termCache[key]
		}
		
		// Create term
		const resultCaches = new Map()
		resultCachess.push(resultCaches)
		const id = termCount++
		
		const self = (input = "", args = {exceptions: []}) => {
			
			const term = self.resolve()
			
			const resultKey = getResultKey(key, input, args)
			const resultCache = resultCaches.get(resultKey)
			if (resultCache !== undefined) {
				//print("Use cache for:", resultKey)
				return resultCache
			}
			
			const result = term(input, args)
			if (result.success) {
				//result.error = `Found ${self.toLogString()}: ${result.error}`
				result.error = /*`Found ${self.toLogString()}: ` + */`${result.error}`
			}
			else {
				result.error = /*`Expected ${self.toLogString()}:` + */ `${result.error}`
			}
			
			const cachedResult = Term.result({
				success: result.success,
				source: result.source,
				output: result.output,
				tail: result.tail,
				term: result.term,
				children: [...result],
			})(input, args)
			
			resultCaches.set(resultKey, cachedResult)
			return result
		}
		
		self.resolve = () => {
		
			// Allow for scope override
			if (object.isScope) {
				object = object.term
			}
			
			const term = getValue(object, key)
			
			if (term === undefined) {
				throw new Error(`[MotherTode] Unrecognised term: '${key}'`)
			}
			return term
		}
		
		// DON'T do this yet. Do it the first time we access the term
		self.id = id
		Term.terms[id] = key
		
		termCache[key] = self
		
		return self
	}
	
	Term.chain = (first, second) => {
		const self = (input = "", args = {exceptions: []}) => {
			const firstResult = self.first(input, args)
			if (!firstResult.success) {
				firstResult.error = /*`(Chained) ` + */firstResult.error
				return firstResult
			}
			
			const secondResult = self.second(firstResult.output, args)
			//secondResult.error = `Found translation: ` + firstResult.error + "\n\n" + secondResult.error
			return secondResult
			
		}
		self.type = Term.chain
		self.first = first
		self.second = second
		return self
	}
	
	Term.subTerms = (term, subTerms) => {
		for (const [name, value] of subTerms) {
			if (term[name] !== undefined) throw new Error(`[MotherTode] Sub-term '${name}' is already declared`)
			term[name] = value
		}
		return term
	}
	Term.subTerms.type = Term.subTerms
	
	Term.select = (term, ids) => {
		const self = (input = "", args = {exceptions: []}) => {
			const result = self.term(input, args)
			const children = ids.map(id => result[id])
			return Term.result({
				success: result.success,
				output: result.output,
				source: result.source,
				tail: result.tail,
				term: result.term,
				error: result.error,
				children,
			})(input, args)
		}
		self.type = Term.select
		self.term = term
		self.ids = ids
		return self
	}
	
	Term.reterm = (result, term) => {
		const children = result.map(c => c)
		return Term.result({
			success: result.success,
			output: result.output,
			source: result.source,
			tail: result.tail,
			term,
			children,
		})(result.input, result.args)
	}
	
}
