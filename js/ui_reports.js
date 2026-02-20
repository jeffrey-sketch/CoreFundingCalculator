function renderWeeklySummary() {
    const container = document.getElementById('weeklySummaryContainer');
    const bodyEl = document.getElementById('weeklySummaryBody');
    const totalEl = document.getElementById('weeklySummaryTotal');

    if (!container) return;

    if (appState.weeklyScheduleSlots.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'block';

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
    let html = '';
    let grandTotalHours = 0;

    const formatDays = (dayArray) => {
        const sorted = dayArray.sort((a, b) => dayOrder[a] - dayOrder[b]);
        if (sorted.length === 7) return '<span class="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">Every Day</span>';
        
        return sorted.map(d => `<span class="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mr-1 mb-1">${d}</span>`).join('');
    };

    Object.values(groups).sort((a, b) => {
        const minDayA = Math.min(...a.days.map(d => dayOrder[d]));
        const minDayB = Math.min(...b.days.map(d => dayOrder[d]));
        if (minDayA !== minDayB) return minDayA - minDayB;
        return a.startTime.localeCompare(b.startTime);
    }).forEach(group => {
        const count = group.days.length;
        const weeklyHours = group.duration * count;
        grandTotalHours += weeklyHours;
        html += `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3 px-4">${formatDays(group.days)}</td>
                <td class="py-3 px-4 text-gray-600 font-mono text-xs">${group.startTime} - ${group.endTime}</td>
                <td class="py-3 px-4 text-gray-600">${group.duration.toLocaleString('en-US', {maximumFractionDigits: 2})}h</td>
                <td class="py-3 px-4 text-right font-semibold text-gray-800">${weeklyHours.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
            </tr>
        `;
    });

    bodyEl.innerHTML = html;
    totalEl.textContent = `${grandTotalHours.toLocaleString('en-US', {maximumFractionDigits: 2})} Hrs/Wk`;
}

function renderCalendar() {
    const container = document.getElementById('calendarViewContainer');
    if (!container) return;

    const month = appState.calendarDate.getMonth();
    const year = appState.calendarDate.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayIndex = (firstDay.getDay() + 6) % 7;
    const planStartStr = document.getElementById('periodStartDate').value;
    const planEndStr = document.getElementById('periodEndDate').value;

    const servicesByDate = {};
    appState.allServiceInstances.forEach(inst => {
        const dateStr = calcFormatDate(inst.date);
        if (!servicesByDate[dateStr]) servicesByDate[dateStr] = 0;
        servicesByDate[dateStr]++;
    });

    let calendarHtml = `
        <div class="calendar-container h-full flex flex-col">
            <div class="calendar-header flex justify-between items-center">
                <button id="prevMonthBtn" class="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors">&lt;</button>
                <h4 class="font-bold text-gray-700">${firstDay.toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                <button id="nextMonthBtn" class="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors">&gt;</button>
            </div>
            <div class="calendar-grid flex-grow">
                ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="calendar-day-name">${d}</div>`).join('')}
    `;

    for(let i = 0; i < startDayIndex; i++) {
        calendarHtml += `<div class="bg-gray-50"></div>`;
    }

    for(let i = 1; i <= daysInMonth; i++) {
        const dayStr = calcFormatDate(new Date(year, month, i));
        const todayStr = calcFormatDate(new Date());

        let classes = 'calendar-day group';
         if ((planStartStr && dayStr < planStartStr) || (planEndStr && dayStr > planEndStr)) {
            classes += ' disabled opacity-50 bg-gray-50 cursor-not-allowed';
        }
        if (dayStr === todayStr) classes += ' today';
        if (dayStr === appState.selectedDateStr) classes += ' selected';

        const hasServices = servicesByDate[dayStr] > 0;
        const isHoliday = calcAllPublicHolidays.includes(dayStr);

        calendarHtml += `<div class="${classes}" data-date="${dayStr}">
            <span class="day-number flex items-center justify-center rounded-full absolute top-1 left-1 font-medium text-xs text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">${i}</span>`;
        
        if (hasServices || isHoliday) {
            calendarHtml += `<div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">`;
            if (hasServices) calendarHtml += `<div class="dot-indicator dot-service"></div>`;
            if (isHoliday) calendarHtml += `<div class="dot-indicator dot-holiday"></div>`;
            calendarHtml += `</div>`;
        }
        
        calendarHtml += `</div>`;
    }

    calendarHtml += `</div></div>`;
    container.innerHTML = calendarHtml;
}

