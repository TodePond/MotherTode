const BLUE = "color: #4680ff"
const RED = "color: #ff4346"
const GREEN = "color: #46ff80"
const YELLOW = "color: #ffcc46"

const readFile = async (path) => {
	console.log(`%cReading File: ${path}`, BLUE)
	const source = await Deno.readTextFile(path)
	return source
}

const writeFile = async (path, source) => {
	console.log(`%cWriting File: ${path}`, GREEN)
	return await Deno.writeTextFile(path, source)
}

const readDirectory = async (path) => {
	
	const sources = []

	for await (const entry of Deno.readDir(path)) {

		// Go deeper if it's a directory
		const entryPath = `${path}/${entry.name}`
		if (entry.isDirectory) {
			sources.push(await readDirectory(entryPath))
			continue
		}

		// Make sure it's a javascript file
		const [name, extension] = entry.name.split(".")
		if (extension !== "js") continue

		const source = await readFile(entryPath)
		sources.push(source)

	}

	return sources
}

const trimStart = (string) => {
	for (let i = 0; i < string.length; i++) {
		const char = string[i]
		if (char === " " || char === "	") continue
		return string.slice(i)
	}
}

const getConstName = (line) => {
	for (let i = "const ".length; i < line.length; i++) {
		const char = line[i]
		if (char === " " || char === "	" || char === "=") {
			return line.slice("const ".length, i)
		}
	}
}

const stripSource = (source, projectName) => {
	const lines = source.split("\n")
	const trimmedLines = lines.map(line => trimStart(line))
	const strippedLines = []
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		const trimmedLine = trimmedLines[i]
		const snippet = trimmedLine.slice(0, "export ".length)
		
		if (snippet === "export ") {
			const trimLength = line.length - trimmedLine.length
			const strippedLine = line.slice("export ".length + trimLength)
			const constSnippet = strippedLine.slice(0, "const ".length)
			if (constSnippet !== "const ") {
				throw new Error("[Frogasaurus] Sorry, Frogasaurus only supports exports when you write 'const' immediately after.")
			}
			const name = getConstName(strippedLine)
			strippedLines.push(strippedLine)
			continue
		}

		strippedLines.push(line)
	}

	return strippedLines.join("\n")
}

const buildSource = async (projectName) => {
	
	console.clear()
		
	const sources = await readDirectory("source")
	const strippedSources = sources.map(source => stripSource(source, projectName))
	
	const importSource = sources.join("\n")
	const embedSource = strippedSources.join("\n")
	
	await writeFile(`${projectName}-import.js`, importSource)
	await writeFile(`${projectName}-embed.js`, embedSource)

	console.log("%cFinished build!", YELLOW)
	console.log("Waiting for file changes...")
}

const directory = Deno.cwd()
const directoryParts = directory.split("\\")
const projectName = directoryParts[directoryParts.length-1]

await Deno.permissions.request({name: "read", path: "."})
await Deno.permissions.request({name: "write", path: "."})

await buildSource(projectName)

const watcher = Deno.watchFs("./source")
for await (const event of watcher) {
	await buildSource(projectName)
}
