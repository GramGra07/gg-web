function toRun() {
	document.addEventListener("DOMContentLoaded", function () {
		// Select all sections with the class 'active'
		const sections = document.querySelectorAll(".active");

		// Function to toggle the 'active' class
		function toggleActiveSections() {
			sections.forEach((section) => {
				section.classList.toggle("active");
			});
		}
	});

	// Replace these dates with the start dates of your coding experience
	const htmlStartDate = "2023-01-01";
	const dartStartDate = "2023-05-01";
	const javaStartDate = "2021-09-09";
	const pythonStartDate = "2019-07-01";
	const markdownStartDate = "2022-08-02";
	const cplusStartDate = "2022-08-14";
	const swiftStartDate = "2023-10-16";
	const kotlinStartDate = "2024-02-19";

	const startDateMap = {
		dart: dartStartDate,
		python: pythonStartDate,
		java: javaStartDate,
		html: htmlStartDate,
		markdown: markdownStartDate,
		cplus: cplusStartDate,
		swift: swiftStartDate,
		kotlin: kotlinStartDate,
	};
	const languages = Object.keys(startDateMap);

	const today = new Date();
	let longestLanguage = "";
	let longestTime = 0;

	for (const [language, startDateStr] of Object.entries(startDateMap)) {
		const startDate = new Date(startDateStr);
		const timeDifference = today.getTime() - startDate.getTime();
		if (timeDifference > longestTime) {
			longestLanguage = language;
			longestTime = timeDifference;
		}
	}
	const longestStartDate = startDateMap[longestLanguage];
	const longestStart = new Date(longestStartDate);
	const currentDate = new Date();
	const totalExperience = currentDate - longestStart;

	function calculateProgress(startDate) {
		const start = new Date(startDate);
		const currentExperience = currentDate - start;
		const progress = (currentExperience / totalExperience) * 100;
		return progress;
	}

	function updateProgressBar(language, startDate) {
		const progressBar = document.getElementById(`${language}ProgressBar`);
		const progress = calculateProgress(startDate, language);
		const currentExperience = (
			((progress / 100) * totalExperience) /
			86400000 /
			365
		).toFixed(2);

		progressBar.style.width = `${progress}%`;
		// set the document o f language
		ti = document.getElementById(language);
		lang = language.charAt(0).toUpperCase() + language.slice(1);
		if (lang == "Cplus") {
			lang = "C++";
		}
		ti.innerHTML = `${lang}, Years: ${currentExperience}`;
	}

	languages.forEach((language) => {
		updateProgressBar(language, startDateMap[language]);
	});

	particlesJS("particles-js", {
		particles: {
			number: {
				value: 80,
				density: { enable: true, value_area: 800 },
			},
			color: { value: "#ffffff" },
			shape: {
				type: "circle",
				stroke: { width: 0, color: "#000000" },
				polygon: { nb_sides: 5 },
				image: {
					src: "img/github.svg",
					width: 100,
					height: 100,
				},
			},
			opacity: {
				value: 0.5,
				random: false,
				anim: {
					enable: false,
					speed: 1,
					opacity_min: 0.1,
					sync: false,
				},
			},
			size: {
				value: 3,
				random: true,
				anim: {
					enable: false,
					speed: 40,
					size_min: 0.1,
					sync: false,
				},
			},
			line_linked: {
				enable: true,
				distance: 150,
				color: "#ffffff",
				opacity: 0.4,
				width: 1,
			},
			move: {
				enable: true,
				speed: 6,
				direction: "none",
				random: false,
				straight: false,
				out_mode: "out",
				bounce: false,
				attract: { enable: false, rotateX: 600, rotateY: 1200 },
			},
		},
		interactivity: {
			detect_on: "canvas",
			events: {
				onhover: { enable: true, mode: "repulse" },
				onclick: { enable: true, mode: "push" },
				resize: true,
			},
			modes: {
				grab: { distance: 400, line_linked: { opacity: 1 } },
				bubble: {
					distance: 200,
					size: 20,
					duration: 2,
					opacity: 8,
					speed: 3,
				},
				repulse: { distance: 100, duration: 0.4 },
				push: { particles_nb: 4 },
				remove: { particles_nb: 2 },
			},
		},
		retina_detect: true,
	});

	update = function () {
		requestAnimationFrame(update);
	};
	requestAnimationFrame(update);
}

