import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
const require = createRequire(import.meta.url);
export function load(file, dependencies) {
  const source = readFileSync(new URL(file, new URL("../", import.meta.url)), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require: name => name in dependencies ? dependencies[name] : require(name),
  });
  return exports;
}
