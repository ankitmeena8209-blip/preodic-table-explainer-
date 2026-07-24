// Frzi Labs - Periodic Table Application Engine

document.addEventListener("DOMContentLoaded", () => {
    // State management
    let activeFilter = "all";
    let searchQuery = "";
    let currentElementId = null;
    let threejsInstance = null;

    const mainContainer = document.getElementById("app-main-content");
    const searchInput = document.getElementById("element-search-input");
    const searchResultsDropdown = document.getElementById("search-results-dropdown");

    // Category mapping for Tailwind border & highlight classes
    const categoryClasses = {
        "alkali": "category-alkali border-red-400/80 text-red-700 dark:text-red-300",
        "alkaline-earth": "category-alkaline-earth border-orange-400/80 text-orange-700 dark:text-orange-300",
        "transition": "category-transition border-amber-400/80 text-amber-700 dark:text-amber-300",
        "basic-metal": "category-basic-metal border-emerald-400/80 text-emerald-700 dark:text-emerald-300",
        "metalloid": "category-metalloid border-cyan-400/80 text-cyan-700 dark:text-cyan-300",
        "nonmetal": "category-nonmetal border-indigo-400/80 text-indigo-700 dark:text-indigo-300",
        "halogen": "category-halogen border-purple-400/80 text-purple-700 dark:text-purple-300",
        "noble-gas": "category-noble-gas border-rose-400/80 text-rose-700 dark:text-rose-300",
        "lanthanide": "category-lanthanide border-teal-400/80 text-teal-700 dark:text-teal-300",
        "actinide": "category-actinide border-fuchsia-400/80 text-fuchsia-700 dark:text-fuchsia-300"
    };

    const categoryNames = {
        "all": "All Elements (118)",
        "alkali": "Alkali Metals",
        "alkaline-earth": "Alkaline Earth",
        "transition": "Transition Metals",
        "basic-metal": "Post-Transition",
        "metalloid": "Metalloids",
        "nonmetal": "Reactive Nonmetals",
        "halogen": "Halogens",
        "noble-gas": "Noble Gases",
        "lanthanide": "Lanthanides",
        "actinide": "Actinides"
    };

    // Calculate grid coordinates for all 118 elements
    function getGridCoords(el) {
        const num = el.atomicNumber;
        const grp = el.group;
        const per = el.period;

        // Lanthanides (57-71)
        if (num >= 57 && num <= 71) {
            return { col: (num - 57) + 4, row: 9 };
        }
        // Actinides (89-103)
        if (num >= 89 && num <= 103) {
            return { col: (num - 89) + 4, row: 10 };
        }
        // Main grid elements
        let col = grp;
        let row = per;
        if (num >= 72 && num <= 86) col = (num - 72) + 4;
        if (num >= 104 && num <= 118) col = (num - 104) + 4;

        return { col, row };
    }

    // Initialize SPA Router based on URL Hash
    function handleRoute() {
        const navPopover = document.getElementById("nav-search-popover");
        if (navPopover) navPopover.classList.add("hidden");

        const hash = window.location.hash;
        if (hash.startsWith("#element-") || hash.startsWith("#element/")) {
            const idStr = hash.replace("#element-", "").replace("#element/", "");
            let el = ELEMENTS_DATA.find(e => e.atomicNumber.toString() === idStr || e.symbol.toLowerCase() === idStr.toLowerCase() || e.name.toLowerCase() === idStr.toLowerCase());
            if (el) {
                renderElementDetailView(el);
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }
        }
        // Default Explorer view
        renderExplorerView();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    window.addEventListener("hashchange", handleRoute);

    // ==========================================
    // EXPLORER VIEW RENDERER
    // ==========================================
    function renderExplorerView() {
        currentElementId = null;
        if (threejsInstance && threejsInstance.destroy) {
            threejsInstance.destroy();
            threejsInstance = null;
        }

        mainContainer.innerHTML = `
            <!-- Hero Section -->
            <section class="relative pt-32 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex flex-col items-center justify-center min-h-[600px] text-center overflow-hidden">
                <!-- 3D Atom Background preview -->
                <div class="absolute inset-0 z-0 opacity-25 pointer-events-none flex items-center justify-center">
                    <div id="hero-threejs-container" class="w-full h-full max-w-[700px] max-h-[700px]"></div>
                </div>

                <div class="relative z-10 max-w-4xl">
                    <div class="inline-block mb-6 px-4 py-1.5 rounded-full border border-outline-variant/30 bg-surface-container-lowest/70 backdrop-blur-md shadow-sm">
                        <span class="font-label-caps text-label-caps text-secondary tracking-widest uppercase">Interactive Exhibition • 118 Elements</span>
                    </div>
                    <h1 class="font-display-xl-mobile md:font-display-xl text-display-xl-mobile md:text-display-xl text-primary mb-6 tracking-tighter text-balance font-semibold">
                        Discover the Building Blocks of the Universe
                    </h1>
                    <p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10 text-balance leading-relaxed">
                        Explore all 118 chemical elements through interactive 3D atomic structures, real-world applications, chemical reactions, and discovery histories.
                    </p>

                    <!-- Interactive Search Bar -->
                    <div class="relative max-w-xl mx-auto mb-8 w-full z-30">
                        <div class="relative flex items-center bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-lg focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
                            <span class="material-symbols-outlined text-on-surface-variant pl-4 text-2xl">search</span>
                            <input id="hero-search-input" type="text" placeholder="Search by Name (Gold), Symbol (Au), or Atomic Number (79)..." 
                                value="${searchQuery}"
                                class="w-full py-4 pl-3 pr-4 bg-transparent text-primary placeholder:text-on-surface-variant/60 focus:outline-none font-body-md" />
                            <button id="clear-search-btn" class="${searchQuery ? 'block' : 'hidden'} pr-4 text-on-surface-variant hover:text-primary">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <!-- Search Dropdown Results -->
                        <div id="hero-search-dropdown" class="hidden absolute left-0 right-0 top-full mt-2 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-50 divide-y divide-outline-variant/10 text-left"></div>
                    </div>

                    <!-- Action buttons -->
                    <div class="flex flex-wrap items-center justify-center gap-4">
                        <a href="#element/8" class="px-8 py-4 bg-primary text-on-primary rounded-xl font-label-caps text-label-caps uppercase tracking-wider hover:bg-inverse-surface transition-colors duration-300 shadow-md">
                            Featured: Oxygen (8)
                        </a>
                        <a href="#element/79" class="px-8 py-4 bg-transparent border border-outline-variant text-primary rounded-xl font-label-caps text-label-caps uppercase tracking-wider hover:bg-surface-container-low transition-colors duration-300 flex items-center gap-2">
                            <span class="material-symbols-outlined text-sm font-bold">stars</span>
                            Gold (79)
                        </a>
                    </div>
                </div>
            </section>

            <!-- Periodic Table Filter Bar & Grid Section -->
            <section class="py-12 px-2 md:px-margin-desktop max-w-container-max mx-auto overflow-x-auto">
                <div class="flex flex-wrap items-center justify-center gap-2 mb-8" id="filter-pills-wrapper">
                    ${Object.keys(categoryNames).map(catKey => `
                        <button data-filter="${catKey}" class="filter-pill px-4 py-2 rounded-full font-label-caps text-xs transition-all duration-300 border ${activeFilter === catKey ? 'bg-primary text-on-primary border-primary shadow-sm scale-105' : 'bg-surface-container-lowest/80 text-on-surface-variant border-outline-variant/30 hover:border-primary/50'}">
                            ${categoryNames[catKey]}
                        </button>
                    `).join('')}
                </div>

                <!-- Periodic Table Grid -->
                <div class="min-w-[1100px] p-4 bg-surface-container-lowest/40 backdrop-blur-md rounded-2xl border border-outline-variant/20 shadow-sm">
                    <div class="periodic-grid gap-1.5 md:gap-2">
                        ${renderGridCells()}

                        <!-- Lanthanide placeholder label row 6 col 3 -->
                        <div class="element-cell glass-panel aspect-square flex flex-col items-center justify-center p-1 rounded-lg border border-dashed border-teal-400/50 bg-teal-500/5 text-teal-700 dark:text-teal-300 text-center" style="grid-column: 3; grid-row: 6;">
                            <span class="font-label-mono text-[9px] font-bold">57-71</span>
                            <span class="font-label-caps text-[10px] uppercase font-semibold">La-Lu</span>
                        </div>

                        <!-- Actinide placeholder label row 7 col 3 -->
                        <div class="element-cell glass-panel aspect-square flex flex-col items-center justify-center p-1 rounded-lg border border-dashed border-fuchsia-400/50 bg-fuchsia-500/5 text-fuchsia-700 dark:text-fuchsia-300 text-center" style="grid-column: 3; grid-row: 7;">
                            <span class="font-label-mono text-[9px] font-bold">89-103</span>
                            <span class="font-label-caps text-[10px] uppercase font-semibold">Ac-Lr</span>
                        </div>
                    </div>

                    <!-- Table Footer Legend -->
                    <div class="mt-6 flex flex-wrap justify-between items-center text-xs font-label-mono text-on-surface-variant/80 border-t border-outline-variant/10 pt-4 px-2">
                        <span>Rows 1–7: Periods • Columns 1–18: Groups</span>
                        <span>* Lanthanides & Actinides separated below</span>
                    </div>
                </div>
            </section>

            <!-- Element of the Day & Discovery Timeline -->
            <section class="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
                    <!-- Element of the Day (Gold Au #79) -->
                    <div class="md:col-span-5 glass-panel p-8 rounded-2xl relative overflow-hidden group border border-outline-variant/20 shadow-md">
                        <div class="absolute top-0 right-0 p-8 opacity-10 font-display-xl text-[120px] leading-none pointer-events-none transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110 duration-700 font-bold">
                            Au
                        </div>
                        <h3 class="font-label-caps text-label-caps text-secondary mb-8 uppercase tracking-widest font-semibold">Element of the Day</h3>
                        <div class="flex items-end gap-6 mb-8">
                            <div class="w-32 h-32 rounded-2xl bg-surface-container-lowest border border-amber-400 flex flex-col items-center justify-center shadow-md">
                                <span class="font-label-mono text-sm self-start pl-3 pt-2 text-on-surface-variant font-medium">79</span>
                                <span class="font-display-xl-mobile text-display-xl-mobile font-bold text-primary">Au</span>
                                <span class="font-label-mono text-xs text-on-surface-variant pb-2">196.97</span>
                            </div>
                            <div>
                                <h2 class="font-headline-lg text-headline-lg text-primary mb-2 font-semibold">Gold</h2>
                                <span class="px-3 py-1 rounded-full text-xs font-label-caps border border-amber-400 text-amber-600 bg-amber-400/10 uppercase font-semibold">Transition Metal</span>
                            </div>
                        </div>
                        <p class="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed">
                            A dense, soft, malleable, and highly ductile metal with a bright yellow metallic luster. Extremely resistant to corrosion and chemical oxidation.
                        </p>
                        <a href="#element/79" class="inline-flex text-primary font-label-caps text-label-caps uppercase tracking-wider items-center gap-2 hover:text-secondary transition-colors font-semibold">
                            View Details
                            <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>

                    <!-- Timeline Preview -->
                    <div class="md:col-span-7 flex flex-col justify-center">
                        <h3 class="font-headline-lg text-headline-lg text-primary mb-4 font-semibold">Discovery Timeline</h3>
                        <p class="font-body-md text-body-md text-on-surface-variant mb-10 max-w-xl leading-relaxed">
                            Trace the human journey of isolating chemical elements, from antiquity's metals to modern synthetic superheavy elements.
                        </p>
                        <div class="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/30 before:to-transparent">
                            ${[
                                { yr: "Antiquity", name: "Copper (Cu), Gold (Au), Iron (Fe)", desc: "Known since prehistoric times by ancient civilizations." },
                                { yr: "1669", name: "Phosphorus (P)", desc: "First element scientifically isolated by Hennig Brand." },
                                { yr: "1774", name: "Oxygen (O)", desc: "Isolated by Joseph Priestley and Carl Wilhelm Scheele." },
                                { yr: "1869", name: "Mendeleev's Periodic Law", desc: "Dmitri Mendeleev arranged 63 known elements into the first periodic table." },
                                { yr: "2016", name: "Oganesson (Og #118)", desc: "Period 7 completed with official recognition of superheavy element 118." }
                            ].map(item => `
                                <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    <div class="flex items-center justify-center w-10 h-10 rounded-full border border-outline-variant/40 bg-surface-container-lowest shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                        <span class="font-label-caps text-[9px] text-primary font-bold">${item.yr}</span>
                                    </div>
                                    <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-outline-variant/15 bg-surface-container-lowest/60 backdrop-blur-sm transition-all hover:border-secondary/40 hover:bg-surface-container-lowest shadow-sm">
                                        <div class="font-semibold text-primary mb-1">${item.name}</div>
                                        <p class="text-xs text-on-surface-variant leading-relaxed">${item.desc}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </section>
        `;

        setupExplorerEvents();
        initHeroThreeJS(8); // Oxygen atom hero preview
        initScrollReveals();
    }

    // Render Grid Cells
    function renderGridCells() {
        return ELEMENTS_DATA.map(el => {
            const { col, row } = getGridCoords(el);
            const catClass = categoryClasses[el.category] || "border-outline-variant/30";

            // Search filter condition
            let isFilteredOut = false;
            if (activeFilter !== "all" && el.category !== activeFilter) {
                isFilteredOut = true;
            }
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchName = el.name.toLowerCase().includes(q);
                const matchSymbol = el.symbol.toLowerCase().includes(q);
                const matchNum = el.atomicNumber.toString() === q;
                if (!matchName && !matchSymbol && !matchNum) {
                    isFilteredOut = true;
                }
            }

            return `
                <a href="#element/${el.atomicNumber}" 
                   title="${el.name} (${el.symbol}) - ${el.category}"
                   class="element-cell glass-panel ${catClass} aspect-square flex flex-col items-center justify-between p-1 md:p-1.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-110 hover:z-30 hover:shadow-xl ${isFilteredOut ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100'}" 
                   style="grid-column: ${col}; grid-row: ${row};">
                    <span class="font-label-mono text-[9px] md:text-[10px] self-start text-on-surface-variant font-medium">${el.atomicNumber}</span>
                    <span class="font-headline-sm text-sm md:text-lg font-bold tracking-tight text-primary">${el.symbol}</span>
                    <span class="font-label-mono text-[7px] md:text-[9px] text-on-surface-variant/80 truncate w-full text-center">${el.atomicMass}</span>
                </a>
            `;
        }).join('');
    }

    // Attach Explorer search & filter events
    function setupExplorerEvents() {
        const heroInput = document.getElementById("hero-search-input");
        const heroDropdown = document.getElementById("hero-search-dropdown");
        const clearBtn = document.getElementById("clear-search-btn");

        if (heroInput) {
            heroInput.addEventListener("input", (e) => {
                searchQuery = e.target.value;
                if (clearBtn) clearBtn.classList.toggle("hidden", !searchQuery);
                updateSearchDropdown(searchQuery, heroDropdown);
                updateGridFilter();
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                searchQuery = "";
                if (heroInput) heroInput.value = "";
                clearBtn.classList.add("hidden");
                if (heroDropdown) heroDropdown.classList.add("hidden");
                updateGridFilter();
            });
        }

        // Filter pills click
        document.querySelectorAll(".filter-pill").forEach(pill => {
            pill.addEventListener("click", (e) => {
                const targetFilter = e.currentTarget.getAttribute("data-filter");
                activeFilter = targetFilter;

                // Update active pill UI
                document.querySelectorAll(".filter-pill").forEach(p => {
                    const isCur = p.getAttribute("data-filter") === activeFilter;
                    p.className = `filter-pill px-4 py-2 rounded-full font-label-caps text-xs transition-all duration-300 border ${isCur ? 'bg-primary text-on-primary border-primary shadow-sm scale-105' : 'bg-surface-container-lowest/80 text-on-surface-variant border-outline-variant/30 hover:border-primary/50'}`;
                });

                updateGridFilter();
            });
        });
    }

    function updateSearchDropdown(query, dropdownEl) {
        if (!dropdownEl) return;
        if (!query.trim()) {
            dropdownEl.classList.add("hidden");
            return;
        }

        const q = query.toLowerCase();
        const matches = ELEMENTS_DATA.filter(el => 
            el.name.toLowerCase().includes(q) || 
            el.symbol.toLowerCase().includes(q) || 
            el.atomicNumber.toString() === q
        ).slice(0, 6);

        if (matches.length === 0) {
            dropdownEl.innerHTML = `<div class="p-4 text-sm text-on-surface-variant">No element found matching "${query}"</div>`;
        } else {
            dropdownEl.innerHTML = matches.map(el => `
                <a href="#element/${el.atomicNumber}" class="flex items-center justify-between p-3 hover:bg-surface-container-low transition-colors">
                    <div class="flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-label-mono text-xs font-bold text-primary">${el.atomicNumber}</span>
                        <div>
                            <span class="font-semibold text-primary">${el.name}</span>
                            <span class="text-xs text-on-surface-variant ml-2 font-label-mono">${el.symbol}</span>
                        </div>
                    </div>
                    <span class="text-xs font-label-caps uppercase px-2 py-0.5 rounded border border-outline-variant/20 text-on-surface-variant">${el.category.replace('-', ' ')}</span>
                </a>
            `).join('');
        }

        dropdownEl.classList.remove("hidden");
    }

    function updateGridFilter() {
        const gridContainer = document.querySelector(".periodic-grid");
        if (gridContainer) {
            const cellsHTML = renderGridCells();
            // Preserve non-element placeholder tiles
            gridContainer.innerHTML = cellsHTML + `
                <div class="element-cell glass-panel aspect-square flex flex-col items-center justify-center p-1 rounded-lg border border-dashed border-teal-400/50 bg-teal-500/5 text-teal-700 dark:text-teal-300 text-center" style="grid-column: 3; grid-row: 6;">
                    <span class="font-label-mono text-[9px] font-bold">57-71</span>
                    <span class="font-label-caps text-[10px] uppercase font-semibold">La-Lu</span>
                </div>
                <div class="element-cell glass-panel aspect-square flex flex-col items-center justify-center p-1 rounded-lg border border-dashed border-fuchsia-400/50 bg-fuchsia-500/5 text-fuchsia-700 dark:text-fuchsia-300 text-center" style="grid-column: 3; grid-row: 7;">
                    <span class="font-label-mono text-[9px] font-bold">89-103</span>
                    <span class="font-label-caps text-[10px] uppercase font-semibold">Ac-Lr</span>
                </div>
            `;
        }
    }


    // ==========================================
    // ELEMENT DETAIL VIEW RENDERER
    // ==========================================
    function renderElementDetailView(el) {
        currentElementId = el.atomicNumber;
        if (threejsInstance && threejsInstance.destroy) {
            threejsInstance.destroy();
            threejsInstance = null;
        }

        const prevEl = ELEMENTS_DATA.find(e => e.atomicNumber === el.atomicNumber - 1);
        const nextEl = ELEMENTS_DATA.find(e => e.atomicNumber === el.atomicNumber + 1);

        mainContainer.innerHTML = `
            <!-- Detail Page Header Bar -->
            <div class="pt-24 pb-6 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex items-center justify-between border-b border-outline-variant/10">
                <a href="#explorer" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-label-caps text-xs uppercase font-semibold tracking-wider hover:bg-inverse-surface transition-all shadow-sm">
                    <span class="material-symbols-outlined text-base">home</span>
                    Back to Home
                </a>
                <div class="flex items-center gap-4 font-label-caps text-xs">
                    ${prevEl ? `<a href="#element/${prevEl.atomicNumber}" class="text-on-surface-variant hover:text-primary flex items-center gap-1">← ${prevEl.symbol} (${prevEl.atomicNumber})</a>` : ''}
                    <span class="text-outline-variant">|</span>
                    ${nextEl ? `<a href="#element/${nextEl.atomicNumber}" class="text-on-surface-variant hover:text-primary flex items-center gap-1">${nextEl.symbol} (${nextEl.atomicNumber}) →</a>` : ''}
                </div>
            </div>

            <main class="pt-8 pb-margin-desktop px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto space-y-24">
                <!-- Hero Section: Stats & 3D Model -->
                <section class="grid grid-cols-1 md:grid-cols-2 gap-margin-desktop items-center min-h-[600px]">
                    <!-- Left: Stats -->
                    <div class="space-y-10 z-10 reveal-up">
                        <div class="space-y-2">
                            <div class="flex items-baseline gap-4 flex-wrap">
                                <h1 class="text-[140px] md:text-[180px] leading-none font-bold tracking-tighter text-primary">${el.symbol}</h1>
                                <div class="flex flex-col">
                                    <span class="font-display-xl-mobile md:font-display-xl text-display-xl-mobile md:text-display-xl text-primary font-bold">${el.name}</span>
                                    <span class="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest mt-2 font-semibold">Atomic Number ${el.atomicNumber}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Bento Stats Grid -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant/20 p-5 rounded-2xl hover:bg-surface-container-lowest transition-all shadow-sm">
                                <div class="font-label-caps text-xs text-on-surface-variant mb-1">Atomic Mass</div>
                                <div class="font-label-mono text-primary text-xl font-bold">${el.atomicMass} u</div>
                            </div>
                            <div class="bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant/20 p-5 rounded-2xl hover:bg-surface-container-lowest transition-all shadow-sm">
                                <div class="font-label-caps text-xs text-on-surface-variant mb-1">Category</div>
                                <div class="font-body-md text-primary font-semibold capitalize">${el.category.replace('-', ' ')}</div>
                            </div>
                            <div class="bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant/20 p-5 rounded-2xl hover:bg-surface-container-lowest transition-all shadow-sm">
                                <div class="font-label-caps text-xs text-on-surface-variant mb-1">Period / Group</div>
                                <div class="font-label-mono text-primary text-xl font-bold">${el.period} / ${el.group}</div>
                            </div>
                            <div class="bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant/20 p-5 rounded-2xl hover:bg-surface-container-lowest transition-all shadow-sm">
                                <div class="font-label-caps text-xs text-on-surface-variant mb-1">Electron Config</div>
                                <div class="font-label-mono text-primary text-sm font-semibold truncate">${el.electronConfiguration}</div>
                            </div>
                            <div class="bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant/20 p-5 rounded-2xl hover:bg-surface-container-lowest transition-all shadow-sm">
                                <div class="font-label-caps text-xs text-on-surface-variant mb-1">State (STP)</div>
                                <div class="font-body-md text-primary font-semibold">${el.state}</div>
                            </div>
                            <div class="bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant/20 p-5 rounded-2xl hover:bg-surface-container-lowest transition-all shadow-sm">
                                <div class="font-label-caps text-xs text-on-surface-variant mb-1">Valency</div>
                                <div class="font-label-mono text-primary text-xl font-bold">${el.valency}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: 3D Animated Atom Model Canvas -->
                    <div class="relative h-[400px] md:h-[550px] w-full flex items-center justify-center reveal-up">
                        <div class="absolute inset-0 bg-radial-gradient from-secondary/10 to-transparent rounded-full blur-3xl -z-10"></div>
                        <div id="element-threejs-container" class="w-full h-full"></div>
                    </div>
                </section>

                <!-- Detailed Physical & Chemical Property Grid -->
                <section class="reveal-up space-y-6">
                    <h2 class="font-headline-sm text-headline-sm text-primary border-b border-outline-variant/20 pb-4 font-semibold">
                        Physical & Chemical Metrics
                    </h2>
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div class="bg-surface-container-lowest/60 border border-outline-variant/15 p-4 rounded-xl">
                            <span class="text-xs font-label-caps text-on-surface-variant">Density</span>
                            <p class="font-label-mono font-bold text-primary mt-1 text-sm">${el.density}</p>
                        </div>
                        <div class="bg-surface-container-lowest/60 border border-outline-variant/15 p-4 rounded-xl">
                            <span class="text-xs font-label-caps text-on-surface-variant">Melting Point</span>
                            <p class="font-label-mono font-bold text-primary mt-1 text-sm">${el.meltingPoint}</p>
                        </div>
                        <div class="bg-surface-container-lowest/60 border border-outline-variant/15 p-4 rounded-xl">
                            <span class="text-xs font-label-caps text-on-surface-variant">Boiling Point</span>
                            <p class="font-label-mono font-bold text-primary mt-1 text-sm">${el.boilingPoint}</p>
                        </div>
                        <div class="bg-surface-container-lowest/60 border border-outline-variant/15 p-4 rounded-xl">
                            <span class="text-xs font-label-caps text-on-surface-variant">Electronegativity</span>
                            <p class="font-label-mono font-bold text-primary mt-1 text-sm">${el.electronegativity}</p>
                        </div>
                        <div class="bg-surface-container-lowest/60 border border-outline-variant/15 p-4 rounded-xl">
                            <span class="text-xs font-label-caps text-on-surface-variant">Atomic Radius</span>
                            <p class="font-label-mono font-bold text-primary mt-1 text-sm">${el.atomicRadius}</p>
                        </div>
                        <div class="bg-surface-container-lowest/60 border border-outline-variant/15 p-4 rounded-xl">
                            <span class="text-xs font-label-caps text-on-surface-variant">Ionization Energy</span>
                            <p class="font-label-mono font-bold text-primary mt-1 text-sm">${el.ionizationEnergy}</p>
                        </div>
                    </div>
                </section>

                <!-- Section 1: Overview & Occurrence -->
                <section class="max-w-4xl mx-auto text-center reveal-up space-y-6">
                    <h2 class="font-headline-lg text-headline-lg text-primary font-bold">What is ${el.name}?</h2>
                    <p class="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                        ${el.sections.whatIsThis}
                    </p>
                </section>

                <!-- Section 2: Real Image Illustration & Where Found -->
                <section class="reveal-up space-y-8">
                    <h2 class="font-headline-sm text-headline-sm text-primary border-b border-outline-variant/20 pb-4 font-semibold">Occurrence & Natural State</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                        <!-- Image Card -->
                        <div class="group relative overflow-hidden rounded-2xl bg-surface-container-lowest border border-outline-variant/20 flex flex-col h-96 shadow-sm">
                            <div class="bg-cover bg-center w-full h-64 border-b border-outline-variant/10 group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                                 style="background-image: url('${el.image}')" title="${el.imageAlt}"></div>
                            <div class="p-6 flex-grow flex flex-col justify-center bg-surface-container-lowest">
                                <h3 class="font-headline-sm text-headline-sm text-primary font-semibold">${el.name} Visual Form</h3>
                                <p class="font-body-md text-xs text-on-surface-variant mt-1">${el.appearance}</p>
                            </div>
                        </div>

                        <!-- Card 2: Discovery & Extraction -->
                        <div class="bg-surface-container-lowest border border-outline-variant/20 p-8 rounded-2xl flex flex-col justify-between shadow-sm">
                            <div>
                                <span class="material-symbols-outlined text-4xl text-secondary mb-4">travel_explore</span>
                                <h3 class="font-headline-sm text-headline-sm text-primary mb-3 font-semibold">Where is it found?</h3>
                                <p class="font-body-md text-on-surface-variant leading-relaxed mb-6">${el.sections.whereFound}</p>
                                <h4 class="font-label-caps text-xs uppercase text-primary font-bold mb-1">Extraction Method</h4>
                                <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">${el.sections.howExtracted}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Section 3: Applications & Uses -->
                <section class="reveal-up space-y-8">
                    <h2 class="font-headline-sm text-headline-sm text-primary border-b border-outline-variant/20 pb-4 font-semibold">Applications & Importance</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                        <div class="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-500 shadow-sm">
                            <span class="material-symbols-outlined text-4xl text-secondary mb-4">home</span>
                            <h3 class="font-headline-sm text-headline-sm text-primary mb-2 font-semibold">Everyday Uses</h3>
                            <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">${el.sections.everydayUses}</p>
                        </div>
                        <div class="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-500 shadow-sm">
                            <span class="material-symbols-outlined text-4xl text-secondary mb-4">factory</span>
                            <h3 class="font-headline-sm text-headline-sm text-primary mb-2 font-semibold">Industrial Apps</h3>
                            <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">${el.sections.industrialApps}</p>
                        </div>
                        <div class="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-500 shadow-sm">
                            <span class="material-symbols-outlined text-4xl text-secondary mb-4">diversity_1</span>
                            <h3 class="font-headline-sm text-headline-sm text-primary mb-2 font-semibold">Biological Role</h3>
                            <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">${el.sections.biologicalImportance}</p>
                        </div>
                    </div>
                </section>

                <!-- Section 4 & 5: Compounds & Bohr Model -->
                <section class="grid grid-cols-1 lg:grid-cols-2 gap-margin-desktop reveal-up">
                    <!-- Compounds Visualizer -->
                    <div class="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative min-h-[400px] shadow-sm">
                        <div class="relative z-10">
                            <h3 class="font-headline-sm text-headline-sm text-primary mb-2 font-semibold">Famous Compounds & Reactions</h3>
                            <p class="font-body-md text-on-surface-variant max-w-sm leading-relaxed mb-4">
                                <strong>${el.sections.commonCompounds.name} (${el.sections.commonCompounds.formula})</strong>: ${el.sections.commonCompounds.description}
                            </p>
                            <p class="text-xs text-on-surface-variant font-label-mono">Reactions: ${el.sections.famousReactions}</p>
                        </div>

                        <!-- Molecule Graphic -->
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none mt-20 molecule-float">
                            <div class="relative w-48 h-48 flex items-center justify-center">
                                <div class="w-24 h-24 rounded-full bg-secondary shadow-lg flex items-center justify-center text-on-secondary font-bold text-2xl z-20">${el.symbol}</div>
                                <div class="absolute -bottom-4 left-4 w-12 h-12 rounded-full border border-secondary bg-surface-container-lowest flex items-center justify-center text-primary font-bold z-10">O</div>
                                <div class="absolute bottom-8 left-12 w-16 h-1 bg-outline-variant/40 rotate-[35deg] z-0"></div>
                                <div class="absolute -bottom-4 right-4 w-12 h-12 rounded-full border border-secondary bg-surface-container-lowest flex items-center justify-center text-primary font-bold z-10">H</div>
                                <div class="absolute bottom-8 right-12 w-16 h-1 bg-outline-variant/40 -rotate-[35deg] z-0"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Bohr CSS Shell Animation -->
                    <div class="bg-surface-container-highest/20 border border-outline-variant/20 rounded-2xl p-8 flex flex-col items-center justify-center relative min-h-[400px] overflow-hidden shadow-sm">
                        <div class="absolute top-8 left-8 text-left z-10">
                            <h3 class="font-headline-sm text-headline-sm text-primary mb-1 font-semibold">Bohr Model</h3>
                            <p class="font-label-mono text-xs text-on-surface-variant font-medium">Shells: ${el.electronShells.join(', ')}</p>
                        </div>

                        <!-- Dynamic Bohr Rings -->
                        <div class="relative w-64 h-64 flex items-center justify-center mt-8">
                            <div class="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold z-10 shadow-lg text-xs text-center">
                                ${el.symbol}<br/>${el.atomicNumber}
                            </div>
                            ${el.electronShells.map((count, idx) => {
                                const sizePx = 80 + (idx * 36);
                                const duration = 8 + (idx * 4);
                                return `
                                    <div class="absolute rounded-full border border-outline-variant/50 orbit-ring" 
                                         style="width: ${sizePx}px; height: ${sizePx}px; animation-duration: ${duration}s;">
                                        <div class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-secondary shadow-md"></div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </section>

                <!-- Section 6: History & Safety -->
                <section class="grid grid-cols-1 md:grid-cols-2 gap-gutter reveal-up">
                    <div class="bg-surface-container-lowest border border-outline-variant/20 p-8 rounded-2xl shadow-sm">
                        <h3 class="font-headline-sm text-headline-sm text-primary mb-3 font-semibold">History & Discovery</h3>
                        <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">${el.sections.historyDiscovery}</p>
                    </div>
                    <div class="bg-surface-container-lowest border border-outline-variant/20 p-8 rounded-2xl shadow-sm">
                        <h3 class="font-headline-sm text-headline-sm text-primary mb-3 font-semibold">Safety & Handling</h3>
                        <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">${el.sections.safetyInfo}</p>
                    </div>
                </section>
            </main>
        `;

        initElementThreeJS(el);
        initScrollReveals();
    }


    // ==========================================
    // THREE.JS 3D ATOM MODEL RENDERER
    // ==========================================
    function initHeroThreeJS(elementNum) {
        const container = document.getElementById("hero-threejs-container");
        if (!container) return;
        createAtomScene(container, [2, 6], 8);
    }

    function initElementThreeJS(el) {
        const container = document.getElementById("element-threejs-container");
        if (!container) return;
        createAtomScene(container, el.electronShells, el.atomicNumber);
    }

    function createAtomScene(container, shellsArray, atomicNumber) {
        container.innerHTML = "";
        const width = container.clientWidth || 500;
        const height = container.clientHeight || 500;

        if (typeof THREE === "undefined") return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Nucleus cluster
        const nucleusGroup = new THREE.Group();
        const nucleusParticleCount = Math.min(atomicNumber, 24);
        for (let i = 0; i < nucleusParticleCount; i++) {
            const geo = new THREE.SphereGeometry(0.18, 16, 16);
            const mat = new THREE.MeshPhongMaterial({
                color: i % 2 === 0 ? 0x007AFF : 0x1a1c1c,
                shininess: 80
            });
            const sphere = new THREE.Mesh(geo, mat);
            sphere.position.set(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            );
            nucleusGroup.add(sphere);
        }
        scene.add(nucleusGroup);

        // Shell Groups
        const shellObjects = [];
        shellsArray.forEach((count, sIdx) => {
            const radius = 1.4 + (sIdx * 0.8);
            const shellGroup = new THREE.Group();

            // Ring wireframe
            const ringGeo = new THREE.RingGeometry(radius, radius + 0.012, 64);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x94a3b8,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.35
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            shellGroup.add(ring);

            // Electrons along ring
            const numElectrons = Math.min(count, 12);
            for (let e = 0; e < numElectrons; e++) {
                const eGeo = new THREE.SphereGeometry(0.09, 16, 16);
                const eMat = new THREE.MeshPhongMaterial({ color: 0x007AFF, emissive: 0x0033aa });
                const electron = new THREE.Mesh(eGeo, eMat);
                const angle = (e / numElectrons) * Math.PI * 2;
                electron.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
                shellGroup.add(electron);
            }

            // Tilt shell
            shellGroup.rotation.x = (sIdx * 0.4) + 0.2;
            shellGroup.rotation.z = (sIdx * 0.3);
            scene.add(shellGroup);

            shellObjects.push({
                group: shellGroup,
                speed: 0.015 / (sIdx + 1)
            });
        });

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1.2);
        pointLight.position.set(8, 8, 8);
        scene.add(pointLight);

        camera.position.z = 3.2 + (shellsArray.length * 0.8);

        let animFrameId;
        const animate = () => {
            animFrameId = requestAnimationFrame(animate);
            nucleusGroup.rotation.y += 0.005;
            shellObjects.forEach(s => {
                s.group.rotation.y += s.speed;
            });
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth || 500;
            const h = container.clientHeight || 500;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

        threejsInstance = {
            destroy: () => {
                cancelAnimationFrame(animFrameId);
                window.removeEventListener("resize", handleResize);
                if (renderer.domElement && renderer.domElement.parentNode) {
                    renderer.domElement.parentNode.removeChild(renderer.domElement);
                }
                renderer.dispose();
            }
        };
    }


    // ==========================================
    // SCROLL REVEAL OBSERVER
    // ==========================================
    function initScrollReveals() {
        const observerOptions = {
            root: null,
            rootMargin: "0px",
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

    // Header Search Widget Handler
    function initNavSearch() {
        const toggleBtn = document.getElementById("nav-search-toggle-btn");
        const popover = document.getElementById("nav-search-popover");
        const input = document.getElementById("nav-search-input");
        const dropdown = document.getElementById("nav-search-results-dropdown");
        const clearBtn = document.getElementById("nav-search-clear-btn");

        if (!toggleBtn || !popover || !input) return;

        toggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isHidden = popover.classList.contains("hidden");
            if (isHidden) {
                popover.classList.remove("hidden");
                input.focus();
                if (input.value) updateSearchDropdown(input.value, dropdown);
            } else {
                popover.classList.add("hidden");
            }
        });

        popover.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        input.addEventListener("input", (e) => {
            const query = e.target.value;
            if (clearBtn) clearBtn.classList.toggle("hidden", !query);
            updateSearchDropdown(query, dropdown);
        });

        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                input.value = "";
                clearBtn.classList.add("hidden");
                if (dropdown) dropdown.classList.add("hidden");
                input.focus();
            });
        }

        document.addEventListener("click", () => {
            popover.classList.add("hidden");
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                popover.classList.add("hidden");
            }
        });
    }

    // Initialize Header Search & App Routing
    initNavSearch();
    handleRoute();
});
