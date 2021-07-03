 <script src="https://deno.land/x/habitat/build/habitat-embed.js"></script>
<script src="https://deno.land/x/mothertode/build/mothertode-embed.js"></script>
<script>

Habitat.install(window)
MotherTode.install(window)

const LispTode = (source) => {
	const result = LispToder(source)
	if (result.success) return result.output
	return result
}
	
const LispToder = MotherTode(`

	++ Sanitise
	REST :: /[^]/+ | EOF
	WhiteSpace :: " " | "\n" | "	"
	Sanitise <
		:: "{{" SanitiseJavaScriptRest SanitiseJavaScriptEnd
		:: "(" WhiteSpace+ ")" >> ([open, inner, close]) => open + close
		:: ")" WhiteSpace+ "(" >> ([close, inner, open]) => close + " " + open
		:: /[^()]/ WhiteSpace* "(" >> ([c, ws, open]) => c + " " + open
		:: ")" WhiteSpace* /[^()]/ >> ([close, gap, c]) => close + " " + c
		:: "(" WhiteSpace+ >> "("
		:: WhiteSpace+ EOF >> ""
		:: WhiteSpace+ ")" >> ")"
		:: WhiteSpace+ >> " "
		:: /[^]/
	>*
	
	SanitiseJavaScriptRest :: "}}" | (/[^]/ SanitiseJavaScriptRest)
	SanitiseJavaScriptEnd <
		:: WhiteSpace+ ")" >> ")"
		:: WhiteSpace+ >> " "
		>> ""
	>

	:: {WhiteSpace} Value EOF
	>> ([ws, value]) => value.output

	Value :: Call | Function | Variable | Quote | JavaScript | Atom | Definition | List
	Values :: Value {" " Value}
	Atom :: /[^() \n	]/+
	List <
		++ "(" Function REST :: Value
		++ "(" Call REST :: Value
		++ "(" Variable REST :: Value
		:: "(" Values? ")"
	>
	Quote :: "'" < JavaScript Atom List > >> ([open, value]) => value.output
	Function ++ "(" Global " " REST :: Value
	Variable ++ Global <" " ")" "EOF"> REST :: Value
	Global <
		:: "name" >> "Lu"
	>

	Definition :: "(define " Value " " Value ")" >> (result) => {
		const [define, name, gap, value] = result
		LispToder.Global.terms.unshift(MotherTode(':: "' + name + '"' + " >> '" + value + "'"))
		return result.output
	}

	JavaScript :: "{{" JavaScriptRest
	JavaScriptRest :: "}}" | (/[^]/ JavaScriptRest)
	Call ++ Apply REST :: Value
	Apply :: "(" JavaScript " " Arguments ")" >> ([open, js, gap, args]) => {
		const inner = js.output.slice(2, -2)
		const func = new Function("return " + inner)()
		const argsArray = new Function("return " + args.output)()
		const result = func(...argsArray).toString()
		return result
	}

	Arguments :: Argument {ArgumentsTail} >> (args) => '[' + args + ']'
	ArgumentsTail :: " " Argument >> ([gap, arg]) => ", " + arg
	Argument ++ Value REST :: <
		:: JavaScript >> (js) => "'" + js.output.slice(2, -2).trim() + "'"
		:: Atom >> (atom) => '"' + atom + '"'
		:: "(" [Argument {ArgumentsTail}] ")" >> ([open, inner, close]) => '[' + inner + ']'
	>
	
`)

LispTode("27".d).d
"".d
LispTode("(Hello world!)".d).d
"".d
LispTode("(2 (3 (4 5) 6))".d).d
"".d
LispTode("(my 'name is name)".d).d
"".d
LispTode("(define age 27)".d).d
"".d
LispTode("(I am age years old)".d).d
"".d
LispTode("(define scores (3 2 5))".d).d
"".d
LispTode("(my 'scores are scores)".d).d
"".d
LispTode("(define team (Bob Luke Kevin))".d).d
"".d
LispTode("team".d).d
"".d
LispTode("(define 'name Luke)".d).d
"".d
LispTode('{{ () => "(Hello world!)" }}'.d).d
"".d
LispTode('({{ () => "(Hello world!)" }} ())'.d).d
"".d
LispTode('(define greet {{ (name) => "(Hello " + name + "!)" }})'.d).d
"".d
LispTode('({{ (name) => "(Hello " + name + "!)" }} Bob)'.d).d
"".d
LispTode("(greet Bob)".d).d
"".d
LispTode('(define add {{ (a, b) => parseInt(a) + parseInt(b) }})'.d).d
"".d
LispTode('(add 3 2)'.d).d
"".d
LispTode(`(define lambda {{ (args, body, b) => {
	return ("{{ (" + args.join(", ") + ") => " + body + " }"+"}")
} }})`.d).d
"".d
LispTode(`((lambda (a b) {{ parseInt(a) - parseInt(b) }}) 5 2)`.d).d
"".d
LispTode(`(define addOne (lambda (a) {{ parseInt(a) + 1 }}))`.d).d
	"".d
	LispTode(`(addOne 3)`.d).d
"".d
</script>
