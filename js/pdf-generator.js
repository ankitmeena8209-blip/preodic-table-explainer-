// pdf-generator.js

// State management
let isGeneratingPDF = false;

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
}

// Ensure the button state functions handle the DOM correctly
function setButtonState(state, message = "") {
    const btn = document.getElementById("nav-pdf-btn");
    if (!btn) return;

    const iconSpan = btn.querySelector('.material-symbols-outlined');
    const textSpan = btn.querySelector('.hidden.sm\\:inline');

    if (state === 'loading') {
        btn.disabled = true;
        btn.classList.add('opacity-80', 'cursor-not-allowed');
        btn.classList.remove('hover:-translate-y-0.5', 'hover:shadow-lg', 'hover:from-blue-500', 'hover:to-indigo-500', 'bg-red-500', 'hover:bg-red-600');
        if (iconSpan) {
            iconSpan.textContent = 'hourglass_empty';
            iconSpan.classList.add('animate-spin');
        }
        if (textSpan) textSpan.textContent = 'Generating PDF...';
    } else if (state === 'error') {
        btn.disabled = false;
        btn.classList.remove('opacity-80', 'cursor-not-allowed', 'bg-gradient-to-r', 'from-blue-600', 'to-indigo-600');
        btn.classList.add('bg-red-500', 'hover:bg-red-600');
        if (iconSpan) {
            iconSpan.textContent = 'error';
            iconSpan.classList.remove('animate-spin');
        }
        if (textSpan) textSpan.textContent = 'Retry PDF';
        
        if (message) {
            alert(`PDF Generation Failed: ${message}`);
        }
    } else { // default / success
        btn.disabled = false;
        btn.classList.remove('opacity-80', 'cursor-not-allowed', 'bg-red-500', 'hover:bg-red-600');
        btn.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-indigo-600', 'hover:-translate-y-0.5', 'hover:shadow-lg', 'hover:from-blue-500', 'hover:to-indigo-500');
        if (iconSpan) {
            iconSpan.textContent = 'picture_as_pdf';
            iconSpan.classList.remove('animate-spin');
        }
        if (textSpan) textSpan.textContent = 'PDF';
    }
}

