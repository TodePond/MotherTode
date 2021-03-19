{
	window.MotherTode = (source) => {
		const result = MotherTode.parse(source)
		const translation = result.output
		let term
		try {
			const func = new Function("Term = MotherTode.Term", translation)
			term = func(MotherTode.Term)
		}
		catch(e) {
			console.error(`[MotherTode] Badly formed JavaScript:\n\n` + translation + "\n\n")
			throw e
		}
		
		if (window.LOLOL === true) console.log("")
		window.LOLOL = true
		console.log(source)
		//console.log(lint(translation))
		
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
		term.getUsefulError = result.getUsefulError
		return term
	}
	
	// TODO: make an actual linter (this one is a fake)
	const lint = (input) => {
		const state = {
			position: 0,
			indent: "",
			output: "",
		}
		while (state.position < input.length) {
			if (checkString(input, state, `[`)) {
				state.indent += "	"
				state.output += `[\n${state.indent}`
				continue
			}
			if (checkString(input, state, `]`)) {
				state.indent = state.indent.slice(0, -1)
				state.output += `\n${state.indent}]`
				continue
			}
			if (checkString(input, state, `\n`)) {
				state.output += `\n${state.indent}`
				continue
			}
			state.output += input[state.position]
			state.position++
		}
		return state.output
	}
	
	const checkString = (input, state, string) => {
		const {position} = state
		const end = position + string.length
		const snippet = input.slice(position, end)
		if (snippet === string) {
			state.position = end
			return true
		}
		return false
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
}

{
	const scope = {}
	MotherTode.scope = scope
	MotherTode.install = () => {
		const Term = MotherTode.Term
	
		scope.MotherTode = Term.args(
			Term.error(
				Term.emit(
					Term.list([
						Term.term("GroupInner", scope),
						Term.eof,
					]),
					([{output}]) => {
						const lines = []
						lines.push(`const scope = {isScope: true}`)
						lines.push(`const term = ${output}`)
						lines.push(`scope.term = term`)
						lines.push("return term")
						return lines.join("\n")
					},
				),
				({error}) => error,
			),
			() => ({exceptions: [], indentSize: 0, scopePath: ""}),
		)
		
		scope.Term = Term.or([
			Term.term("Except", scope),
			Term.term("Or", scope),
			Term.term("Maybe", scope),
			Term.term("Many", scope),
			Term.term("Any", scope),
			
			Term.term("HorizontalDefinition", scope),
			Term.term("HorizontalList", scope),
			
			Term.term("GapReference", scope),
			Term.term("EOFReference", scope),
			Term.term("Reference", scope),
			
			Term.term("Group", scope),
			Term.term("MaybeGroup", scope),
			Term.term("AnyGroup", scope),
			Term.term("OrGroup", scope),
			Term.term("String", scope),
			Term.term("RegExp", scope),
			//Term.term("NoExceptions", scope),
		])
		
		scope.GapReference = Term.emit(
			Term.string("_"),
			"Term.many(Term.regExp(/ |	/))",
		)
		
		scope.EOFReference = Term.emit(
			Term.string("EOF"),
			"Term.eof",
		)
		
		scope.Reference = Term.emit(
			Term.list([
				Term.term("Name", scope),
				Term.maybe(
					Term.many(
						Term.list([
							Term.string("."),
							Term.term("Name", scope),
						])
					)
				),
			]),
			(name) => {
				const str = `Term.term('${name.args.scopePath}${name}', scope)`
				console.log(str)
				return str
			}
		)
		
		const makeDefinition = (options = {}, indentSize) => {
			const {
				match = `Term.string('')`,
				emit,
				check,
				error,
				chain,
				args,
				subTerm,
				exp,
			} = options
			
			let definition = match
			if (check !== undefined) {
				definition = `Term.check(${definition}, ${check})`
			}
			if (error !== undefined) {
				definition = `Term.error(${definition}, ${error})`
			}
			if (chain !== undefined) {
				definition = `Term.chain(${chain}, ${definition})`
			}
			if (args !== undefined) {
				definition = `Term.args(${definition}, ${args})`
			}
			if (emit !== undefined) {
				definition = `Term.emit(${definition}, ${emit})`
			}
			if (subTerm !== undefined) {
				const subTermsCode = subTerm.map(([name, value]) => `['${name}', ${value}]`).join(`, `)
				definition = `Term.subTerms(${definition}, [${subTermsCode}])`
			}
			if (exp !== undefined) {
				definition = `Term.export(${definition}, window, "${exp[0]}")`
			}
			return definition
		}
		
		const PROPERTY_NAMES = [
			"match",
			"emit",
			"check",
			"error",
			"chain",
			"args",
			"subTerm",
			"exp",
		]
		
		scope.HorizontalDefinition = Term.emit(
			Term.list([
				Term.term("DefinitionProperty", scope),
				Term.maybe(
					Term.many(
						Term.list([
							Term.term("Gap", scope),
							Term.term("DefinitionProperty", scope),
						])
					)
				),
			]),
			(result) => {
				const entries = new Function(`return [${result}]`)()
				const options = {}
				for (const property of entries) {
					for (const propertyName of PROPERTY_NAMES) {
						const propertyValue = property[propertyName]
						if (propertyValue !== undefined) {
							if (propertyName == "subTerm") {
								if (options.subTerm === undefined) options.subTerm = []
								options.subTerm.push(propertyValue)
								continue
							}
							if (options[propertyName] !== undefined) {
								result.success = false
								return
							}
							options[propertyName] = propertyValue
						}
					}
				}
				
				const definition = makeDefinition(options, result.args.indentSize)
				return definition
				
			}
		)
		
		scope.DefinitionEntry = Term.or([
			Term.term("Export", scope),
			Term.term("DefinitionProperty", scope),
			Term.term("Declaration", scope),
		])
		
		scope.Name = Term.many(Term.regExp(/[a-zA-Z_$]/))
		
		scope.Declaration = Term.emit(
			Term.args(
				Term.list([
					Term.term("Name", scope),
					Term.maybe(Term.term("Gap", scope)),
					Term.term("Term", scope),
				]),
				(args, input) => {
					const nameResult = scope.Name(input)
					if (!nameResult.success) return args
					const name = nameResult.output
					args.scopePath += name + "."
					//args.d
					return args
				}
			),
			([name, gap, term]) => {
				return `{subTerm: [\`${name}\`, \`${sanitise(term.output)}\`]},`
			}
		)
		
		scope.Export = Term.emit(
			Term.list([
				Term.string("export"),
				Term.maybe(Term.term("Gap", scope)),
				Term.term("Reference", scope),
			]),
			([exp, gap, term]) => {
				const name = term.output.split("'")[1]
				return `{exp: ["${name}", "${term}"]},`
			}
		)
		
		scope.VerticalDefinition = Term.emit(
			Term.list([
				Term.term("DefinitionEntry", scope),
				Term.maybe(
					Term.many(
						Term.list([
							Term.term("NewLine", scope),
							Term.term("DefinitionEntry", scope),
						])
					)
				),
			]),
			(result) => {
				const entries = new Function(`return [${result}]`)()
				const options = {}
				for (const property of entries) {
					for (const propertyName of PROPERTY_NAMES) {
						const propertyValue = property[propertyName]
						if (propertyValue !== undefined) {
							if (propertyName == "subTerm") {
								if (options.subTerm === undefined) options.subTerm = []
								options.subTerm.push(propertyValue)
								continue
							}
							if (options[propertyName] !== undefined) {
								result.success = false
								return
							}
							options[propertyName] = propertyValue
						}
					}
				}
				
				const definition = makeDefinition(options, result.args.indentSize)
				return definition
			},
		)
		
		scope.DefinitionProperty = Term.or([
			Term.term("MatchProperty", scope),
			Term.term("EmitProperty", scope),
			Term.term("CheckProperty", scope),
			Term.term("ErrorProperty", scope),
			Term.term("ArgsProperty", scope),
			Term.term("ChainProperty", scope),
		])
		
		const sanitise = (string) => string.split("`").join("\\`")
		
		scope.MatchProperty = Term.emit(
			Term.list([
				Term.string("::"),
				Term.maybe(Term.term("Gap", scope)),
				Term.term("Term", scope),
			]),
			([operator, gap, term = {}]) => `{match: \`${sanitise(term.output)}\`}, `,
		)
		
		scope.ChainProperty = Term.emit(
			Term.list([
				Term.string("++"),
				Term.maybe(Term.term("Gap", scope)),
				Term.term("Term", scope),
			]),
			([operator, gap, term = {}]) => `{chain: \`${sanitise(term.output)}\`}, `,
		)
		
		scope.EmitProperty = Term.emit(
			Term.list([
				Term.string(">>"),
				Term.maybe(Term.term("Gap", scope)),
				Term.term("JavaScript", scope),
			]),
			([operator, gap, term = {}]) => `{emit: \`${sanitise(term.output)}\`},`,
		)
		
		scope.CheckProperty = Term.emit(
			Term.list([
				Term.string("??"),
				Term.maybe(Term.term("Gap", scope)),
				Term.term("JavaScript", scope),
			]),
			([operator, gap, term = {}]) => `{check: \`${sanitise(term.output)}\`},`,
		)
		
		scope.ErrorProperty = Term.emit(
			Term.list([
				Term.string("!!"),
				Term.maybe(Term.term("Gap", scope)),
				Term.term("JavaScript", scope),
			]),
			([operator, gap, term = {}]) => `{error: \`${sanitise(term.output)}\`},`,
		)
		
		scope.ArgsProperty = Term.emit(
			Term.list([
				Term.string("@@"),
				Term.maybe(Term.term("Gap", scope)),
				Term.term("JavaScript", scope),
			]),
			([operator, gap, term = {}]) => `{args: \`${sanitise(term.output)}\`},`,
		)
		
		scope.JavaScript = Term.emit(
			Term.or([
				Term.term("JavaScriptMultiple", scope),
				Term.term("JavaScriptSingle", scope),
			]),
			({output}) => {
				const state = {
					escape: false,
					output: "",
				}
				for (let i = 0; i < output.length; i++) {
					const c = output[i]
					if (state.escape) {
						state.output += c
						state.escape = false
					}
					else if (c === "\\" && output[i+1] === "n") state.output += "\\\\\\\\"
					else if (c === "\\") state.escape = true
					else if (c === "'") state.output += "`"
					else if (c === "#") state.output += "\\$"
					else state.output += c
				}
				return state.output
			}
		)
		
		scope.JavaScriptSingle = Term.term("Line", scope)
		scope.JavaScriptMultiple = Term.list([
			Term.term("Line", scope),
			Term.args(
				Term.term("JavaScriptMultipleInner", scope),
				(args) => {
					args.indentSize++
					return args
				}
			),
			Term.term("Line", scope),
		])
		
		scope.JavaScriptMultipleInner = Term.list([
			Term.term("NewLine", scope),
			Term.term("JavaScriptLines", scope),
			Term.term("Unindent", scope),
		])
		
		scope.JavaScriptLines = Term.list([
			Term.term("Line", scope),
			Term.maybe(
				Term.many(
					Term.list([
						Term.term("NewLine", scope),
						Term.term("Line", scope),
					])
				)
			)
		])
		
		scope.Line = Term.list([
			Term.many(Term.regExp(/[^\n]/)),
		])
		
		scope.Many = Term.emit(
			Term.list([
				Term.except(Term.term("Term", scope), [Term.term("Many", scope)]),
				Term.maybe(Term.term("Gap", scope)),
				Term.check(
					Term.string("+"),
					(result) => result.tail[0] !== "+",
				),
			]),
			([term]) => `Term.many(${term})`,
		)
		
		scope.Except = Term.emit(
			Term.list([
				Term.except(Term.term("Term", scope), [Term.term("Except", scope)]),
				Term.maybe(Term.term("Gap", scope)),
				Term.string("~"),
				Term.maybe(Term.term("Gap", scope)),
				Term.term("Term", scope),
			]),
			([left, gap1, operator, gap2, right]) => `Term.except(${left}, [${right}])`,
		)
		
		scope.NoExceptions = Term.emit(
			Term.list([
				Term.string("any"),
				Term.maybe(Term.term("Gap", scope)),
				Term.term("Term", scope),
			]),
			([keyword, gap, term]) => `Term.any(${term})`,
		)
		
		scope.Or = Term.emit(
			Term.list([
				Term.except(Term.term("Term", scope), [Term.term("Or", scope)]),
				Term.term("OrTails", scope),
			]),
			([head, tail = []]) => `Term.or([${head},\n${tail}])`,
		)
		
		scope.OrTail = Term.emit(
			Term.list([
				Term.maybe(Term.term("Gap", scope)),
				Term.string("|"),
				Term.maybe(Term.term("Gap", scope)),
				Term.except(Term.term("Term", scope), [Term.term("Or", scope)]),
			]),
			([gap1, operator, gap2, term]) => `${term}`,
		)
		
		scope.OrTails = Term.emit(
			Term.many(Term.term("OrTail", scope)),
			(tails) => tails.filter(t => t.success).map(t => t.output).join(`,\n`),
		)
		
		scope.Maybe = Term.emit(
			Term.list([
				Term.except(Term.term("Term", scope), [Term.term("Maybe", scope)]),
				Term.maybe(Term.term("Gap", scope)),
				Term.check(
					Term.string("?"),
					(result) => result.tail[0] !== "?" //
				),
			]),
			([term]) => `Term.maybe(${term})`,
		)
		
		scope.Any = Term.emit(
			Term.list([
				Term.except(Term.term("Term", scope), [Term.term("Any", scope)]),
				Term.maybe(Term.term("Gap", scope)),
				Term.string("*"),
			]),
			([term]) => `Term.maybe(Term.many(${term}))`,
		)
		
		scope.MaybeGroup = Term.emit(
			Term.list([
				Term.string("["),
				Term.term("GroupInner", scope),
				Term.string("]"),
			]),
			([left, inner]) => `Term.maybe(${inner})`,
		)
		
		scope.AnyGroup = Term.emit(
			Term.list([
				Term.string("{"),
				Term.term("GroupInner", scope),
				Term.string("}"),
			]),
			([left, inner]) => `Term.maybe(Term.many(${inner}))`,
		)
		
		scope.OrGroup = Term.emit(
			Term.list([
				Term.string("<"),
				Term.term("ArrayInner", scope),
				Term.string(">"),
			]),
			([left, inner]) => `Term.or([${inner}])`,
		)
		
		scope.Group = Term.emit(
			Term.list([
				Term.string("("),
				Term.term("GroupInner", scope),
				Term.string(")"),
			]),
			([left, inner]) => `${inner}`,
		)
		
		scope.ArrayInner = Term.or([
			Term.term("HorizontalArrayInner", scope),
			Term.emit(
				Term.args(
					Term.term("VerticalArrayInner", scope),
					(args) => {
						args.indentSize++
						return args
					}
				),
				(array) => `${array}`
			)
		])
		
		scope.GroupInner = Term.or([
			Term.term("HorizontalGroupInner", scope),
			Term.args(
				Term.term("VerticalGroupInner", scope),
				(args) => {
					args.indentSize++
					return args
				}
			)
		])
		
		scope.HorizontalArrayInner = Term.emit(
			Term.list([
				Term.maybe(Term.term("Gap", scope)),
				Term.or([
					Term.except(Term.term("HorizontalArray", scope), [Term.term("HorizontalList", scope)]),
					Term.except(Term.term("Term", scope), []),
				]),
				Term.maybe(Term.term("Gap", scope)),
			]),
			([left, inner]) => `${inner}`,
		)
		
		scope.VerticalArrayInner = Term.emit(
			Term.list([
				Term.term("NewLine", scope),
				Term.or([
					Term.term("VerticalArray", scope),
					Term.term("Term", scope),
				]),
				Term.term("Unindent", scope),
			]),
			([left, inner]) => `${inner}`,
		)
		
		scope.HorizontalGroupInner = Term.emit(
			Term.list([
				Term.maybe(Term.term("Gap", scope)),
				Term.or([
					Term.term("HorizontalDefinition", scope),
					Term.term("Term", scope),
				]),
				Term.maybe(Term.term("Gap", scope)),
			]),
			([left, inner]) => `${inner}`,
		)
		
		scope.VerticalGroupInner = Term.emit(
			Term.list([
				Term.term("NewLine", scope),
				Term.or([
					Term.term("VerticalDefinition", scope),
					Term.term("VerticalList", scope),
					Term.term("Term", scope),
				]),
				Term.term("Unindent", scope),
			]),
			([left, inner]) => `${inner}`,
		)
		
		const getMargin = (size) => Array(size).fill(`	`).join("")
		scope.Margin = Term.check(
			Term.maybe(Term.term("Gap", scope)),
			(gap) => {
				const indentSize = gap.args.indentSize === undefined? 0 : gap.args.indentSize
				return `${gap}`.length === indentSize
			},
		)
		
		scope.NewLine = Term.list([
			Term.many(
				Term.list([
					Term.maybe(Term.term("Gap", scope)),
					Term.string("\n"),
				])
			),
			Term.term("Margin", scope),
		])
		
		scope.Unindent = Term.list([
			Term.many(
				Term.list([
					Term.maybe(Term.term("Gap", scope)),
					Term.string("\n"),
				])
			),
			Term.args(
				Term.term("Margin", scope),
				(args) => {
					args.indentSize--
					return args
				}
			)
		])
		
		scope.String = Term.emit(
			Term.list([
				Term.string(`"`),
				Term.maybe(
					Term.many(
						Term.regExp(/[^"]/) //"
					)
				),
				Term.string(`"`),
			]),
			([left, inner]) => `Term.string(\`${inner}\`)`
		)
		
		scope.RegExp = Term.emit(
			Term.list([
				Term.string(`/`),
				Term.maybe(
					Term.many(
						Term.regExp(/[^/]/)
					)
				),
				Term.string(`/`),
			]),
			([left, inner]) => {
				const source = inner.output.split("").map(c => {
					/*if (c === "\\") return "\\\\\\"*/
					return c
				}).join("")
				return `Term.regExp(\`${inner}\`)`
			},
		)
		
		scope.VerticalList = Term.emit(
			Term.term("VerticalArray", scope),
			(array) => `Term.list([${array}])`,
		)
		
		scope.VerticalArray = Term.emit(
			Term.list([
				Term.term("Term", scope),
				Term.many(
					Term.list([
						Term.maybe(Term.term("NewLine", scope)),
						Term.term("Term", scope),
					])
				),
			]),
			([head, tail = []]) => {
				const tails = tail.filter(t => t.success).map(t => t[1])
				return `${head},\n${tails.join(",\n")}`
			},
		)
		
		scope.HorizontalList = Term.emit(
			Term.except(
				Term.term("HorizontalArray", scope),
				[Term.term("HorizontalList", scope), Term.term("HorizontalDefinition", scope)]
			),
			(array) => `Term.list([${array}])`,
		)
		
		scope.HorizontalArray = Term.emit(
			Term.list([
				Term.term("Term", scope),
				Term.many(
					Term.list([
						Term.maybe(Term.term("Gap", scope)),
						Term.term("Term", scope),
					])
				),
			]),
			([head, tail = []]) => {
				const tails = tail.filter(t => t.success).map(t => t[1])
				return `${head},\n${tails.join(",\n")}`
			},
		)
		
		scope.Gap = Term.many(Term.regExp(/[ 	]/))
	}
	
}

//======//
// Term //
//======//
{
	
	const Term = {}
	MotherTode.Term = Term
	
	const STYLE_SUCCESS = `font-weight: bold; color: rgb(0, 128, 255)`
	const STYLE_FAILURE = `font-weight: bold; color: rgb(255, 70, 70)`
	const STYLE_DEPTH = `font-weight: bold;`
	const log = (result, depth = 5) => {
		
		if (depth < 0) {
			console.log("%cMaximum depth reached", STYLE_DEPTH)
			return
		}
	
		const style = result.success? STYLE_SUCCESS : STYLE_FAILURE
		
		if (result.length === 0) {
			console.log("%c" + result.error, style)
			return
		}
		
		console.groupCollapsed("%c" + result.error, style)
		for (const child of result) {
			log(child, depth - 1)
		}
		console.groupEnd()
		
	}
	
	const smartLogFuncs = new Map()
	const prepSmartLogFuncs = () => {
		smartLogFuncs.set(Term.string, (result) => {
			if (result.success) console.log(`%c${result.error}`, STYLE_SUCCESS)
			else console.log(`%c${result.error}`, STYLE_FAILURE)
		})
		
		smartLogFuncs.set(Term.regExp, (result) => {
			if (result.success) console.log(`%c${result.error}`, STYLE_SUCCESS)
			else console.log(`%c${result.error}`, STYLE_FAILURE)
		})
		
		smartLogFuncs.set(Term.list, (result) => {
			if (result.success) console.log(`%c${result.error}`, STYLE_SUCCESS)
			else {
				for (const r of result) {
					if (!r.success) {
						smartLog(r)
						break
					}
				}
			}
		})
		
		smartLogFuncs.set(Term.many, (result) => {
			if (result.success) console.log(`%c${result.error}`, STYLE_SUCCESS)
			else smartLog(result[0])
		})
		
		smartLogFuncs.set(Term.or, (result) => {
			if (result.success) {
				console.log(`%c${result[0].error}`, STYLE_SUCCESS)
			}
			else {
				console.group(`%c${result.error}`, STYLE_FAILURE)
				for (const r of result) {
					smartLog(r)
				}
				console.groupEnd()
			}
		})
		
		smartLogFuncs.set(Term.except, (result) => {
			console.dir(result)
			if (result.success) console.log(`%c${result.error}`, STYLE_SUCCESS)
			else console.log(`%c${result.error}`, STYLE_FAILURE)
		})
	}
	
	const smartLog = (result) => {
		const func = smartLogFuncs.get(result.term.type)
		if (func === undefined) {
			console.dir(result)
			throw new Error(`[MotherTode] Unimplemented smart error log for this type of term.`)
		}
		//console.log(result.input)
		func(result)
		return result
	}
	
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
			result.log = (depth) => {
				log(result, depth)
				return result
			}
			result.smartLog = () => smartLog(result)
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
				error: `Expected '${term.string}' but found '${snippet}'`,
			})(input, args)
			return Term.succeed({
				source: term.string,
				tail: input.slice(term.string.length),
				term,
				children: [],
				error: `Found '${term.string}'`
			})(input, args)
		}
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
					error: `Found /${term.regExp.source}/ with '${snippet}'`,
				})(input, args)
				i++
			}
			return Term.fail({
				term,
				error: `Expected /${term.regExp.source}/ but found '${input.split("\n")[0]}'`,
			})(input, args)
		}
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
				const error = `Expected list of ${self.terms.length} terms`
				return Term.fail({
					self,
					children: results,
					error,
					term: self,
				})(input, args)
			}
			
			const error = `Found list of ${self.terms.length} terms`
			return Term.succeed({
				output: results.map(result => result.output).join(""),
				source: results.map(result => result.source).join(""),
				tail: state.input,
				term: self,
				children: results,
				error,
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
				if (state.exceptions.includes(term)) {
					state.i++
					state.exceptions = state.exceptions.filter(e => e !== term)
					continue
				}
				const result = term(input, newArgs)
				results.push(result)
				if (result.success) {
					const rejects = results.slice(0, -1)
					for (const i in rejects) {
						const reject = rejects[i]
						reject.error = `Reject ${Number(i) + 1} of ${rejects.length}: ` + reject.error
					}
					rejects.error = `Rejected ${rejects.length}`
					return Term.succeed({
						output: result.output,
						source: result.source,
						tail: result.tail,
						term: self,
						error: `Found choice ${state.i + 1} of ${terms.length}: ` + result.error,
						children: [result, rejects]
					})(input, args)
				}
				state.i++
			}
			
			return Term.fail({
				term: self,
				error: `Expected one of ${terms.length} choices`,
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
				result.source = result.source === undefined? "": result.source
				result.output = result.output === undefined? "": result.output
			}
			result.error = `(Optional) ` + result.error
			result.term = self
			return result
		}
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
					error: `Expected repeated terms`,
				})(input, args)
			}
			
			return Term.succeed({
				output: results.map(result => result.output).join(""),
				source: results.map(result => result.source).join(""),
				tail: state.input,
				term: self,
				children: results,
				error: `Found ${results.length-1} repeated terms`,
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
		self.term = term
		self.func = func
		return self
	}
	
	Term.error = (term, func) => {
		if (typeof func !== "function") {
			const value = func
			func = (result) => {
				if (!result.success) return value
				else return result.error
			}
		}
		const self = (input = "", args = {exceptions: []}) => {
			const result = self.term(input, args)
			result.error = self.func(result)
			result.term = self
			return result
		}
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
				result.term = self
				return result
			}
			const checkResult = self.func(result)
			if (checkResult) {
				result.error = `Passed check: ` + result.error
				return result
			}
			return Term.fail({
				term: self,
				children: [...result],
				error: `Failed check: ` + result.error,
			})(input, args)
		}
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
	
	Term.except = (term, exceptions) => {
		const self = (input = "", args = {exceptions: []}) => {
			const exceptions = args.exceptions === undefined? [] : args.exceptions
			const result = self.term(input, {...args, exceptions: [...exceptions, ...self.exceptions]})
			result.term = self
			return result
		}
		self.type = Term.or
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
			
			throw new Error("[MotherTode] Unimplemented: I don't know how to cache these arguments correctly...")
		}
		return lines.join("|")
	}
	
	const termCaches = new Map()
	let termCount = 0
	Term.terms = []
	
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
	
	Term.export = (term, global, name) => {
		global[name] = term
		return term
	}
	
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
			
			// Allow for scope override
			if (object.isScope) {
				object = object.term
			}
			
			const resultKey = getResultKey(key, input, args)
			const resultCache = resultCaches.get(resultKey)
			if (resultCache !== undefined) {
				//print("Use cache for:", resultKey)
				return resultCache
			}
			
			const term = getValue(object, key)
			
			if (term === undefined) {
				throw new Error(`[MotherTode] Unrecognised term: '${key}'`)
			}
			const result = term(input, args)
			if (result.success) {
				result.error = `Found ${key}: ` + result.error
			}
			else {
				result.error = `Expected ${key}: ` + result.error
			}
			
			const cachedResult = Term.result({
				success: result.success,
				source: result.source,
				output: result.output,
				tail: result.tail,
				term: result.term,
				error: `(Cached) ` + result.error,
				children: [...result],
			})(input, args)
			
			resultCaches.set(resultKey, cachedResult)
			
			return result
		}
		
		self.id = id
		Term.terms[id] = key
		termCache[key] = self
		
		return self
	}
	
	Term.chain = (first, second) => {
		const self = (input = "", args = {exceptions: []}) => {
			const firstResult = self.first(input, args)
			if (!firstResult.success) {
				firstResult.error = `(Chained) ` + firstResult.error
				return firstResult
			}
			
			const secondResult = self.second(firstResult.output, args)
			//secondResult.error = `Found translation: ` + firstResult.error + "\n\n" + secondResult.error
			return secondResult
			
		}
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
		self.term = term
		self.ids = ids
		return self
	}
	
	prepSmartLogFuncs()
	
}

MotherTode.install()

export default MotherTode