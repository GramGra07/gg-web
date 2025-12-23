// Node 16+
// Run with: node scripts/generate-terminal-sitemap.mjs
import { promises as fs } from "node:fs";
import path from "node:path";

const CONTENT_ROOT = path.resolve(process.cwd(), "content");
const OUTPUT = path.resolve(process.cwd(), "public/terminal-sitemap.json");
const EXTERNAL_LINKS_FILE = path.resolve(
	process.cwd(),
	"scripts/external-links.json"
);

const DEFAULT_IGNORES = new Set([
	"node_modules",
	".git",
	".github",
	".gitignore",
	".gitattributes",
	".gitmodules",
	".DS_Store",
	".next",
	"dist",
	"build",
	"Thumbs.db",
	"README.md",
	"legal",
	"artifactRetrieval"
]);

// File extensions to ignore (lowercase, include the dot)
const IGNORE_EXTS = new Set([
	".js",
	".css",
	".png",
	".json",
	".svg",
	".jpg",
	".jpeg",
]);

function isHidden(name) {
	return name.startsWith(".");
}

async function ensureDir(p) {
	await fs.mkdir(p, { recursive: true });
}

async function safeReaddir(absDir) {
	try {
		return await fs.readdir(absDir, { withFileTypes: true });
	} catch (err) {
		if (err && err.code === "ENOENT") {
			console.warn(`[warn] Directory does not exist yet: ${absDir}`);
			return [];
		}
		throw err;
	}
}

async function readDirTree(absDir, relDir = "") {
	const entries = await safeReaddir(absDir);

	const nodes = await Promise.all(
		entries.map(async (dirent) => {
			const name = dirent.name;
			// Block VCS metadata and related files/dirs anywhere in the tree
			if (DEFAULT_IGNORES.has(name)) return null;
			if (name === ".git" || name === ".github" || name.startsWith(".git"))
				return null;

			const abs = path.join(absDir, name);
			const rel = path.posix.join(relDir || "", name);
			const hidden = isHidden(name);

			if (dirent.isDirectory()) {
				const children = await readDirTree(abs, rel);
				// If a directory ended up empty after filtering (e.g. it only contained ignored file types), skip it
				if (!children || children.length === 0) return null;
				return { name, path: `/${rel}`, type: "dir", hidden, children };
			} else if (dirent.isFile()) {
				// Skip files with ignored extensions
				const ext = path.extname(name).toLowerCase();
				if (IGNORE_EXTS.has(ext)) return null;
				// Expose a navigable URL for files so `open` can route to actual content
				// The virtual path starts at "/" mapped from the content root; the served URL lives under "/content"
				return {
					name,
					path: `/${rel}`,
					type: "file",
					hidden,
					url: `/content/${rel}`,
				};
			}
			return null;
		})
	);

	const cleaned = nodes.filter(Boolean);
	cleaned.sort((a, b) => {
		if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
		return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
	});

	return cleaned;
}

async function main() {
	console.log("[info] Working dir:", process.cwd());
	console.log("[info] CONTENT_ROOT:", CONTENT_ROOT);
	console.log("[info] OUTPUT:", OUTPUT);

	await ensureDir("public"); // make sure public exists
	await ensureDir(CONTENT_ROOT); // content can be empty; we’ll still write JSON

	const tree = {
		root: "/",
		type: "dir",
		name: "",
		path: "/",
		hidden: false,
		children: await readDirTree(CONTENT_ROOT, ""),
	};

	// Optionally append external links to the root of the tree
	try {
		const raw = await fs.readFile(EXTERNAL_LINKS_FILE, "utf-8");
		const extras = JSON.parse(raw);
		if (Array.isArray(extras) && extras.length) {
			for (const node of extras) {
				if (!node || typeof node !== "object") continue;
				// minimal validation
				if (node.type !== "file" || !node.name || !node.path || !node.url)
					continue;
				node.hidden = Boolean(node.hidden) === true ? true : false;
				tree.children.push(node);
			}
		}
	} catch (e) {
		// missing file is fine; log other errors
		if (e && e.code !== "ENOENT") {
			console.warn("[warn] Failed to read external links:", e.message || e);
		}
	}

	const index = {};
	(function walk(node) {
		index[node.path] = node;
		if (node.children) node.children.forEach(walk);
	})(tree);

	const out = { generatedAt: new Date().toISOString(), tree, index };
	const json = JSON.stringify(out, null, 2);
	await fs.writeFile(OUTPUT, json, "utf-8");

	const stat = await fs.stat(OUTPUT);
	console.log(`✓ Wrote ${OUTPUT} (${stat.size} bytes)`);
}

main().catch((err) => {
	console.error("✗ Failed to generate sitemap JSON");
	console.error(err.stack || err);
	process.exit(1);
});
