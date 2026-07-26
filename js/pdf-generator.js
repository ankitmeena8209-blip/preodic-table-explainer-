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
        if (textSpan) textSpan.textContent = 'Generating...';
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

window.downloadStudySheet = async function() {
    if (isGeneratingPDF) return;
    
    if (typeof currentElementId === 'undefined' || !currentElementId) {
        alert("Please select an element first to download its study sheet.");
        return;
    }
    
    const el = ELEMENTS_DATA.find(e => e.atomicNumber === currentElementId);
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
        doc.setFillColor(30, 41, 59); // Primary dark blue
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.text(`${el.name} (${el.symbol})`, margin, 25);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Atomic Number: ${el.atomicNumber}  |  Atomic Mass: ${el.atomicMass} u`, margin, 33);
        
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(10);
        doc.text("FRZI Labs - Element Study Sheet", pageWidth - margin - 55, 25);

        let currentY = 50;
        
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
            // Replace some html entities and tags just in case
            let cleanText = text.replace(/<[^>]*>?/gm, '').replace(/&amp;/g, '&');
            const lines = doc.splitTextToSize(cleanText, pageWidth - margin * 2);
            
            // Check page boundaries for each block of lines
            if (currentY + (lines.length * 5) > pageHeight - 20) {
                doc.addPage();
                currentY = 20;
            }
            doc.text(lines, margin, currentY);
            currentY += (lines.length * 5) + 5;
        }

        // --- Content ---
        addSectionTitle("Summary & Key Facts");
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

        addSectionTitle("Discovery & History");
        addText(history || `${el.name} was discovered by ${el.discoverer} in ${el.discoveryYear}.`);
        
        addSectionTitle("Extraction & Occurrence");
        addText(occurrence || "Found in various natural occurrences depending on its reactivity.");
        addText(el.sections.howExtracted || "");
        
        addSectionTitle("Everyday & Industrial Uses");
        addText(`Everyday: ${el.sections.everydayUses || 'No common everyday uses listed.'}`);
        addText(`Industrial: ${el.sections.industrialApps || 'No specific industrial applications listed.'}`);
        addText(`Biological Role: ${el.sections.biologicalImportance || 'No known biological role.'}`);
        
        if (el.sections.commonCompounds && el.sections.commonCompounds.name) {
            addSectionTitle("Common Compounds");
            addText(`${el.sections.commonCompounds.name} (${el.sections.commonCompounds.formula}): ${el.sections.commonCompounds.description}`);
        }

        addSectionTitle("Safety Information");
        addText(el.sections.safetyInfo || "Standard chemical safety protocols apply.");
        
        addSectionTitle("Interesting Facts");
        addText(interestingFacts || `The atomic radius of ${el.name} is ${el.atomicRadius}.`);

        addSectionTitle("Exam Notes & Memory Tricks");
        addText(`Memory Trick: Think of the symbol '${el.symbol}' to remember ${el.name}.`);
        addText(`Exam Focus: Remember atomic number ${el.atomicNumber}, category: ${el.category}, and valency of ${el.valency} for balancing equations.`);
        
        // Add QR Code at the bottom of the last page
        const currentUrl = window.location.href.split('#')[0] + `#element/${el.atomicNumber}`;
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

        doc.save(`${el.name}_Study_Sheet.pdf`);
        setButtonState('default');

    } catch (error) {
        console.error("PDF Generation Error:", error);
        setButtonState('error', error.message);
    } finally {
        isGeneratingPDF = false;
    }
};
