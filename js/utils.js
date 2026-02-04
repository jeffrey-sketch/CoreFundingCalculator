// Remove import/export for standard script loading
// Assumes appState, calcAllPublicHolidays are global or loaded before this file

function formatNumber(value, isCurrency = false, decimalPlaces = 2) {
    if (value === null || typeof value === 'undefined' || isNaN(Number(value))) {
        return isCurrency ? "$N/A" : "N/A";
    }
    const num = Number(value);
    let formattedNum = num.toFixed(decimalPlaces);

    const parts = formattedNum.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    formattedNum = parts.join('.');

    return isCurrency ? `$${formattedNum}` : formattedNum;
}

function calcFormatDate(dateObj) {
    if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj)) { return null; }
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function calcFormatDisplayDate(dateString) {
    if (!dateString || !dateString.includes('-')) return "Invalid Date";
    const parts = dateString.split('-');
    if (parts.length !== 3) return "Invalid Date";
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
}

function calcShowMessage(message) {
    const overlay = document.getElementById('calcMessageBoxOverlay');
    const text = document.getElementById('calcMessageBoxText');
    if (text && overlay) {
        text.textContent = message;
        overlay.style.display = 'flex';
    } else {
        console.warn("Message box elements not found, using console:", message);
    }
}

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

function calcIsPublicHoliday(dateObj) {
    return calcAllPublicHolidays.includes(calcFormatDate(dateObj));
}

function calcGetDayOfWeekString(dateObj) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[dateObj.getDay()];
}

function getRateTypeSuffix(rateType) {
    if (!rateType) return '';
    if (rateType.includes('Public Holiday')) return '(PH)';
    if (rateType.includes('Night')) return '(Night)';
    if (rateType.includes('Day')) return '(Day)';
    if (rateType.includes('Evening')) return '(Evening)';
    if (rateType.includes('Sat')) return '(Sat)';
    if (rateType.includes('Sun')) return '(Sun)';
    if (rateType === 'Custom') return '(Custom)';
    return '';
}

