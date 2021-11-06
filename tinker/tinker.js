/*const hello = MotherTode(`"hello"`)
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

const hillo = MotherTode(`<"hi" "hello">`)
hillo("hi").smartLog()
hillo("hello").smartLog()
hillo("hey").smartLog()

const hei = MotherTode(`"hi" | "hello" | "hey"`)
hei("hi").smartLog()
hei("hello").smartLog()
hei("hey").smartLog()
hei("ha").smartLog()

const nohi = MotherTode(`<"hello" "hi" "hey"> ~ "hi" "yo"`)
nohi("helloyo").smartLog()
nohi("hiyo").smartLog()
nohi("heyyo").smartLog()

const match = MotherTode(`:: "hi" "ya" >> "Hello world!"`)
match("hiya").smartLog()
match("hiyo").smartLog()

const matchs = MotherTode(`:: "hi" "ya" >> () => {
	const result = "Heya world!"
	return result
}`)
matchs("hiyalol").smartLog()
matchs("hsyalol").smartLog()

const long = MotherTode(`
	:: "Hey"
	:: "yo" "lol" (:: "bop")
`)
long("Heyyololbop").smartLog()
long("Heyyolollbop").smartLog()

const checker = MotherTode(`:: /[a-zA-Z]/+ ?? (name) => name.output == "Luke"`)
checker("123").smartLog()
checker("Bob").smartLog() //should fail
checker("Luke").smartLog()

const errorer = MotherTode(`:: "FOO" !! "IT SHOULD BE FOO"`)
errorer("FOO").smartLog()
errorer("BAR").smartLog() //should fail

const checkerError = MotherTode(`(
	:: /[a-zA-Z]/+
	?? (name) => name.output == "Luke"
	!! (name) => "Bad name: '" + name.input.split('\\n')[0] + "'"
)`)
checkerError("123").smartLog()
checkerError("Bob").smartLog() //should fail
checkerError("Luke").smartLog()

const argser = MotherTode(`:: "hi" @@ (args) => ({...args, foo: "bar"})`)
argser("hi").smartLog()
argser("hsi").smartLog()

const chainer = MotherTode(`:: /[12]/ ++ /[23]/`)
chainer("1").smartLog()
chainer("2").smartLog() //should fail
chainer("3").smartLog() //should fail


const filterer = MotherTode(`++ (:: "Bob" | "Luke") :: /[a-zA-Z]/+ >> (name) => "Hello " + name`)
filterer("Bob").smartLog()
filterer("Luke").smartLog()
filterer("Kevin").smartLog() //should fail

const vertdef = MotherTode(`
	++ >> "World"
	:: /[a-zA-Z]/+
	>> (name) => "Hello " + name
`)
vertdef().smartLog()

const decls = MotherTode(`
	:: Hi
	Hi :: "hi"
	Terms (
		Hello :: "hello"
		World :: "world"
		Exclamation :: "!"
	)
`)
decls.Terms.Hello("hello").smartLog()
decls("hi").smartLog()
decls("hey").smartLog()

const fullWorld = MotherTode(`
	:: Greeting
	Greeting :: Hello " " World Ending
	Hello :: "hello"
	World :: "world"
	Ending :: "!" | "."
`)
fullWorld.Hello("hello").smartLog()
fullWorld("hello world.").smartLog()
fullWorld("hello wosrld.").smartLog()
fullWorld.Greeting("hello wortld.").smartLog()

const fullWorldScope = MotherTode(`
	:: Greeting.Hello World Ending
	Greeting (
		:: Hello World Ending
		World :: "pond"
		Hello :: "hello"
	)
	World :: "world"
	Ending :: "." | "!"
`)
fullWorldScope.Greeting.Hello("hello").smartLog()
fullWorldScope("helloworld.").smartLog()
fullWorldScope.Greeting("hellopond!").smartLog()
fullWorldScope.Greeting.World("pond").smartLog()
fullWorldScope("hellsoworld.").smartLog()
fullWorldScope("helloworld .").smartLog()

const whitespace = MotherTode(`
	:: Hello " " Name
	>> ([hello, gap, name]) => 'Yo #{name}!'
	
	Hello :: "hello"
	Name :: /[a-z]/+
`)
whitespace("hello bob").smartLog()
whitespace("hello 123").smartLog()
whitespace("hi bob").smartLog()

const selector = MotherTode(`
	:: Literal ([" "] "add" [" "]) Literal
	>> ([left, inner, right]) => '#{left} + #{right}'
	Literal :: /[0-9]/+
`)

selector("3 add 2").smartLog()
selector("3 addd 2").smartLog()
selector("3 ad 2").smartLog()

const exper = MotherTode(`
	:: "hello"
	export as Hello
`)
exper("hello").smartLog()

const numm = MotherTode(`
	Num >> "12"
`)
numm().smartLog()


const ops = MotherTode(`
	:: Number EOF
	Number :: Add | Subtract | Literal
	Literal :: /[0-9]/+
	Add :: Number~Add "+" Number
	Subtract :: Number~Subtract "-" Number
`)

//console.log(MotherTode.lint(ops.output))

ops("3").smartLog()
ops("32").smartLog()
ops("3+2").smartLog()
ops("3+2+4").smartLog()
ops("3-4").smartLog()
ops("3+").smartLog()
ops("3++5").smartLog()
ops("3+2-4+4-3").smartLog()


const heia = MotherTode(`(
	:: (Message | Subject) EOF
	Subject :: Letter+
	Letter :: /[a-zA-Z]/
	Message :: Greeting [" "] Name
	Name :: FirstName [" "] Surname 
	FirstName :: "Bob" | "Kevin"
	Surname :: "Smith" | "Foo"
	Greeting :: "Hi" | "Hello"
)`)
heia("HiBob Smith").smartLog()
heia("World").smartLog()
heia("Hey Bob Smith").smartLog()
heia("Hi Stuart Foo").smartLog()



const argser2 = MotherTode(`
	:: Argser
	Argser :: Hi @@ (args) => ({...args, foo: ["bar", "baz"]})
	Hi :: "hi"
`)
argser2("hi").smartLog()
argser2("hsi").smartLog()
*//*
const language = MotherTode(`:: /[a-zA-Z]/+ >> (name) => "Hello " + name + "!"`)
const result = language("world")
console.log(result.output)*/

const language = MotherTode(`

	:: FizzBuzz | Fizz | Buzz | Number
	Number :: /[0-9]/+ >> (n) => parseInt(n)
	FizzBuzz (
		:: Number
		?? (n) => n % 5 == 0 && n % 3 == 0
		>> "FizzBuzz"
	)

	Fizz (
		:: Number
		?? (n) => n % 3 == 0
		>> "Fizz"
	)

	Buzz (
		:: Number
		?? (n) => n % 5 == 0
		>> "Buzz"
	)

`)

for (let i = 0; i < 20; i++) {
	const result = language(i.toString())
	console.log(result.output)
}