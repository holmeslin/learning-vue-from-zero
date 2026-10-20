// 抽出 zh-TW/src 底下所有 js / jsx / ts / tsx / vue 程式碼區塊，檢查語法。
// js 類用 esbuild，vue 用 @vue/compiler-sfc；只檢查語法，不檢查型別。
// 片段或故意寫錯的範例加上 ignore，例如 ```vue,ignore
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { transform } from "esbuild";
import { compileScript, compileTemplate, parse } from "@vue/compiler-sfc";

const LOADERS = {
  js: "js",
  mjs: "js",
  jsx: "jsx",
  ts: "ts",
  tsx: "tsx",
  vue: "vue",
};
const ROOT = new URL("../zh-TW/src/", import.meta.url).pathname;

async function* markdownFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* markdownFiles(path);
    else if (entry.name.endsWith(".md")) yield path;
  }
}

function* codeBlocks(markdown) {
  const lines = markdown.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^```(\S*)/);
    if (!open) continue;
    const [lang, ...attrs] = open[1].split(",");
    const start = i;
    const body = [];
    while (++i < lines.length && !lines[i].startsWith("```")) body.push(lines[i]);
    if (attrs.includes("ignore") || !LOADERS[lang]) continue;
    yield { line: start + 1, loader: LOADERS[lang], code: body.join("\n") };
  }
}

// 回傳錯誤清單，每個錯誤是 { text, line }，line 是區塊內的行號（可能沒有）
async function check({ loader, code }) {
  if (loader !== "vue") {
    try {
      await transform(code, { loader, logLevel: "silent" });
      return [];
    } catch (error) {
      return error.errors.map(({ text, location }) => ({
        text,
        line: location?.line,
      }));
    }
  }

  // shortcut: script 錯誤的行號是相對於 <script> 內容，需要精確定位時再換算
  const fromVue = (e) => ({
    text: e.message ?? String(e),
    line: e.loc?.start?.line ?? e.loc?.line,
  });
  const { descriptor, errors } = parse(code, { filename: "Example.vue" });
  if (errors.length) return errors.map(fromVue);
  const found = [];
  if (descriptor.script || descriptor.scriptSetup) {
    try {
      compileScript(descriptor, { id: "example" });
    } catch (error) {
      found.push(fromVue(error));
    }
  }
  if (descriptor.template) {
    const { errors: templateErrors } = compileTemplate({
      source: descriptor.template.content,
      filename: "Example.vue",
      id: "example",
    });
    // 模板內的行號要加上 <template> 開頭所在的行
    const offset = descriptor.template.loc.start.line - 1;
    for (const e of templateErrors) {
      const error = fromVue(e);
      if (error.line) error.line += offset;
      found.push(error);
    }
  }
  return found;
}

let checked = 0;
let failed = 0;
for await (const file of markdownFiles(ROOT)) {
  const relative = file.slice(ROOT.length);
  for (const block of codeBlocks(await readFile(file, "utf8"))) {
    checked++;
    const errors = await check(block);
    if (errors.length) failed++;
    for (const { text, line } of errors) {
      console.error(`${relative}:${line ? block.line + line : block.line}: ${text}`);
    }
  }
}

console.log(`checked ${checked} code blocks, ${failed} failed`);
process.exit(failed ? 1 : 0);
