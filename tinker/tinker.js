const hello = MotherTode(`"hello"`)
hello("hello").smartLog()
hello("henllo").smartLog()


const digit = MotherTode(`/[0-9]/`)
digit("3").smartLog()
digit("a").smartLog()

const yohoho = MotherTode(`"yo" "ho" "hi"`)
yohoho("yohohi").smartLog()
yohoho("yohihi").smartLog()
yohoho("yohoha").smartLog()

const group = MotherTode(`("hi" "ya")`)
group("hiya").smartLog()
group("hiyo").smartLog()
group("heyya").smartLog()


const groupyo = MotherTode(`"hi" ("yo")`)
groupyo("hiyo").smartLog()
groupyo("hiya").smartLog()

const groupgroup = MotherTode(`("hi" ("yo" "yi") "ya") ("lol")`)
groupgroup("hiyoyiyalol").smartLog()
groupgroup("hiyoyiyolol").smartLog()

const indent = MotherTode(`(
	"hello" (
		"there"
		"lol"
	)
	"ha"
)`)
indent("hellotherelolha").smartLog()
indent("hellothereslolha").smartLog()


const inner = MotherTode(`
	"hi"
	"yo" "ya"
`)
inner("hiyoya").smartLog()
inner("hiiyoya").smartLog()

const hahaha = MotherTode(`"ha"+`)
hahaha("ha").smartLog()
hahaha("haha").smartLog()
hahaha("hahaha").smartLog()
hahaha("hsahah").smartLog()

const hiya = MotherTode(`"hi" "ya"?`)
hiya("hi").smartLog()
hiya("hiya").smartLog()
hiya("hiysa").smartLog()
hiya("hsiysa").smartLog()

const hiyaya = MotherTode(`"hi" ["ya" "ya"]`)
hiyaya("hi").smartLog()
hiyaya("hiyaya").smartLog()
hiyaya("hiyayya").smartLog()
hiyaya("hsiyayya").smartLog()

const hiyayaya = MotherTode(`"hi" "ya"*`)
hiyaya("hi").smartLog()
hiyaya("hiyaya").smartLog()
hiyaya("hiybaya").smartLog()
hiyaya("hsiybaya").smartLog()

const hiyoyo = MotherTode(`"hi" {"yo"}`)
hiyoyo("hi").smartLog()
hiyoyo("hiyoyo").smartLog()
hiyoyo("hriyoyo").smartLog()

const hillo = MotherTode(`<"hi"	"hello">`)
hillo("hi").smartLog()
hillo("hello").smartLog()
hillo("hey").smartLog()

const hei = MotherTode(`"hi" | "hello" | "hey"`)
hei("hi").smartLog()
hei("hello").smartLog()
hei("hey").smartLog()
hei("ha").smartLog()

const nohi = MotherTode(`<"hello" "hi"> ~ "hi" "yo"`)
nohi("helloyo").smartLog()
nohi("hiyo").smartLog() //TODO: should fail
nohi("heyyo").smartLog()
/*
const match = MotherTode(`:: "hi" "ya" >> "Hello world!"`)
match("hiyalol").log().output.d

const matchs = MotherTode(`:: "hi" "ya" >> () => {
	const result = "Heya world!"
	return result
}`)
matchs("hiyalol").log().output.d

const long = MotherTode(`
	:: "Hey"
	:: "yo" "lol" (:: "bop")
`)
long("Heyyololbop").log()

const checker = MotherTode(`:: /[a-zA-Z]/+ ?? (name) => name.output == "Luke"`)
//checker("Bob").log() //should fail
checker("Luke").log()

const errorer = MotherTode(`:: "foo" !! "BAR"`)
errorer("foo").log()
//errorer("fod").log() //should fail

const argser = MotherTode(`:: "hi" @@ (args) => ({...args, foo: "bar"})`)
argser("hi").log()

const chainer = MotherTode(`:: /[bcd]/ ++ /[abc]/`)
chainer("b").log()
//chainer("a").log() //should fail
//chainer("d").log() //should fail

const filterer = MotherTode(`++ (:: "Bob" | "Luke") :: /[a-zA-Z]/+ >> (name) => "Hello " + name`)
filterer("Bob").log().output.d
filterer("Luke").log().output.d
//filterer("Kevin").log() //should fail

const vertdef = MotherTode(`
	++ >> "World"
	:: /[a-zA-Z]/+
	>> (name) => "Hello " + name
`)
vertdef().log().output.d

//const decl = MotherTode(`Hello :: "hello"`
//decl.Hello("hello").log()

const decls = MotherTode(`
	:: "hi"
	Terms (
		Hello :: "hello"
		World :: "world"
		Exclamation :: "!"
	)
`)
decls.Terms.Hello("hello").log()
decls("hi").log()

const fullWorld = MotherTode(`
	:: Hello " " World Ending
	Hello :: "hello"
	World :: "world"
	Ending :: "!" | "."
`)
fullWorld.Hello("hello").log()
fullWorld("hello world.").log().output

const fullWorldScope = MotherTode(`
	:: Greeting.Hello World
	Greeting (
		:: Hello World Ending
		World :: "pond"
		Hello :: "hello"
	)
	World :: "world"
	Ending :: "." | "!"
`)
fullWorldScope.Greeting.Hello("hello").log()
fullWorldScope("helloworld.").log()
fullWorldScope.Greeting("hellopond!").log()
fullWorldScope.Greeting.World("pond").log()

const whitespace = MotherTode(`
	:: Hello " " Name
	>> ([hello, gap, name]) => 'Yo #{name}!'
	
	Hello :: "hello"
	Name :: /[a-z]/+
`).log()
whitespace("hello bob").log()

const selector = MotherTode(`
	:: Literal ([_] "add" [_]) Literal
	>> ([left, inner, right]) => '#{left} + #{right}'
	Literal :: /[0-9]/+
`)

selector("3 add 2").log().output.d

const exper = MotherTode(`
	Hello :: "hello"
	export Hello
`).log(7).output.d

const numm = MotherTode(`
	Num >> "12"
`)*/