// Dynamic project listing (modular IIFE to avoid global leakage)
(function () {
	const GRID_ID = "projectGrid";
	const DATA_URL = "projects.json";
	const PAGE_SIZE = 6; // number of projects per load

	let allProjects = [];
	let filtered = [];
	let renderedCount = 0;
	let currentFilter = "all";
	let currentSearch = "";
	let currentSort = "recent";

	let gridEl, loadMoreBtn, searchInput, sortSelect, filterButtons;

	function cacheEls() {
		gridEl = document.getElementById(GRID_ID);
		loadMoreBtn = document.getElementById("loadMoreProjects");
		searchInput = document.getElementById("projectSearch");
		sortSelect = document.getElementById("projectSort");
		filterButtons = document.querySelectorAll(".filter-btn");
	}

	function fetchProjects() {
		return fetch(DATA_URL)
			.then((r) => {
				if (!r.ok) throw new Error("Failed to load projects");
				return r.json();
			})
			.then((data) => {
				allProjects = enrichProjects(data);
				applyFilters();
			})
			.catch((err) => {
				console.error(err);
				if (gridEl)
					gridEl.innerHTML = `<p class="error">Unable to load projects right now.</p>`;
			});
	}

	function enrichProjects(list) {
		// Add derived fields: date fallback order index for sorting recent
		return list.map((p, i) => ({ order: i, ...p }));
	}

	function applyFilters() {
		filtered = allProjects.filter((p) => {
			const categoryMatch =
				currentFilter === "all" ||
				(p.category && p.category.includes(currentFilter));
			const text = (
				p.title +
				" " +
				(p.description || "") +
				" " +
				(p.tags || []).join(" ")
			).toLowerCase();
			const searchMatch =
				!currentSearch || text.includes(currentSearch.toLowerCase());
			return categoryMatch && searchMatch;
		});
		sortFiltered();
		renderedCount = 0;
		gridEl.innerHTML = "";
		renderMore();
	}

	function safeTime(p) {
		if (!p || !p.date) return NaN;
		const t = Date.parse(p.date);
		return Number.isNaN(t) ? NaN : t;
	}

	function sortFiltered() {
		if (currentSort === "az") {
			filtered.sort((a, b) => a.title.localeCompare(b.title));
		} else if (currentSort === "za") {
			filtered.sort((a, b) => b.title.localeCompare(a.title));
		} else if (currentSort === "recent") {
			// Newest first by date; fallback to original insertion order when date is missing/invalid
			filtered.sort((a, b) => {
				const bt = safeTime(b);
				const at = safeTime(a);
				const aHas = !Number.isNaN(at);
				const bHas = !Number.isNaN(bt);
				if (aHas && bHas) return bt - at;
				if (aHas && !bHas) return -1;
				if (!aHas && bHas) return 1;
				return b.order - a.order;
			});
		}
	}

	function createCard(project) {
		const card = document.createElement("article");
		card.className = "project-card";
		card.tabIndex = 0;
		const tagHtml = (project.tags || [])
			.map((t) => `<span class="project-tag">${t}</span>`)
			.join("");
		const links = project.links || {}; // possible keys: repo, demo, web, appstore, playstore, youtube, documentation
		const linkFragments = Object.entries(links)
			.map(([k, url]) => {
				const key = (k || "").toLowerCase();
				const labelMap = {
					repo: "Code",
					demo: "Demo",
					web: "Web",
					appstore: "App Store",
					playstore: "Play Store",
					youtube: "YouTube",
					documentation: "Docs",
				};
				const label =
					labelMap[key] ||
					(key ? key.charAt(0).toUpperCase() + key.slice(1) : "Link");
				return `<a class="project-link" href="${url}" target="_blank" rel="noopener" aria-label="Open ${project.title} ${label}">${label}</a>`;
			})
			.join("");
		card.innerHTML = `
            <div class="project-card__media">
                <img src="${project.image}" alt="${
			project.title
		}" loading="lazy" />
            </div>
            <div class="project-card__body">
                <h3 class="project-card__title">${project.title}</h3>
                <p class="project-card__desc">${project.description || ""}</p>
                <div class="project-card__tags">${tagHtml}</div>
                <div class="project-card__links">${linkFragments}</div>
            </div>`;
		return card;
	}

	function renderMore() {
		const slice = filtered.slice(renderedCount, renderedCount + PAGE_SIZE);
		if (slice.length === 0 && renderedCount === 0) {
			gridEl.innerHTML = "<p>No projects match your filters.</p>";
		} else {
			const frag = document.createDocumentFragment();
			slice.forEach((p) => frag.appendChild(createCard(p)));
			gridEl.appendChild(frag);
		}
		renderedCount += slice.length;
		updateLoadMoreVisibility();
	}

	function updateLoadMoreVisibility() {
		if (!loadMoreBtn) return;
		const hasMore = renderedCount < filtered.length;
		loadMoreBtn.style.display = hasMore ? "inline-block" : "none";
	}

	function handleFilterClick(e) {
		const btn = e.currentTarget;
		filterButtons.forEach((b) => {
			b.classList.remove("is-active");
			b.setAttribute("aria-pressed", "false");
		});
		btn.classList.add("is-active");
		btn.setAttribute("aria-pressed", "true");
		currentFilter = btn.dataset.filter;
		applyFilters();
	}

	function attachEvents() {
		filterButtons.forEach((btn) =>
			btn.addEventListener("click", handleFilterClick)
		);
		if (searchInput) {
			searchInput.addEventListener("input", () => {
				currentSearch = searchInput.value.trim();
				applyFilters();
			});
		}
		if (sortSelect) {
			sortSelect.addEventListener("change", () => {
				currentSort = sortSelect.value;
				applyFilters();
			});
		}
		if (loadMoreBtn) {
			loadMoreBtn.addEventListener("click", renderMore);
		}
	}

	document.addEventListener("DOMContentLoaded", () => {
		cacheEls();
		if (!gridEl) {
			return;
		}
		attachEvents();
		fetchProjects();
	});
})();
