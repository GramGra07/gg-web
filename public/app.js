let FS_MAP = null;

async function loadFs() {
	if (FS_MAP) return FS_MAP;

	// If your app is served from a subpath (e.g., /myapp/), an absolute "/terminal-sitemap.json"
	// 404s. Use a relative URL rooted next to index.html instead.
	const base = window.location.pathname.endsWith("/")
		? window.location.pathname
		: window.location.pathname.replace(/[^/]*$/, ""); // strip file name if any

	const url = new URL(
		"./terminal-sitemap.json",
		window.location.origin + base
	).toString();

	const res = await fetch(url, { cache: "no-store" });
	if (!res.ok) {
		throw new Error(`Failed to load sitemap (${res.status})`);
	}
	FS_MAP = await res.json();
	return FS_MAP;
}

function normalizePath(p) {
	if (!p || p === "/") return "/";
	return "/" + p.replace(/^\/+/, "").replace(/\/+$/, "");
}

function resolvePath(cwd, input) {
	if (!input || input === ".") return cwd;
	if (input === "/") return "/";
	const parts = (input.startsWith("/") ? input : `${cwd}/${input}`)
		.split("/")
		.filter(Boolean);
	const stack = [];
	for (const seg of parts) {
		if (seg === ".") continue;
		if (seg === "..") stack.pop();
		else stack.push(seg);
	}
	return "/" + stack.join("/");
}

function getNodeByPath(index, p) {
	const norm = normalizePath(p);
	return index[norm] || null;
}

function listChildren(node, { all = false } = {}) {
	if (!node || node.type !== "dir") return [];
	const kids = node.children || [];
	return all ? kids : kids.filter((k) => !k.hidden);
}

function formatNames(children) {
	// Simple column-ish output with / for dirs
	return children
		.map((n) => (n.type === "dir" ? n.name + "/" : n.name))
		.join("\n");
}

function printItems(items) {
	// Render clickable list of items (files/dirs)
	if (!items || items.length === 0) return;
	const div = document.createElement("div");
	div.className = "output";
	const frag = document.createDocumentFragment();
	items.forEach((it, idx) => {
		const a = document.createElement("a");
		a.textContent = it.label || it.path || it.name;
		a.href = it.url || it.path || "#";
		a.setAttribute("data-path", it.path || "");
		if (it.type) a.setAttribute("data-type", it.type);
		if (it.url) a.setAttribute("data-url", it.url);
		a.style.cursor = "pointer";
		a.style.textDecoration = "underline";
		frag.appendChild(a);
		if (idx < items.length - 1) frag.appendChild(document.createElement("br"));
	});
	div.appendChild(frag);
	termEl.appendChild(div);
	termEl.scrollTop = termEl.scrollHeight;
}

// ---- Autocomplete helpers ----
const COMMANDS = ["pwd", "cd", "ls", "open", "help", "sl", "sl -a"];

function commonPrefix(strings) {
	if (!strings || strings.length === 0) return "";
	let prefix = strings[0];
	for (let i = 1; i < strings.length; i++) {
		const s = strings[i];
		let j = 0;
		while (j < prefix.length && j < s.length && prefix[j] === s[j]) j++;
		prefix = prefix.slice(0, j);
		if (!prefix) break;
	}
	return prefix;
}

