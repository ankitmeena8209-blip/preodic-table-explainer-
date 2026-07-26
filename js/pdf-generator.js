// PDF Generator using jsPDF and AutoTable
// Requires: <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
// Requires: <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"></script>
// Requires: <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

window.downloadStudySheet = async function() {
    if (!currentElementId) {
        alert("Please select an element first to download its study sheet.");
        return;
    }
    
    const el = ELEMENTS_DATA.find(e => e.atomicNumber === currentElementId);
    if (!el) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    
    // Config
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

    // Helper for sections
    let currentY = 50;
    
    function addSectionTitle(title) {
        if (currentY > pageHeight - 30) {
            doc.addPage();
            currentY = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(title, margin, currentY);
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
        currentY += 10;
    }

    function addText(text) {
        if (!text) return;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85); // slate-700
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        if (currentY + (lines.length * 5) > pageHeight - 20) {
            doc.addPage();
            currentY = 20;
        }
        doc.text(lines, margin, currentY);
        currentY += (lines.length * 5) + 5;
    }

    // --- Content ---
    addSectionTitle("Summary & Key Facts");
    addText(el.sections.whatIsThis || `This is a comprehensive overview of ${el.name}.`);
    
    // Properties Table
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
    addText(el.sections.historyDiscovery || `${el.name} was discovered by ${el.discoverer} in ${el.discoveryYear}.`);
    
    addSectionTitle("Extraction & Occurrence");
    addText(el.sections.whereFound);
    addText(el.sections.howExtracted);
    
    addSectionTitle("Everyday & Industrial Uses");
    addText(`Everyday: ${el.sections.everydayUses}`);
    addText(`Industrial: ${el.sections.industrialApps}`);
    addText(`Biological Role: ${el.sections.biologicalImportance}`);
    
    addSectionTitle("Safety Information");
    addText(el.sections.safetyInfo);
    
    addSectionTitle("Exam Notes & Memory Tricks");
    // Synthetic data as requested by the prompt for missing optional educational sections
    addText(`Memory Trick: To remember ${el.symbol}, think of the first letters of its name or common compounds.`);
    addText(`Exam Focus: Remember that its atomic number is ${el.atomicNumber} and it belongs to the ${el.category} category. Pay attention to its valency of ${el.valency} for balancing equations.`);
    
    // Add QR Code at the bottom of the last page
    const currentUrl = window.location.href.split('#')[0] + `#element/${el.atomicNumber}`;
    
    const qrContainer = document.createElement("div");
    new QRCode(qrContainer, {
        text: currentUrl,
        width: 128,
        height: 128
    });
    
    setTimeout(() => {
        const qrCanvas = qrContainer.querySelector("canvas");
        if (qrCanvas) {
            const qrDataUrl = qrCanvas.toDataURL("image/jpeg");
            
            if (currentY > pageHeight - 40) { doc.addPage(); currentY = 20; }
            doc.addImage(qrDataUrl, 'JPEG', pageWidth - margin - 35, currentY, 35, 35);
            
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text("Scan to view", pageWidth - margin - 35, currentY + 40);
            doc.text("Interactive Page", pageWidth - margin - 35, currentY + 45);
            
            doc.save(`${el.name}_Study_Sheet.pdf`);
        } else {
            doc.save(`${el.name}_Study_Sheet.pdf`);
        }
    }, 100); // Small delay to let QR code render
};
