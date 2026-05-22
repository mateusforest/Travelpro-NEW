import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = process.cwd()
const TARGETS = ["app", "components", "lib"]
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs"]

const checks = [
  { id: "href-hash", label: 'href="#"', regex: /href\s*=\s*["']#["']/g, priority: "alta" },
  { id: "href-empty", label: 'href=""', regex: /href\s*=\s*["']["']/g, priority: "alta" },
  { id: "onclick-empty", label: "onClick vazio", regex: /onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/g, priority: "alta" },
  { id: "console-log", label: "console.log como acao", regex: /console\.log\s*\(/g, priority: "media" },
  { id: "alert-call", label: "alert como acao", regex: /alert\s*\(/g, priority: "media" },
  { id: "disabled-true", label: "disabled fixo", regex: /disabled\s*=\s*\{\s*true\s*\}/g, priority: "media" },
  { id: "public-to-app", label: "rota administrativa em contexto publico", regex: /(?:href|router\.push)\s*=?\s*\(?["']\/app\//g, priority: "alta" },
  { id: "cross-master", label: "rota master em contexto agencia", regex: /(?:href|router\.push)\s*=?\s*\(?["']\/master\//g, priority: "media" },
  { id: "legacy-client", label: "rota legado /cliente", regex: /(?:href|router\.push)\s*=?\s*\(?["']\/cliente\//g, priority: "media" },
]

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
      continue
    }

    if (!entry.isFile()) continue
    if (!EXTENSIONS.some((extension) => entry.name.endsWith(extension))) continue
    files.push(fullPath)
  }

  return files
}

function shouldCheckFinding(filePath, checkId) {
  const normalized = filePath.replaceAll("\\", "/")

  if (checkId === "public-to-app") {
    return normalized.startsWith("app/catalogo/") || normalized.includes("components/public/")
  }

  if (checkId === "cross-master") {
    return normalized.includes("components/agency/") || normalized.includes("app/app/") || normalized.includes("components/system/")
  }

  if (checkId === "legacy-client") {
    return !normalized.includes("components/client/") && !normalized.includes("app/cliente/")
  }

  return true
}

const findings = []

for (const target of TARGETS) {
  const targetPath = join(ROOT, target)
  if (!statSync(targetPath, { throwIfNoEntry: false })?.isDirectory()) continue

  for (const filePath of walk(targetPath)) {
    const content = readFileSync(filePath, "utf8")
    const lines = content.split(/\r?\n/)

    checks.forEach((check) => {
      if (!shouldCheckFinding(filePath, check.id)) return

      lines.forEach((line, index) => {
        if (!check.regex.test(line)) return
        findings.push({
          rule: check.label,
          priority: check.priority,
          file: relative(ROOT, filePath).replaceAll("\\", "/"),
          line: index + 1,
          sample: line.trim(),
        })
        check.regex.lastIndex = 0
      })
    })
  }
}

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), findings }, null, 2))