function renderPeriods() {
    const container = document.getElementById('periodsContainer');
    const breakdownSection = document.getElementById('periodBreakdownSection');
    const releaseMonths = parseInt(document.getElementById('releasePeriod').value, 10);
    
    if (releaseMonths === 0) {
        breakdownSection.style.display = 'none';
        return;
    }
    breakdownSection.style.display = 'block';
    container.innerHTML = '';

    if (appState.calcPeriods.length === 0) {
        container.innerHTML = `<div class="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300"><p class="text-gray-400">Enter plan start and end dates to generate funding periods.</p></div>`;
        return;
    }

    let rolloverAmount = 0;
    appState.calcPeriods.forEach((period, index) => {
        const periodBox = document.createElement('div');
        periodBox.className = 'period-box';
        periodBox.dataset.periodId = period.id;

        const pStart = new Date(period.startDate + 'T00:00:00');
        const pEnd = new Date(period.endDate + 'T23:59:59');
        const periodInstances = appState.allServiceInstances.filter(inst => inst.date >= pStart && inst.date <= pEnd);

        let periodTotalCost = 0;
        let serviceRowsHtml = '';

        if (periodInstances.length === 0) {
            serviceRowsHtml = `<tr><td colspan="4" class="text-center text-gray-400 py-6 italic">No services scheduled in this period.</td></tr>`;
        } else {
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
                aggregatedServices[key].hours += durationMatch ? parseFloat(durationMatch[1]) : 0;
                if (instance.type === 'weekly' || (instance.type === 'manual' && instance.details.includes('hrs'))) {
                   aggregatedServices[key].days.add(calcGetDayOfWeekString(instance.date));
                }
            });

            const dayOrder = { "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6, "Sun": 7 };
            Object.values(aggregatedServices).forEach(aggService => {
                let detailsText = '<span class="text-gray-400 text-xs">One-off</span>';
                if ((aggService.type === 'weekly' || aggService.type === 'manual') && aggService.days.size > 0) {
                    const sortedDays = Array.from(aggService.days).sort((a, b) => dayOrder[a] - dayOrder[b]);
                    const rateDisplay = aggService.rate.startsWith('$') ? ` <span class="text-xs text-gray-400 ml-1">@ ${aggService.rate}</span>` : '';
                    detailsText = `<span class="text-xs font-medium text-gray-600">${sortedDays.join(', ')}</span>${rateDisplay}`;
                }
                serviceRowsHtml += `
                    <tr>
                        <td class="font-medium text-gray-700">${aggService.description} <span class="text-xs text-blue-500 font-normal">${getRateTypeSuffix(aggService.rateType)}</span></td>
                        <td>${detailsText}</td>
                        <td class="font-mono text-gray-600">${aggService.hours > 0 ? aggService.hours.toFixed(2) : '-'}</td>
                        <td class="text-right font-medium">${formatNumber(aggService.cost, true)}</td>
                    </tr>
                `;
            });
        }

        const totalFundingForPeriod = period.funding + rolloverAmount;
        const periodRemainingFunding = totalFundingForPeriod - periodTotalCost;
        const statusColor = periodRemainingFunding >= 0 ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200';

        periodBox.innerHTML = `
            <div class="period-header">
                <div class="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                    <span class="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">Period ${index + 1}</span>
                    <span class="text-sm font-medium text-gray-500">${calcFormatDisplayDate(period.startDate)} — ${calcFormatDisplayDate(period.endDate)}</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs font-bold text-gray-400 uppercase">Period Budget</span>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                        <input type="number" step="0.01" class="period-funding-input pl-6 pr-2 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold w-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" data-period-id="${period.id}" value="${period.funding.toFixed(2)}">
                    </div>
                </div>
            </div>
            <div class="period-body bg-white">
                <table class="period-service-table">
                    <thead><tr><th class="text-left w-1/3">Service</th><th class="text-left">Detail</th><th class="text-left w-24">Hrs</th><th class="text-right w-32">Cost</th></tr></thead>
                    <tbody>${serviceRowsHtml}</tbody>
                </table>
            </div>
            <div class="period-footer flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div class="text-sm text-gray-500">
                    <span class="font-semibold">Total Available:</span> ${formatNumber(totalFundingForPeriod, true)} <span class="text-xs text-gray-400">(Budget + Rollover)</span>
                 </div>
                <div class="flex items-center gap-6">
                    <div class="text-sm">
                        <span class="text-gray-500">Cost:</span> <span class="font-bold text-gray-700">${formatNumber(periodTotalCost, true)}</span>
                    </div>
                    <div class="px-3 py-1.5 rounded-lg border ${statusColor} font-bold text-sm">
                        Rem: ${formatNumber(periodRemainingFunding, true)}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(periodBox);
        rolloverAmount = periodRemainingFunding > 0 ? periodRemainingFunding : 0;
    });
}

function renderSummaryBox() {
    const container = document.getElementById('summaryBoxContainer');
    const grandCell = document.getElementById('grandRemainingFundingCell');
    const totalFundingInput = parseCurrencyString(document.getElementById('totalAvailableFunding').value);
    const otherExpenses = getTotalOtherExpenses();
    const totalFunding = Math.max(0, totalFundingInput - otherExpenses);

    if (!container) return; // Guard clause if container missing
    container.innerHTML = '';
    
    if (appState.allServiceInstances.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-gray-400 italic">No services added to the plan yet.</div>`;
        if (grandCell) {
            grandCell.textContent = formatNumber(totalFunding, true);
            grandCell.className = 'text-2xl font-bold tracking-tight text-green-400';
        }
        return;
    }

    // --- Aggregation Logic (Same as before) ---
    const intermediateServices = {};
    let overallTotalCost = 0;
    let overallTotalHours = 0;

    appState.allServiceInstances.forEach(instance => {
        overallTotalCost += instance.cost;
        const durationMatch = instance.details.match(/\((.*) hrs\)/);
        overallTotalHours += durationMatch ? parseFloat(durationMatch[1]) : 0;
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
        intermediateServices[key].hours += (durationMatch ? parseFloat(durationMatch[1]) : 0);
        intermediateServices[key].cost += instance.cost;
        if(instance.type === 'weekly' || (instance.type === 'manual' && instance.details.includes('hrs'))) {
             intermediateServices[key].days.add(calcGetDayOfWeekString(instance.date));
        }
    });

    let processedRows = [];
    const dayOrder = { "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6, "Sun": 7 };

    Object.values(intermediateServices).forEach(aggService => {
        let detailsText = 'N/A';
        if (aggService.type === 'manual' && aggService.timeRange === 'One-off') {
            detailsText = 'One-off';
        } else if (aggService.days && aggService.days.size > 0) {
            const sortedDays = Array.from(aggService.days).sort((a, b) => dayOrder[a] - dayOrder[b]);
            const compressDays = (days) => {
                if (!days.length) return '';
                const dayIndexes = days.map(d => dayOrder[d]);
                const ranges = [];
                let start = dayIndexes[0];
                let end = dayIndexes[0];
                for (let i = 1; i < dayIndexes.length; i++) {
                    if (dayIndexes[i] === end + 1) end = dayIndexes[i];
                    else { ranges.push({ start, end }); start = dayIndexes[i]; end = dayIndexes[i]; }
                }
                ranges.push({ start, end });
                const dayOfWeekArray = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                return ranges.map(r => r.start === r.end ? dayOfWeekArray[r.start] : `${dayOfWeekArray[r.start]}-${dayOfWeekArray[r.end]}`).join(', ');
            };
            detailsText = `<span class="font-medium text-gray-700">${compressDays(sortedDays)}</span> <span class="text-xs text-gray-400 block">${aggService.timeRange}</span>`;
        }

        processedRows.push({
            description: aggService.description,
            details: detailsText,
            rate: aggService.rate,
            hours: aggService.hours,
            cost: aggService.cost
        });
    });

    const finalGroups = {};
    processedRows.forEach(row => {
        const key = `${row.description}_${row.rate}`;
        if (!finalGroups[key]) {
            finalGroups[key] = { description: row.description, details: [], rate: row.rate, hours: 0, cost: 0 };
        }
        finalGroups[key].hours += row.hours;
        finalGroups[key].cost += row.cost;
        if (!finalGroups[key].details.includes(row.details)) finalGroups[key].details.push(row.details);
    });

    let tableRowsHtml = '';
    Object.values(finalGroups).sort((a,b) => a.description.localeCompare(b.description)).forEach(group => {
        tableRowsHtml += `
            <tr class="group hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none">
                <td class="py-3 px-2 text-sm font-medium text-gray-800">${group.description}</td>
                <td class="py-3 px-2 text-xs text-gray-500 leading-tight">${group.details.join('<br>')}</td>
                <td class="py-3 px-2 text-xs text-gray-500 font-mono">${group.rate}</td>
                <td class="py-3 px-2 text-sm text-center text-gray-600">${group.hours > 0 ? group.hours.toFixed(2) : '-'}</td>
                <td class="py-3 px-2 text-sm font-bold text-gray-800 text-right">${formatNumber(group.cost, true)}</td>
            </tr>
        `;
    });

    container.innerHTML = `
        <table class="w-full">
            <thead>
                <tr class="text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th class="pb-2 pl-2">Service</th>
                    <th class="pb-2">Details</th>
                    <th class="pb-2">Rate</th>
                    <th class="pb-2 text-center">Hrs</th>
                    <th class="pb-2 text-right pr-2">Subtotal</th>
                </tr>
            </thead>
            <tbody>${tableRowsHtml}</tbody>
            <tfoot>
                <tr class="border-t border-gray-100 bg-gray-50">
                    <td colspan="3" class="py-3 pl-2 font-bold text-gray-600 text-xs uppercase">Total Estimated Cost</td>
                    <td class="py-3 text-center font-bold text-gray-800">${overallTotalHours.toFixed(2)}</td>
                    <td class="py-3 pr-2 text-right font-bold text-blue-600 text-base">${formatNumber(overallTotalCost, true)}</td>
                </tr>
            </tfoot>
        </table>
    `;

    const grandRemaining = totalFunding - overallTotalCost;
    if (grandCell) {
        grandCell.textContent = formatNumber(grandRemaining, true);
        grandCell.className = `text-2xl font-bold tracking-tight ${grandRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`;
    }
}

function renderServiceLog() {
    const container = document.getElementById('serviceLogContainer');
    if (!container) return;

    container.innerHTML = '';
    
    if (appState.allServiceInstances.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-400 py-8 italic">No entries found.</div>`;
        return;
    }

    // FIXED SORTING LOGIC: Use 1 or -1 multiplier
    const sortedInstances = [...appState.allServiceInstances].sort((a, b) => {
        const col = appState.serviceLogSort.column;
        const orderMultiplier = appState.serviceLogSort.order === 'asc' ? 1 : -1;
        
        let valA, valB;
        if (col === 'date') {
            valA = a.date.getTime();
            valB = b.date.getTime();
        } else if (col === 'cost') {
            valA = a.cost;
            valB = b.cost;
        } else {
            valA = String(a[col]).toLowerCase();
            valB = String(b[col]).toLowerCase();
        }

        if (valA < valB) return -1 * orderMultiplier;
        if (valA > valB) return 1 * orderMultiplier;
        return 0;
    });

    const createTableHtml = (instances) => {
        const body = instances.length > 0 ? instances.map(inst => `
            <tr class="hover:bg-gray-50 border-b border-gray-50 last:border-none transition-colors group">
                <td class="py-3 px-4 text-sm text-gray-600">${calcFormatDisplayDate(calcFormatDate(inst.date))}</td>
                <td class="py-3 px-4 text-sm font-medium text-gray-800">${inst.description} <span class="text-xs text-gray-400 font-normal ml-1">${getRateTypeSuffix(inst.rateType)}</span></td>
                <td class="py-3 px-4 text-xs text-gray-500">${inst.details}</td>
                <td class="py-3 px-4 text-xs text-gray-500 font-mono">${inst.rate}</td>
                <td class="py-3 px-4 text-sm font-bold text-gray-800 text-right">${formatNumber(inst.cost, true)}</td>
                <td class="py-3 px-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 delete-instance-btn transition-colors" data-instance-id="${inst.instanceId}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('') : `<tr><td colspan="6" class="text-center text-gray-400 py-8 italic">No entries found.</td></tr>`;

        return `
        <div class="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table class="min-w-full bg-white">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer sortable-header hover:text-blue-600 transition-colors select-none" data-sort-col="date">
                            <div class="flex items-center gap-1">
                                Date <span class="sort-indicator" data-sort-col="date"></span>
                            </div>
                        </th>
                        <th class="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                        <th class="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                        <th class="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rate</th>
                        <th class="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer sortable-header hover:text-blue-600 transition-colors select-none" data-sort-col="cost">
                            <div class="flex items-center justify-end gap-1">
                                Cost <span class="sort-indicator" data-sort-col="cost"></span>
                            </div>
                        </th>
                        <th class="py-3 px-4 w-10"></th>
                    </tr>
                </thead>
                <tbody>${body}</tbody>
            </table>
        </div>`;
    };

    container.innerHTML = createTableHtml(sortedInstances);

    // Sort indicators update
    container.querySelectorAll('.sort-indicator').forEach(el => {
        el.innerHTML = '<i class="fas fa-sort text-gray-300"></i>'; 
        if (el.dataset.sortCol === appState.serviceLogSort.column) {
            const icon = appState.serviceLogSort.order === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
            el.innerHTML = `<i class="fas ${icon} text-blue-500"></i>`;
        }
    });
}