async function runCommand(input, state) {
	const raw = input.trim();
	if (!raw) return { output: "", state };
	const parts = raw.split(/\s+/);
	const cmd = parts[0];
	const args = parts.slice(1);
	const { index } = await loadFs();

	switch (cmd) {
		case "sl":
		case "sl -a": {
			await runSlAnimation();
			return { output: "", state };
		}
		case "pwd":
			return { output: state.cwd, state };

		case "cd": {
			const target = args[0] ?? "/";
			const dest = resolvePath(state.cwd, target);
			const node = getNodeByPath(index, dest);
			if (!node)
				return { output: `cd: no such file or directory: ${target}`, state };
			if (node.type !== "dir")
				return { output: `cd: not a directory: ${target}`, state };
			return { output: "", state: { ...state, cwd: node.path } };
		}

		case "ls": {
			const flagA = args.includes("-a");
			const targetArg = args.find((a) => !a.startsWith("-"));
			const dirPath = resolvePath(state.cwd, targetArg ?? ".");
			const node = getNodeByPath(index, dirPath);
			if (!node)
				return {
					output: `ls: cannot access '${
						targetArg ?? "."
					}': No such file or directory`,
					state,
				};
			// In this terminal, -a means recursive but still hides hidden entries
			if (flagA) {
				function flattenRecursive(n) {
					if (!n) return [];
					if (n.type === "file") return [n];
					const out = [];
					const kids = listChildren(n, { all: false });
					for (const k of kids) {
						if (k.type === "file") {
							out.push(k);
						} else if (k.type === "dir") {
							// Do not emit the directory path itself; only include its children
							out.push(...flattenRecursive(k));
						}
					}
					return out;
				}
				const files = node.type === "file" ? [node] : flattenRecursive(node);
				const items = files.map((f) => ({
					label: f.path,
					path: f.path,
					type: f.type,
					url: f.url,
				}));
				return { output: items.map((i) => i.label).join("\n"), items, state };
			}
			// Default non-recursive listing (hides hidden entries)
			if (node.type === "file") return { output: node.name, state };
			const children = listChildren(node, { all: false });
			const items = children.map((c) => ({
				label: c.type === "dir" ? c.name + "/" : c.name,
				path: c.path,
				type: c.type,
				url: c.url,
			}));
			return { output: formatNames(children), items, state };
		}

		case "open": {
			// open <relative-or-absolute-path>
			const target = args[0];
			if (!target) return { output: "open: missing path", state };
			const p = resolvePath(state.cwd, target);
			const node = getNodeByPath(index, p);
			if (!node) return { output: `open: not found: ${target}`, state };
			if (node.type === "dir")
				return { output: `open: cannot open a directory: ${target}`, state };
			// You can map nodes to URLs during generation; here we just 404 to the file path
			// Replace with any routing you want:
			window.location.href = node.url || p; // (customize this)
			return { output: `opening ${node.url || p}`, state };
		}

		case "help":
			return {
				output: [
					"Commands:",
					"  pwd",
					"  cd <dir>",
					"  ls [-a] [path]   # -a lists recursively (hidden files are still hidden)",
					"  open <file>      # cannot open directories",
					"  sl               # steam locomotive",
					"  help",
				].join("\n"),
				state,
			};

		default:
			return { output: `command not found: ${cmd}`, state };
	}
}

// ---- Fun: steam locomotive animation ("sl") ----
let SL_IS_RUNNING = false;

async function runSlAnimation() {
	if (SL_IS_RUNNING) return;
	SL_IS_RUNNING = true;

	// Ensure terminal container can host positioned children
	const prevPos = termEl.style.position;
	if (!prevPos) termEl.style.position = "relative";

	// Wrapper to reserve space and clip the animation
	const wrap = document.createElement("div");
	wrap.className = "output sl-wrap";
	wrap.style.position = "relative";
	wrap.style.height = "6.5em"; // space for 5-6 lines of ASCII
	wrap.style.overflow = "hidden";
	wrap.style.fontFamily = "monospace";

	const pre = document.createElement("pre");
	pre.className = "sl-train";
	pre.style.position = "absolute";
	pre.style.top = "0";
	pre.style.left = "0";
	pre.style.margin = "0";
	pre.style.whiteSpace = "pre";
	pre.style.lineHeight = "1.1";
	pre.textContent =
"____      \n"+
"|DD|____T_   \n"+
"|_ |_____|<  \n"+
"  @-@-@-oo\  \n";

	wrap.appendChild(pre);
	termEl.appendChild(wrap);
	termEl.scrollTop = termEl.scrollHeight;

	// After added to DOM, measure and animate
	await new Promise(requestAnimationFrame);
	const containerWidth = wrap.clientWidth || termEl.clientWidth || 600;
	const trainWidth =
		pre.getBoundingClientRect().width || pre.offsetWidth || 400;

	let x = -trainWidth - 12;
	const target = containerWidth + 12;
	const speed = 200; // px per second
	let last = performance.now();

	return new Promise((resolve) => {
		function step(now) {
			const dt = (now - last) / 1000;
			last = now;
			x += speed * dt;
			pre.style.transform = `translateX(${Math.round(x)}px)`;
			if (x < target) {
				requestAnimationFrame(step);
			} else {
				// cleanup
				wrap.remove();
				SL_IS_RUNNING = false;
				if (!prevPos) termEl.style.position = "";
				resolve();
			}
		}
		requestAnimationFrame(step);
	});
}

