process.stdin.resume()
process.stdin.once("end", () => {
  process.stdout.write("{}\n")
})