async function fetchWikipediaSummary(elementName) {
    // Check global WIKI_CACHE if it exists
    if (window.WIKI_CACHE && window.WIKI_CACHE[elementName] && window.WIKI_CACHE[elementName].extract) {
        return window.WIKI_CACHE[elementName].extract;
    }
    try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(elementName)}`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (window.WIKI_CACHE) {
            window.WIKI_CACHE[elementName] = data;
        }
        return data.extract;
    } catch (e) {
        return null; // Fallback failed gracefully
    }
}

function drawMiniPeriodicTable(doc, startX, startY, activeElement) {
    const boxSize = 2.5;
    
    // Standard coordinates (1-based cols and rows)
    const coords = {
        1: [1,1], 2: [18,1],
        3: [1,2], 4: [2,2], 5:[13,2], 6:[14,2], 7:[15,2], 8:[16,2], 9:[17,2], 10:[18,2],
        11: [1,3], 12: [2,3], 13:[13,3], 14:[14,3], 15:[15,3], 16:[16,3], 17:[17,3], 18:[18,3],
        19: [1,4], 20: [2,4], 21:[3,4], 22:[4,4], 23:[5,4], 24:[6,4], 25:[7,4], 26:[8,4], 27:[9,4], 28:[10,4], 29:[11,4], 30:[12,4], 31:[13,4], 32:[14,4], 33:[15,4], 34:[16,4], 35:[17,4], 36:[18,4],
        37: [1,5], 38: [2,5], 39:[3,5], 40:[4,5], 41:[5,5], 42:[6,5], 43:[7,5], 44:[8,5], 45:[9,5], 46:[10,5], 47:[11,5], 48:[12,5], 49:[13,5], 50:[14,5], 51:[15,5], 52:[16,5], 53:[17,5], 54:[18,5],
        55: [1,6], 56: [2,6], 72:[4,6], 73:[5,6], 74:[6,6], 75:[7,6], 76:[8,6], 77:[9,6], 78:[10,6], 79:[11,6], 80:[12,6], 81:[13,6], 82:[14,6], 83:[15,6], 84:[16,6], 85:[17,6], 86:[18,6],
        87: [1,7], 88: [2,7], 104:[4,7], 105:[5,7], 106:[6,7], 107:[7,7], 108:[8,7], 109:[9,7], 110:[10,7], 111:[11,7], 112:[12,7], 113:[13,7], 114:[14,7], 115:[15,7], 116:[16,7], 117:[17,7], 118:[18,7]
    };
    
    // Lanthanides
    for(let i=57; i<=71; i++) coords[i] = [i-57+3, 8.5];
    // Actinides
    for(let i=89; i<=103; i++) coords[i] = [i-89+3, 9.5];

    for (let i = 1; i <= 118; i++) {
        if (!coords[i]) continue;
        const [cx, cy] = coords[i];
        const x = startX + (cx - 1) * boxSize;
        const y = startY + (cy - 1) * boxSize;
        
        if (i === activeElement.atomicNumber) {
            doc.setFillColor(37, 99, 235); // blue-600
            doc.rect(x, y, boxSize, boxSize, 'F');
        } else {
            doc.setFillColor(226, 232, 240); // slate-200
            doc.rect(x, y, boxSize, boxSize, 'F');
        }
    }
}

window.downloadStudySheet = async function() {
    if (isGeneratingPDF) return;
    
    const hash = window.location.hash;
    const path = window.location.pathname;
    let elementIdStr = null;
    
    if (window.currentElementId) {
        elementIdStr = window.currentElementId.toString();
    } else if (hash.startsWith("#element-")) {
        elementIdStr = hash.replace("#element-", "");
    } else if (hash.startsWith("#element/")) {
        elementIdStr = hash.replace("#element/", "");
    } else if (path.includes("/elements/")) {
        elementIdStr = path.split("/elements/")[1].replace("/", "");
    }

    if (!elementIdStr) {
        alert("Please select an element first to download its study sheet.");
        return;
    }
    
    let el = null;
    if (!isNaN(elementIdStr)) {
        el = ELEMENTS_DATA.find(e => e.atomicNumber === parseInt(elementIdStr));
    } else {
        el = ELEMENTS_DATA.find(e => e.name.toLowerCase() === elementIdStr.toLowerCase() || e.symbol.toLowerCase() === elementIdStr.toLowerCase());
    }

    if (!el) {
        alert("Element not found.");
        return;
    }

    try {
        isGeneratingPDF = true;
        setButtonState('loading');

        // Lazy load libraries sequentially to avoid race conditions
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js");

        // Wait a tick to ensure scripts are fully registered on window
        await new Promise(r => setTimeout(r, 100));

        if (!window.jspdf || !window.jspdf.jsPDF) {
            throw new Error("jsPDF failed to initialize.");
        }

        // Fetch optional sections fallback if missing
        let history = el.sections.historyDiscovery || "";
        let occurrence = el.sections.whereFound || "";
        let interestingFacts = el.sections.interestingFacts || "";

        if (!history || !occurrence || !interestingFacts) {
            const wikiSummary = await fetchWikipediaSummary(el.name);
            if (wikiSummary) {
                if (!history) history = wikiSummary;
                if (!occurrence) occurrence = "Refer to summary for occurrence context.";
                if (!interestingFacts) interestingFacts = wikiSummary.split('. ').slice(0, 3).join('. ') + '.';
            }
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        
        const margin = 15;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        
        // Header
        const headerHeight = 55;
        doc.setFillColor(30, 41, 59); // Primary dark blue
        doc.rect(0, 0, pageWidth, headerHeight, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.text(`${el.name} (${el.symbol})`, margin, 36);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Atomic Number: ${el.atomicNumber}  |  Atomic Mass: ${el.atomicMass} u`, margin, 46);
        
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(10);
        // Website name positioned safely on the left to avoid overlap
        doc.text("FRZI Labs - Element Study Sheet", margin, 20);

        // Draw Mini Periodic Table indicator safely inside printable area on the right
        const tableWidth = 45;
        drawMiniPeriodicTable(doc, pageWidth - margin - tableWidth, 20, el);

        let currentY = headerHeight + 10;
        
        function addSectionTitle(title) {
            if (currentY > pageHeight - 30) {
                doc.addPage();
                currentY = 20;
            }
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text(title, margin, currentY);
            doc.setDrawColor(226, 232, 240);
            doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
            currentY += 10;
        }

        function addText(text) {
            if (!text) return;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(51, 65, 85);
            let cleanText = text.replace(/<[^>]*>?/gm, '').replace(/&amp;/g, '&');
            const lines = doc.splitTextToSize(cleanText, pageWidth - margin * 2);
            
            if (currentY + (lines.length * 5) > pageHeight - 20) {
                doc.addPage();
                currentY = 20;
            }
            doc.text(lines, margin, currentY);
            currentY += (lines.length * 5) + 5;
        }

        // --- Content ---
        addSectionTitle("Quick Summary");
        addText(el.sections.whatIsThis || `${el.name} is a chemical element with the symbol ${el.symbol} and atomic number ${el.atomicNumber}.`);
        
        if (currentY > pageHeight - 60) { doc.addPage(); currentY = 20; }
        addSectionTitle("Physical & Chemical Properties");
        doc.autoTable({
            startY: currentY,
            margin: { left: margin, right: margin },
            head: [['Property', 'Value', 'Property', 'Value']],
            body: [
                ['Category', el.category, 'State (STP)', el.state],
                ['Period / Group', `${el.period} / ${el.group}`, 'Valency', el.valency],
                ['Electron Config', el.electronConfiguration, 'Shells', el.electronShells.join(', ')],
                ['Melting Point', el.meltingPoint, 'Boiling Point', el.boilingPoint],
                ['Density', el.density, 'Electronegativity', el.electronegativity],
                ['Atomic Radius', el.atomicRadius, 'Ionization Energy', el.ionizationEnergy]
            ],
            theme: 'grid',
            headStyles: { fillColor: [56, 189, 248] }, // sky-400
            styles: { fontSize: 9, cellPadding: 3 }
        });
        currentY = doc.lastAutoTable.finalY + 10;

        addSectionTitle("Discovery Information");
        addText(history || `${el.name} was discovered by ${el.discoverer} in ${el.discoveryYear}.`);
        
        addSectionTitle("Everyday & Industrial Uses");
        addText(`Everyday: ${el.sections.everydayUses || 'No common everyday uses listed.'}`);
        addText(`Industrial: ${el.sections.industrialApps || 'No specific industrial applications listed.'}`);
        if (el.sections.biologicalImportance) addText(`Biological Role: ${el.sections.biologicalImportance}`);
        
        if (el.sections.commonCompounds && el.sections.commonCompounds.name) {
            addSectionTitle("Common Compounds");
            addText(`${el.sections.commonCompounds.name} (${el.sections.commonCompounds.formula}): ${el.sections.commonCompounds.description}`);
        }

        addSectionTitle("Safety Notes");
        addText(el.sections.safetyInfo || "Standard chemical safety protocols apply.");
        
        addSectionTitle("Interesting Facts");
        addText(interestingFacts || `The atomic radius of ${el.name} is ${el.atomicRadius}.`);

        addSectionTitle("Exam Notes & Memory Tricks");
        addText(`Memory Trick: Think of the symbol '${el.symbol}' to remember ${el.name}.`);
        addText(`Exam Focus: Remember atomic number ${el.atomicNumber}, category: ${el.category}, and valency of ${el.valency} for balancing equations.`);
        
        // Add QR Code at the bottom of the last page
        const currentUrl = window.location.href.split('#')[0] + `#element/${el.name.toLowerCase()}`;
        const qrContainer = document.createElement("div");
        new window.QRCode(qrContainer, {
            text: currentUrl,
            width: 128,
            height: 128
        });
        
        // Wait for QR code canvas to be drawn
        await new Promise(r => setTimeout(r, 200));
        
        const qrCanvas = qrContainer.querySelector("canvas");
        if (qrCanvas) {
            const qrDataUrl = qrCanvas.toDataURL("image/jpeg");
            if (currentY > pageHeight - 40) { doc.addPage(); currentY = 20; }
            doc.addImage(qrDataUrl, 'JPEG', pageWidth - margin - 35, currentY, 35, 35);
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text("Scan to view", pageWidth - margin - 35, currentY + 40);
            doc.text("Interactive Page", pageWidth - margin - 35, currentY + 45);
        }

        // Generate safe filename e.g. oxygen-study-sheet.pdf
        const safeName = el.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        doc.save(`${safeName}-study-sheet.pdf`);
        setButtonState('default');

    } catch (error) {
        console.error("PDF Generation Error:", error);
        setButtonState('error', error.message);
    } finally {
        isGeneratingPDF = false;
    }
};