function exportToPdf() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        calcShowMessage("Error: jsPDF library not loaded.");
        return;
    }

    try {
        const doc = new jsPDF();
        let yPos = 20;

        // Retrieve DOM Elements directly for simple text fields
        const participantName = document.getElementById('participantName').value || 'N/A';
        const ndisNumber = document.getElementById('ndisNumber').value || 'N/A';
        const totalFundingVal = parseFloat(document.getElementById('totalAvailableFunding').value) || 0;
        const releasePeriodEl = document.getElementById('releasePeriod');
        const releasePeriodText = releasePeriodEl.options[releasePeriodEl.selectedIndex].text;
        const startDateStr = document.getElementById('periodStartDate').value;
        const endDateStr = document.getElementById('periodEndDate').value;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Core Funding Plan", 105, yPos, { align: 'center' });
        yPos += 10;

        doc.setFontSize(14);
        doc.text("Participant's Details", 14, yPos);
        yPos += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`Name: ${participantName}`, 14, yPos);
        doc.text(`NDIS No.: ${ndisNumber}`, 105, yPos);
        yPos += 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Plan Details", 14, yPos);
        yPos += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        
        doc.text(`Available Core Funding: ${formatNumber(totalFundingVal, true)}`, 14, yPos);
        doc.text(`Funding Release Period: ${releasePeriodText}`, 105, yPos);
        yPos += 7;
        doc.text(`Plan Start Date: ${calcFormatDisplayDate(startDateStr)}`, 14, yPos);
        doc.text(`Plan End Date: ${calcFormatDisplayDate(endDateStr)}`, 105, yPos);
        yPos += 10;

        doc.setLineWidth(0.5);
        doc.line(14, yPos, 196, yPos);
        yPos += 10;

        // --- NEW SECTION: Weekly Schedule Summary ---
        if (appState.weeklyScheduleSlots.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text("Weekly Schedule Summary", 14, yPos);
            yPos += 6;

            // Calculation Logic (Replicated from UI logic for PDF generation)
            const getDuration = (start, end) => {
                const [h1, m1] = start.split(':').map(Number);
                const [h2, m2] = end.split(':').map(Number);
                let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
                if (diff <= 0) diff += 24 * 60; 
                return diff / 60;
            };

            const groups = {};
            appState.weeklyScheduleSlots.forEach(slot => {
                const key = `${slot.startTime}-${slot.endTime}`;
                if (!groups[key]) {
                    groups[key] = {
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        duration: getDuration(slot.startTime, slot.endTime),
                        days: []
                    };
                }
                if (!groups[key].days.includes(slot.day)) {
                    groups[key].days.push(slot.day);
                }
            });

            const dayOrder = { "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6, "Sun": 7 };
            const formatDays = (dayArray) => {
                const sorted = dayArray.sort((a, b) => dayOrder[a] - dayOrder[b]);
                if (sorted.length === 7) return "Every Day";
                let ranges = [];
                let start = sorted[0];
                let prev = sorted[0];
                for (let i = 1; i < sorted.length; i++) {
                    const current = sorted[i];
                    if (dayOrder[current] === dayOrder[prev] + 1) {
                        prev = current;
                    } else {
                        ranges.push(start === prev ? start : `${start} - ${prev}`);
                        start = current;
                        prev = current;
                    }
                }
                ranges.push(start === prev ? start : `${start} - ${prev}`);
                return ranges.join(', ');
            };

            const summaryBody = [];
            let grandTotalHours = 0;

            // --- UPDATED SORT LOGIC HERE FOR PDF ---
            Object.values(groups).sort((a, b) => {
                const minDayA = Math.min(...a.days.map(d => dayOrder[d]));
                const minDayB = Math.min(...b.days.map(d => dayOrder[d]));
                if (minDayA !== minDayB) return minDayA - minDayB;
                return a.startTime.localeCompare(b.startTime);
            }).forEach(group => {
                const count = group.days.length;
                const weeklyHours = group.duration * count;
                grandTotalHours += weeklyHours;
                
                summaryBody.push([
                    formatDays(group.days),
                    `${group.startTime} - ${group.endTime}`,
                    `${group.duration.toFixed(2)} Hrs`,
                    `${weeklyHours.toFixed(2)} Hrs/Wk`
                ]);
            });

            doc.autoTable({
                startY: yPos,
                head: [['Days', 'Time', 'Duration', 'Total']],
                body: summaryBody,
                theme: 'grid',
                headStyles: { fillColor: [220, 220, 220], textColor: [50, 50, 50], font: "helvetica", fontStyle: "bold" },
                bodyStyles: { font: "helvetica", fontSize: 10 },
                foot: [
                    ['', '', 'Total Weekly Hours:', `${grandTotalHours.toFixed(2)} Hrs/Wk`]
                ],
                footStyles: { fontStyle: 'bold', font: "helvetica", fillColor: [240, 240, 240], textColor: [0, 0, 0] },
                didDrawPage: (data) => {
                    yPos = data.cursor.y;
                }
            });
            
            yPos = doc.lastAutoTable.finalY + 10;
            doc.setLineWidth(0.5);
            doc.line(14, yPos, 196, yPos);
            yPos += 10;
        }
        // --- END NEW SECTION ---

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Funding Period Breakdown", 14, yPos);
        yPos += 7;

        const releaseMonths = parseInt(releasePeriodEl.value, 10);
        
        // Use appState
        if (releaseMonths === 0 || appState.calcPeriods.length === 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.text("No period breakdown (full period selected or no dates set).", 14, yPos);
            yPos += 10;
        } else {
            let rolloverAmount = 0;
            appState.calcPeriods.forEach(period => {
                const pStart = new Date(period.startDate + 'T00:00:00');
                const pEnd = new Date(period.endDate + 'T23:59:59');
                const periodInstances = appState.allServiceInstances.filter(inst => inst.date >= pStart && inst.date <= pEnd);

                let periodTotalCost = 0;
                const tableBody = [];

                if (periodInstances.length > 0) {
                    const aggregatedServices = {};
                    periodInstances.forEach(instance => {
                        periodTotalCost += instance.cost;
                        const key = `${instance.description}_${instance.rateType}_${instance.rate}_${instance.type}`;
                        if (!aggregatedServices[key]) {
                            aggregatedServices[key] = {
                                description: instance.description,
                                rateType: instance.rateType,
                                cost: 0,
                                hours: 0,
                                type: instance.type,
                                days: new Set(),
                                rate: instance.rate
                            };
                        }
                        aggregatedServices[key].cost += instance.cost;
                        const durationMatch = instance.details.match(/\((.*) hrs\)/);
                        const durationHours = durationMatch ? parseFloat(durationMatch[1]) : 0;
                        aggregatedServices[key].hours += durationHours;
                        if (instance.type === 'weekly' || (instance.type === 'manual' && instance.details.includes('hrs'))) {
                            aggregatedServices[key].days.add(calcGetDayOfWeekString(instance.date));
                        }
                    });

                    const dayOrder = { "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6, "Sun": 7 };
                    Object.values(aggregatedServices).forEach(aggService => {
                        let detailsText = 'One-off cost';
                        if ((aggService.type === 'weekly' || aggService.type === 'manual') && aggService.days.size > 0) {
                            const sortedDays = Array.from(aggService.days).sort((a, b) => dayOrder[a] - dayOrder[b]);
                            const rateDisplay = aggService.rate.startsWith('$') ? ` @ ${aggService.rate}` : '';
                            detailsText = `${aggService.type === 'weekly' ? 'Weekly' : 'One-off'}: ${sortedDays.join(', ')}${rateDisplay}`;
                        }
                        tableBody.push([
                            `${aggService.description} ${getRateTypeSuffix(aggService.rateType)}`,
                            detailsText,
                            aggService.hours > 0 ? aggService.hours.toFixed(2) : 'N/A',
                            formatNumber(aggService.cost, true)
                        ]);
                    });
                }

                const totalFundingForPeriod = period.funding + rolloverAmount;
                const periodRemainingFunding = totalFundingForPeriod - periodTotalCost;

                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text(`${calcFormatDisplayDate(period.startDate)} - ${calcFormatDisplayDate(period.endDate)}`, 14, yPos);
                yPos += 6;

                doc.autoTable({
                    startY: yPos,
                    head: [['Service', 'Details', 'Total Hours', 'Cost']],
                    body: tableBody,
                    theme: 'grid',
                    headStyles: { fillColor: [243, 244, 246], textColor: [55, 65, 81], font: "helvetica", fontStyle: "bold" },
                    bodyStyles: { font: "helvetica", fontSize: 10 },
                    foot: [
                        ['Total Funding', formatNumber(totalFundingForPeriod, true), 'Period Cost', formatNumber(periodTotalCost, true)],
                        [{ content: 'Remaining for Period', colSpan: 2 }, { content: formatNumber(periodRemainingFunding, true), colSpan: 2, styles: { fillColor: periodRemainingFunding >= 0 ? [236, 253, 245] : [254, 242, 242], textColor: periodRemainingFunding >= 0 ? [22, 101, 52] : [153, 27, 27] } }]
                    ],
                    footStyles: { fontStyle: 'bold', font: "helvetica" },
                    didDrawPage: (data) => {
                        yPos = data.cursor.y;
                    }
                });
                yPos = doc.lastAutoTable.finalY + 10;
                rolloverAmount = periodRemainingFunding > 0 ? periodRemainingFunding : 0;
            });
        }

        if (yPos > 270) doc.addPage();
        doc.setLineWidth(0.5);
        doc.line(14, yPos, 196, yPos);
        yPos += 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Overall Plan Summary", 14, yPos);
        yPos += 7;

        // --- UPDATED AGGREGATION LOGIC FOR PDF ---
        const intermediateServices = {};
        let overallTotalCost = 0;
        let overallTotalHours = 0;

        // 1. First Pass: Aggregate by Time Range to build clean detail strings (e.g., "Mon-Fri 09:00-17:00")
        appState.allServiceInstances.forEach(instance => {
            overallTotalCost += instance.cost;
            const durationMatch = instance.details.match(/\((.*) hrs\)/);
            const durationHours = durationMatch ? parseFloat(durationMatch[1]) : 0;
            overallTotalHours += durationHours;
            const rateSuffix = getRateTypeSuffix(instance.rateType);
            const key = `${instance.description}_${instance.rateType}_${instance.rate}_${instance.type === 'weekly' || (instance.type === 'manual' && instance.details.includes('hrs')) ? instance.details.split(' ')[0] : 'manual-cost'}`;
            if (!intermediateServices[key]) {
                intermediateServices[key] = {
                    description: `${instance.description} ${rateSuffix}`,
                    rate: instance.rate,
                    hours: 0,
                    cost: 0,
                    days: new Set(),
                    timeRange: (instance.type === 'weekly' || (instance.type === 'manual' && instance.details.includes('hrs'))) ? instance.details.split(' ')[0] : 'One-off',
                    type: instance.type
                };
            }
            intermediateServices[key].hours += durationHours;
            intermediateServices[key].cost += instance.cost;
            if (instance.type === 'weekly' || (instance.type === 'manual' && instance.details.includes('hrs'))) {
                intermediateServices[key].days.add(calcGetDayOfWeekString(instance.date));
            }
        });

        // 2. Flatten to Rows with nice Date Strings
        let processedRows = [];
        const dayOrder = { "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6, "Sun": 7 };

        Object.values(intermediateServices).forEach(aggService => {
            let detailsText = 'N/A';
            if (aggService.type === 'manual' && aggService.timeRange === 'One-off') {
                detailsText = 'One-off cost';
            } else if (aggService.days && aggService.days.size > 0) {
                const sortedDays = Array.from(aggService.days).sort((a, b) => dayOrder[a] - dayOrder[b]);
                const compressDays = (days) => {
                    if (!days.length) return '';
                    const dayIndexes = days.map(d => dayOrder[d]);
                    const ranges = [];
                    let start = dayIndexes[0];
                    let end = dayIndexes[0];
                    for (let i = 1; i < dayIndexes.length; i++) {
                        if (dayIndexes[i] === end + 1) {
                            end = dayIndexes[i];
                        } else {
                            ranges.push({ start, end });
                            start = dayIndexes[i];
                            end = dayIndexes[i];
                        }
                    }
                    ranges.push({ start, end });
                    const dayOfWeekArray = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                    return ranges.map(r => r.start === r.end ? dayOfWeekArray[r.start] : `${dayOfWeekArray[r.start]}-${dayOfWeekArray[r.end]}`).join(', ');
                };
                detailsText = `${compressDays(sortedDays)} ${aggService.timeRange}`;
            }

            processedRows.push({
                description: aggService.description,
                details: detailsText,
                rate: aggService.rate,
                hours: aggService.hours,
                cost: aggService.cost
            });
        });

        // 3. Final Grouping by Description + Rate (Merges different times)
        const finalGroups = {};
        processedRows.forEach(row => {
            const key = `${row.description}_${row.rate}`;
            if (!finalGroups[key]) {
                finalGroups[key] = {
                    description: row.description,
                    details: [],
                    rate: row.rate,
                    hours: 0,
                    cost: 0
                };
            }
            finalGroups[key].hours += row.hours;
            finalGroups[key].cost += row.cost;
            if (!finalGroups[key].details.includes(row.details)) {
                finalGroups[key].details.push(row.details);
            }
        });

        // 4. Construct Table Body for PDF
        const summaryTableBody = [];
        Object.values(finalGroups).sort((a,b) => a.description.localeCompare(b.description)).forEach(group => {
            // Join multiple details with newline for PDF table cell
            const combinedDetails = group.details.join('\n');
            summaryTableBody.push([
                group.description,
                combinedDetails,
                group.rate,
                group.hours > 0 ? group.hours.toFixed(2) : 'N/A',
                formatNumber(group.cost, true)
            ]);
        });
        // --- END UPDATED AGGREGATION LOGIC ---

        doc.autoTable({
            startY: yPos,
            head: [['Service', 'Details', 'Rate', 'Total Hours', 'Cost']],
            body: summaryTableBody,
            theme: 'grid',
            headStyles: { fillColor: [243, 244, 246], textColor: [55, 65, 81], font: "helvetica", fontStyle: "bold" },
            bodyStyles: { font: "helvetica", fontSize: 10 },
            foot: [
                ['Total', '', '', overallTotalHours.toFixed(2), formatNumber(overallTotalCost, true)]
            ],
            footStyles: { fontStyle: 'bold', font: "helvetica" },
            didDrawPage: (data) => {
                yPos = data.cursor.y;
            }
        });
        yPos = doc.lastAutoTable.finalY + 10;

        if (yPos > 270) doc.addPage();
        const grandRemaining = totalFundingVal - overallTotalCost;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Overall Remaining Funding:", 14, yPos);

        const remainingColor = grandRemaining >= 0 ? [22, 101, 52] : [153, 27, 27];
        doc.setTextColor.apply(doc, remainingColor);
        
        doc.text(formatNumber(grandRemaining, true), 105, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');

        const participantNameSafe = participantName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'plan';
        const dateStamp = new Date().toISOString().slice(0, 10);
        doc.save(`funding_plan_${participantNameSafe}_${dateStamp}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        calcShowMessage("Error: Could not generate PDF. See console for details.");
    }
}