/* ---- Minimal UI ---- */

const termEl = document.getElementById("terminal");
const formEl = document.getElementById("prompt");
const cmdEl = document.getElementById("cmd");
const ps1El = document.getElementById("ps1");

let STATE = { cwd: "/" };

// --- Session persistence (so terminal sustains on switch) ---
const SESSION_KEY = "ggweb_terminal_session_v1";
let SAVE_DEBOUNCE = null;

function saveSession() {
	try {
		const snapshot = {
			cwd: STATE.cwd,
			html: termEl.innerHTML,
			scrollTop: termEl.scrollTop,
		};
		sessionStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
	} catch {}
}

function scheduleSave() {
	if (SAVE_DEBOUNCE) clearTimeout(SAVE_DEBOUNCE);
	SAVE_DEBOUNCE = setTimeout(saveSession, 120);
}

function restoreSession() {
	try {
		const raw = sessionStorage.getItem(SESSION_KEY);
		if (!raw) return false;
		const data = JSON.parse(raw);
		if (data && typeof data === "object") {
			if (data.html) {
				termEl.innerHTML = data.html;
			}
			if (data.cwd && typeof data.cwd === "string") {
				STATE.cwd = data.cwd;
			}
			setPrompt();
			if (typeof data.scrollTop === "number") {
				termEl.scrollTop = data.scrollTop;
			} else {
				termEl.scrollTop = termEl.scrollHeight;
			}
			return true;
		}
	} catch {}
	return false;
}

function setPrompt() {
	ps1El.textContent = `guest@ggweb:${STATE.cwd}$`;
}

function print(line, cls = "") {
	const div = document.createElement("div");
	div.className = "output " + cls;
	div.textContent = line;
	termEl.appendChild(div);
	termEl.scrollTop = termEl.scrollHeight;
	scheduleSave();
}

function printCmd(cmd) {
	const div = document.createElement("div");
	div.className = "output";
	div.textContent = `${ps1El.textContent} ${cmd}`;
	termEl.appendChild(div);
	scheduleSave();
}

function addWelcomeBanner() {
	if (document.getElementById("welcome-banner")) return;
	const div = document.createElement("div");
	div.className = "output welcome";
	div.id = "welcome-banner";
	div.textContent =
		"Welcome to GG Web Terminal — use ls/cd/open/help to navigate.";
	termEl.insertBefore(div, termEl.firstChild);
	scheduleSave();
}

(async function init() {
	try {
		await loadFs();
		const restored = restoreSession();
		// Insert a welcome message at the very top (once per session)
		if (typeof addWelcomeBanner === "function") addWelcomeBanner();
		if (!restored) {
			setPrompt();
			print("Type 'help' to get started.");
		}
	} catch (e) {
		print(`Error loading filesystem: ${e.message}`, "err");
	}
})();

formEl.addEventListener("submit", async (e) => {
	e.preventDefault();
	const input = cmdEl.value;
	cmdEl.value = "";
	printCmd(input);
	try {
		const res = await runCommand(input, STATE);
		STATE = res.state;
		if (res.items && res.items.length) {
			printItems(res.items);
		} else if (res.output) {
			print(res.output);
		}
		setPrompt();
		scheduleSave();
	} catch (err) {
		print(String(err?.message || err), "err");
	}
});

// ---- Tab completion ----
let LAST_TAB = { time: 0, kind: "", token: "", candidates: [] };

