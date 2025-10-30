import esbuild from "esbuild";

const commonOptions = {
    entryPoints: ["src/index.js"],
    bundle: true,
    sourcemap: true,
    minify: false,
    target: "node14",
    platform: "node",
};

await esbuild.build({
    ...commonOptions,
    format: "esm",
    outfile: "dist/index.mjs",
});

await esbuild.build({
    ...commonOptions,
    format: "cjs",
    outfile: "dist/index.cjs",
});

console.log("Build complete: ESM and CJS outputs created.");
