#!/usr/bin/env node
// 校验 index.json：不依赖第三方包，检查 schema.json 里约定的必填项 / 格式 / 唯一性。
// 用法：node scripts/validate.mjs [index.json]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const file = process.argv[2] ? resolve(process.argv[2]) : resolve(root, "index.json");
const errors = [];
const fail = (msg) => errors.push(msg);

let index;
try {
  index = JSON.parse(readFileSync(file, "utf8"));
} catch (error) {
  console.error(`无法读取 / 解析 ${file}: ${error.message}`);
  process.exit(1);
}

if (index.schema !== "awesome-lab-sites/v1") fail(`schema 必须是 "awesome-lab-sites/v1"，当前 ${JSON.stringify(index.schema)}`);
if (index.updated_at && !/^\d{4}-\d{2}-\d{2}$/.test(index.updated_at)) fail(`updated_at 应为 YYYY-MM-DD，当前 ${index.updated_at}`);
if (!Array.isArray(index.sites)) fail("sites 必须是数组");

const ID = /^[a-z0-9][a-z0-9._-]*$/;
const seenIds = new Map();
const seenUrls = new Map();

for (const [i, site] of (index.sites ?? []).entries()) {
  const where = `sites[${i}]${site?.id ? ` (${site.id})` : ""}`;
  if (typeof site !== "object" || site === null) {
    fail(`${where} 必须是对象`);
    continue;
  }
  for (const key of ["id", "name", "url", "description"]) {
    if (typeof site[key] !== "string" || !site[key].trim()) fail(`${where}.${key} 必填且非空`);
  }
  if (typeof site.id === "string") {
    if (!ID.test(site.id)) fail(`${where}.id 只能是小写字母 / 数字 / . _ -，且以字母或数字开头`);
    if (seenIds.has(site.id)) fail(`${where}.id 与 sites[${seenIds.get(site.id)}] 重复`);
    seenIds.set(site.id, i);
  }
  if (typeof site.url === "string") {
    const url = site.url.trim();
    if (!/^https:\/\//.test(url)) fail(`${where}.url 必须是 https 地址：${url}`);
    if (/\s/.test(url)) fail(`${where}.url 含空白字符`);
    try {
      new URL(url);
    } catch {
      fail(`${where}.url 不是合法 URL：${url}`);
    }
    if (seenUrls.has(url)) fail(`${where}.url 与 sites[${seenUrls.get(url)}] 重复`);
    seenUrls.set(url, i);
  }
  for (const key of ["homepage"]) {
    if (site[key] !== undefined && !/^https?:\/\//.test(site[key])) fail(`${where}.${key} 应为 http(s) 地址`);
  }
  for (const key of ["theme", "protocol", "min_unilabos"]) {
    if (site[key] !== undefined && typeof site[key] !== "string") fail(`${where}.${key} 必须是字符串`);
  }
  for (const key of ["tags", "maintainers"]) {
    if (site[key] !== undefined && (!Array.isArray(site[key]) || site[key].some((t) => typeof t !== "string"))) fail(`${where}.${key} 必须是字符串数组`);
  }
  if (site.official !== undefined && typeof site.official !== "boolean") fail(`${where}.official 必须是布尔`);
}

if (errors.length) {
  console.error(`index.json 校验失败（${errors.length} 处）：`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`OK  ${index.sites.length} sites`);