cmdEl.addEventListener("keydown", async (e) => {
	if (e.key !== "Tab") return;
	e.preventDefault();

	const now = Date.now();
	const left = cmdEl.value.slice(0, cmdEl.selectionStart);
	const right = cmdEl.value.slice(cmdEl.selectionStart);

	// Identify the current token (chars after last whitespace before caret)
	const tokenMatch = left.match(/([^\s]*)$/);
	const token = tokenMatch ? tokenMatch[1] : "";
	const leftWithoutToken = left.slice(0, left.length - token.length);

	const trimmedLeft = left.trimStart();
	const tokens = trimmedLeft.length ? trimmedLeft.split(/\s+/) : [];
	const isAtCommand = tokens.length <= 1 && token === tokens[0];

	// Double-Tab detection (same kind and token within 600ms)
	function isDoubleTab(kind, tkn, candidates) {
		return (
			LAST_TAB &&
			now - LAST_TAB.time < 600 &&
			LAST_TAB.kind === kind &&
			LAST_TAB.token === tkn &&
			LAST_TAB.candidates &&
			LAST_TAB.candidates.length === candidates.length &&
			LAST_TAB.candidates.every((c, i) => c === candidates[i])
		);
	}

	// Command name completion
	if (isAtCommand) {
		const prefix = token || "";
		const matches = COMMANDS.filter((c) => c.startsWith(prefix));
		if (matches.length === 0) return; // nothing to do

		// On double-Tab, list options
		if (matches.length > 1 && isDoubleTab("cmd", prefix, matches)) {
			print(matches.join("  "));
			LAST_TAB = { time: now, kind: "cmd", token: prefix, candidates: matches };
			return;
		}

		const fill =
			matches.length === 1 ? matches[0] : commonPrefix(matches) || prefix;
		const newLeft = leftWithoutToken + fill;
		cmdEl.value = newLeft + right;
		cmdEl.selectionStart = cmdEl.selectionEnd = newLeft.length;
		LAST_TAB = { time: now, kind: "cmd", token: prefix, candidates: matches };
		return;
	}

	// Path completion for commands that accept paths
	const cmd = tokens[0];
	const acceptPath = cmd === "cd" || cmd === "ls" || cmd === "open";
	if (!acceptPath) return;

	const { index } = await loadFs();

	// Extract base (dir part) and partial (name part) from token
	const lastSlash = token.lastIndexOf("/");
	const basePartRaw = lastSlash >= 0 ? token.slice(0, lastSlash) : ""; // may be relative or absolute
	const namePart = lastSlash >= 0 ? token.slice(lastSlash + 1) : token;

	const baseResolved = resolvePath(
		STATE.cwd,
		basePartRaw === "" ? "." : basePartRaw
	);
	const baseNode = getNodeByPath(index, baseResolved);
	if (!baseNode || baseNode.type !== "dir") return;

	let children = listChildren(baseNode, { all: false });
	if (cmd === "cd") children = children.filter((n) => n.type === "dir");
	const matchedNodes = children.filter((n) => n.name.startsWith(namePart));
	if (matchedNodes.length === 0) return;

	const names = matchedNodes.map((n) => n.name);

	// Double-Tab to show options
	if (matchedNodes.length > 1 && isDoubleTab("path", token, names)) {
		print(formatNames(matchedNodes));
		LAST_TAB = { time: now, kind: "path", token, candidates: names.slice() };
		return;
	}

	let fillName =
		names.length === 1 ? names[0] : commonPrefix(names) || namePart;
	// If single match is a dir and we completed fully, add trailing slash for convenience
	const singleNode = matchedNodes.length === 1 ? matchedNodes[0] : null;
	const completedFully =
		fillName.length > namePart.length &&
		names.every((n) => n.startsWith(fillName));
	if (singleNode && singleNode.type === "dir" && completedFully) {
		fillName = fillName + "/";
	}

	// Rebuild the token with base
	const newToken = (basePartRaw ? basePartRaw + "/" : "") + fillName;
	const newLeft = leftWithoutToken + newToken;
	cmdEl.value = newLeft + right;
	cmdEl.selectionStart = cmdEl.selectionEnd = newLeft.length;
	LAST_TAB = { time: now, kind: "path", token, candidates: names.slice() };
});

// Click-to-navigate for printed paths
termEl.addEventListener("click", async (e) => {
	const link = e.target.closest("a[data-path]");
	if (!link) return;
	e.preventDefault();
	const path = link.getAttribute("data-path");
	if (!path) return;
	try {
		const { index } = await loadFs();
		const node = getNodeByPath(index, path);
		if (!node) return;
		if (node.type === "dir") {
			// Navigate into directory and list contents
			printCmd(`cd ${path} && ls`);
			STATE = { ...STATE, cwd: node.path };
			setPrompt();
			const res = await runCommand("ls", STATE);
			if (res.items && res.items.length) {
				printItems(res.items);
			} else if (res.output) {
				print(res.output);
			}
			scheduleSave();
		} else if (node.type === "file") {
			const href = node.url || node.path;
			print(`opening ${href}`);
			window.location.href = href;
		}
	} catch (err) {
		print(String(err?.message || err), "err");
	}
});
