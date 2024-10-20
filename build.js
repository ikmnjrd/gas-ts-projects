const { GasPlugin } = require("esbuild-gas-plugin");

const [_first, _second, inPath, outPath] = process.argv;

if (!inPath || !outPath) {
  console.error("Please provide a file path");
  process.exit(1);
}

require("esbuild")
  .build({
    entryPoints: [inPath],
    bundle: true,
    minify: false,
    outfile: outPath,
    plugins: [GasPlugin],
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
