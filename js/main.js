document.addEventListener('DOMContentLoaded', () => {
    // 1. Build HTML
    const placeholder = document.getElementById('calculatorContentPlaceholder');
    if (placeholder) {
        buildCalculatorHTML(placeholder);
    } else {
        console.error("Fatal: Placeholder not found");
        return;
    }

    // 2. Initialize Floating Calc
    initializeFloatingCalculator();

    // 3. Initialize Main Logic
    initializeCalculator();
    
    // 4. Initialize Dark Mode
    initializeDarkMode();
});

// --- DARK MODE LOGIC ---
function initializeDarkMode() {
    const toggleBtn = document.getElementById('darkModeToggle');
    // Helper to find text span safely (icon might be separate)
    const toggleText = document.getElementById('darkModeText'); 
    const icon = toggleBtn.querySelector('i');
    const body = document.body;

    // Check Local Storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark');
        updateToggleButton(true);
    }

    toggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark');
        const isDark = body.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateToggleButton(isDark);
    });

    function updateToggleButton(isDark) {
        if (toggleText) toggleText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// --- CENTRAL RENDER FUNCTION ---
function renderAll() {
    generateAllServiceInstances();
    renderSummaryBox();
    renderPeriods();
    renderServiceLog();
    renderWeeklyScheduleTable();
    renderWeeklySummary();
    renderCalendar();
    renderDailyServices();
}

function initializeCalculator() {
    // Set initial dates
    const today = new Date();
    document.getElementById('periodStartDate').value = calcFormatDate(today);
    const yearLater = new Date(today);
    yearLater.setFullYear(today.getFullYear() + 1);
    yearLater.setDate(yearLater.getDate() - 1);
    document.getElementById('periodEndDate').value = calcFormatDate(yearLater);
    
    appState.selectedDateStr = calcFormatDate(today);
    appState.calendarDate = today;

    // Initial Generate
    generatePeriods(); 
    renderAll(); 

    setupEventListeners();
    setupDragAndDrop(); // Initialize Weekly Drag
    setupDailyDragAndDrop(); // Initialize Daily Drag
}

function setupEventListeners() {
    const periodStartDateEl = document.getElementById('periodStartDate');
    const periodEndDateEl = document.getElementById('periodEndDate');
    const totalFundingEl = document.getElementById('totalAvailableFunding');
    const releasePeriodEl = document.getElementById('releasePeriod');
    
    // --- Debounced Updates ---
    const debouncedGenerate = debounce(() => {
        generatePeriods();
        renderAll();
    }, 500);

    periodStartDateEl.addEventListener('change', () => {
        const newStartDate = new Date(periodStartDateEl.value);
        if (!isNaN(newStartDate)) {
            appState.calendarDate = newStartDate;
            appState.selectedDateStr = calcFormatDate(newStartDate);
        }
        debouncedGenerate();
    });
    periodEndDateEl.addEventListener('change', debouncedGenerate);
    totalFundingEl.addEventListener('input', debouncedGenerate);
    releasePeriodEl.addEventListener('change', debouncedGenerate);

    // --- Buttons ---
    document.getElementById('calcMessageBoxButton').addEventListener('click', () => {
        document.getElementById('calcMessageBoxOverlay').style.display = 'none';
    });

    // Quick Set Buttons
    const setEndDate = (years) => {
        const startDateStr = periodStartDateEl.value;
        if (startDateStr) {
            const startDate = new Date(startDateStr);
            const endDate = new Date(startDate);
            endDate.setFullYear(startDate.getFullYear() + years);
            endDate.setDate(endDate.getDate() - 1);
            periodEndDateEl.value = calcFormatDate(endDate);
            generatePeriods();
            renderAll();
        } else {
            calcShowMessage("Please set a start date first.");
        }
    };
    document.getElementById('set1YearBtn').addEventListener('click', () => setEndDate(1));
    document.getElementById('set2YearsBtn').addEventListener('click', () => setEndDate(2));
    document.getElementById('set5YearsBtn').addEventListener('click', () => setEndDate(5));

    // Clear Schedule
    document.getElementById('clearAllWeeklySlotsBtn').addEventListener('click', () => {
        appState.weeklyScheduleSlots = [];
        renderAll();
    });

    // Save/Load/Export
    document.getElementById('saveCalcBtn').addEventListener('click', saveCalculatorState);
    document.getElementById('loadCalcInput').addEventListener('change', loadCalculatorState);
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPdf);
    
    // CSV Export
    document.getElementById('exportCsvBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += ["Date", "Service", "Details", "Ratio", "Rate", "Cost"].join(",") + "\r\n";
        const rows = [];
         appState.allServiceInstances.sort((a,b) => a.date - b.date).forEach(inst => {
            const row = [
                calcFormatDisplayDate(calcFormatDate(inst.date)),
                `"${inst.description} ${inst.rateType}"`,
                `"${inst.details}"`,
                `"${inst.ratio}"`,
                `"${inst.rate}"`,
                `"${formatNumber(inst.cost, false)}"`
            ];
            rows.push(row.join(","));
        });
        csvContent += rows.join("\r\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "service_log.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Toggle Service Log (Added to satisfy "keep default minimize" requirement)
    const toggleLogBtn = document.getElementById('toggleServiceLogBtn');
    const logContent = document.getElementById('serviceLogCollapsibleContent');
    
    if (toggleLogBtn && logContent) {
        toggleLogBtn.addEventListener('click', (e) => {
            // Prevent triggering when clicking export button if it propagates
            if(e.target.closest('#exportCsvBtn')) return;

            const isExpanded = logContent.classList.contains('expanded');
            const icon = toggleLogBtn.querySelector('.toggle-button-icon');
            
            if (isExpanded) {
                // Collapse
                logContent.style.maxHeight = logContent.scrollHeight + 'px';
                requestAnimationFrame(() => {
                    logContent.classList.remove('expanded');
                    logContent.style.maxHeight = '0px';
                    if(icon) icon.classList.remove('rotated');
                });
            } else {
                // Expand
                logContent.classList.add('expanded');
                logContent.style.maxHeight = logContent.scrollHeight + 'px';
                if(icon) icon.classList.add('rotated');
                
                logContent.addEventListener('transitionend', function onEnd() {
                    logContent.removeEventListener('transitionend', onEnd);
                    if (logContent.classList.contains('expanded')) {
                        logContent.style.maxHeight = 'none';
                    }
                });
            }
        });
    }

    // --- Interaction: Calendar & Lists ---
    document.getElementById('calendarViewContainer').addEventListener('click', (e) => {
        const dayCell = e.target.closest('.calendar-day');
        if (dayCell && !dayCell.classList.contains('disabled')) {
            appState.selectedDateStr = dayCell.dataset.date;
            renderCalendar();
            renderDailyServices();
        }
        if (e.target.closest('#prevMonthBtn')) {
            appState.calendarDate.setMonth(appState.calendarDate.getMonth() - 1);
            renderCalendar();
        }
        if (e.target.closest('#nextMonthBtn')) {
            appState.calendarDate.setMonth(appState.calendarDate.getMonth() + 1);
            renderCalendar();
        }
    });

    // --- Interaction: Funding Period Overrides ---
    const periodsContainer = document.getElementById('periodsContainer');
    if (periodsContainer) {
        periodsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('period-funding-input')) {
                const periodId = e.target.dataset.periodId;
                const newVal = parseFloat(e.target.value);
                if (!isNaN(newVal)) {
                    updatePeriodFunding(periodId, newVal);
                    renderPeriods(); 
                }
            }
        });
    }

    // --- Daily View Interactions ---
    document.getElementById('dailyServiceViewContainer').addEventListener('click', (e) => {
        // Handle "X" button on visual blocks
        const blockDelBtn = e.target.closest('.daily-delete-btn-on-block');
        if (blockDelBtn) {
            e.stopPropagation();
            deleteServiceInstance(blockDelBtn.dataset.instanceId);
            return;
        }

        // Handle Trash Can button in the summary table
        const summaryDelBtn = e.target.closest('.delete-instance-btn');
        if (summaryDelBtn) {
            e.stopPropagation();
            deleteServiceInstance(summaryDelBtn.dataset.instanceId);
            return;
        }

        // Handle Clicking the Block to Edit
        const block = e.target.closest('.service-block');
        if (block) {
            const instanceId = block.dataset.instanceId;
            const instance = appState.allServiceInstances.find(inst => inst.instanceId === instanceId);
            if (instance) {
                openScheduleModal(null, null, null, null, 'edit-instance', instance);
            }
        }
    });

    document.getElementById('serviceLogContainer').addEventListener('click', (e) => {
        const header = e.target.closest('.sortable-header');
        if (header) {
            e.stopPropagation();
            const column = header.dataset.sortCol;
            if (appState.serviceLogSort.column === column) {
                appState.serviceLogSort.order = appState.serviceLogSort.order === 'asc' ? 'desc' : 'asc';
            } else {
                appState.serviceLogSort.column = column;
                appState.serviceLogSort.order = 'asc';
            }
            renderServiceLog();
        }
        const delBtn = e.target.closest('.delete-instance-btn');
        if (delBtn) {
            e.stopPropagation();
            deleteServiceInstance(delBtn.dataset.instanceId);
        }
    });

    // --- Modal Logic ---
    setupModalListeners();
    setupMultiDayListeners();
}

function setupModalListeners() {
    // Open Recurring Modal
    const recurringModal = document.getElementById('recurringServiceModalOverlay');
    document.getElementById('openRecurringServiceModalBtn').addEventListener('click', () => recurringModal.style.display = 'flex');
    document.getElementById('closeRecurringServiceModalBtn').addEventListener('click', () => recurringModal.style.display = 'none');
    recurringModal.addEventListener('click', (e) => {
        if(e.target === recurringModal) recurringModal.style.display = 'none';
    });

    // Schedule Modal (Add/Edit)
    const scheduleModal = document.getElementById('scheduleModalOverlay');
    document.getElementById('cancelModalBtn').addEventListener('click', closeScheduleModal);
    scheduleModal.addEventListener('click', (e) => {
        if(e.target === scheduleModal) closeScheduleModal();
    });

    document.getElementById('saveServiceBtn').addEventListener('click', saveServiceFromModal);
    document.getElementById('deleteServiceBtn').addEventListener('click', deleteServiceFromModal);

    const modalServiceType = document.getElementById('modalServiceType');
    modalServiceType.addEventListener('change', () => {
        const selectedType = modalServiceType.value;
        const isManual = ['Consumable', 'Transport'].includes(selectedType);
        document.getElementById('modalWeeklyFields').style.display = isManual ? 'none' : 'block';
        document.getElementById('modalManualFields').style.display = isManual ? 'block' : 'none';
        
        const startEl = document.getElementById('modalStartTime');
        const endEl = document.getElementById('modalEndTime');
        if (selectedType === 'Night-Time Sleepover') {
            startEl.value = '22:00';
            endEl.value = '06:00';
            startEl.disabled = true;
            endEl.disabled = true;
        } else {
            startEl.disabled = false;
            endEl.disabled = false;
        }
        updateModalRatePlaceholder();
    });

    document.getElementById('modalStartTime').addEventListener('change', updateModalRatePlaceholder);
    document.getElementById('modalSlotDay').addEventListener('change', updateModalRatePlaceholder);
}

function updateModalRatePlaceholder() {
    const rateEl = document.getElementById('modalRate');
    if(rateEl.value) return;

    const serviceType = document.getElementById('modalServiceType').value;
    const startTime = document.getElementById('modalStartTime').value;
    const day = document.getElementById('modalSlotDay').value;
    const startDateStr = document.getElementById('periodStartDate').value;

    if (!startTime || !day || !serviceType || !startDateStr || ['Consumable', 'Transport'].includes(serviceType)) {
        rateEl.placeholder = 'Auto';
        return;
    }

    let lookupDate = new Date(startDateStr + "T00:00:00");
    const dayMap = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
    const targetDayIndex = dayMap[day];
    const currentDayIndex = lookupDate.getDay();

    let dayDifference = targetDayIndex - currentDayIndex;
    if (dayDifference < 0) dayDifference += 7;

    lookupDate.setDate(lookupDate.getDate() + dayDifference);
    lookupDate.setHours(parseInt(startTime.split(':')[0]));
    lookupDate.setMinutes(parseInt(startTime.split(':')[1]));

    const rateInfo = calcGetStandardRateForService(serviceType, lookupDate);
    rateEl.placeholder = rateInfo.rate ? formatNumber(rateInfo.rate, false) : 'N/A';
}

function openScheduleModal(day, hour, serviceId = null, selection = null, context = 'weekly', instance = null) {
    const modalContent = document.getElementById('scheduleModalContent');
    const titleEl = document.getElementById('scheduleModalTitle');
    const typeEl = document.getElementById('modalServiceType');
    const startEl = document.getElementById('modalStartTime');
    const endEl = document.getElementById('modalEndTime');
    
    modalContent.dataset.mode = 'single';
    delete modalContent.dataset.selection;
    startEl.disabled = false;
    endEl.disabled = false;
    document.getElementById('modalContext').value = context;
    document.getElementById('modalServiceId').value = serviceId || '';

    // Logic to populate fields based on context
    if (context === 'edit-instance' && instance) {
        titleEl.textContent = `Edit Service for ${calcFormatDisplayDate(calcFormatDate(instance.date))}`;
        document.getElementById('modalServiceId').value = instance.instanceId;
        document.getElementById('deleteServiceBtn').style.display = 'block';
        
        if (instance.type === 'manual' && !instance.details.includes('hrs')) {
            typeEl.value = instance.description.startsWith('Consumable') ? 'Consumable' : 'Transport';
            document.getElementById('modalManualDescription').value = instance.description.split(': ')[1] || '';
            document.getElementById('modalManualCost').value = instance.cost;
        } else {
            const longName = Object.keys(serviceTypeMap).find(key => serviceTypeMap[key] === instance.description) || instance.description;
            typeEl.value = longName;

            const times = instance.details.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
            startEl.value = times ? times[1] : '';
            endEl.value = times ? times[2] : '';
            document.getElementById('modalRatio').value = instance.ratio;
        }
    } else if (context === 'daily-one-off') {
        titleEl.textContent = `Add Service for ${calcFormatDisplayDate(appState.selectedDateStr)}`;
        document.getElementById('modalSlotDay').value = day || '';
        if(hour !== null) {
            startEl.value = String(hour).padStart(2, '0') + ':00';
            endEl.value = String(hour + 1).padStart(2, '0') + ':00';
        }
        document.getElementById('deleteServiceBtn').style.display = 'none';

    } else if (serviceId) {
        // Edit Recurring
        const slot = appState.weeklyScheduleSlots.find(s => s.id === serviceId);
        if (slot) {
            titleEl.textContent = 'Edit Recurring Service';
            document.getElementById('modalSlotDay').value = slot.day;
            typeEl.value = slot.serviceType;
            startEl.value = slot.startTime;
            endEl.value = slot.endTime;
            document.getElementById('modalRatio').value = slot.costDivider;
            document.getElementById('modalRate').value = slot.overrideRate || '';
            document.getElementById('deleteServiceBtn').style.display = 'inline-flex';
        }
    } else {
        // New Recurring Service
        titleEl.textContent = 'Add Service';
        document.getElementById('modalSlotDay').value = day || '';
        if(hour !== null) {
            startEl.value = String(hour).padStart(2, '0') + ':00';
            endEl.value = String(hour + 1).padStart(2, '0') + ':00';
        }
        document.getElementById('deleteServiceBtn').style.display = 'none';
    }

    typeEl.dispatchEvent(new Event('change'));
    document.getElementById('scheduleModalOverlay').style.display = 'flex';
}

function closeScheduleModal() {
    document.getElementById('scheduleModalOverlay').style.display = 'none';
    document.querySelectorAll('.selection-highlight').forEach(c => c.classList.remove('selection-highlight'));
}

function saveServiceFromModal() {
    const context = document.getElementById('modalContext').value;
    const serviceType = document.getElementById('modalServiceType').value;
    const isManual = ['Consumable', 'Transport'].includes(serviceType);

    if (context === 'edit-instance') {
        const id = document.getElementById('modalServiceId').value;
        const instance = appState.allServiceInstances.find(i => i.instanceId === id);
        if(instance) {
            deleteServiceInstance(id, false); 
            
            if(isManual) {
                appState.manualServices.push({
                    id: instance.type === 'manual' ? instance.serviceId : `manual_${appState.nextManualServiceId++}`,
                    date: calcFormatDate(instance.date),
                    description: serviceType + ': ' + document.getElementById('modalManualDescription').value,
                    cost: parseFloat(document.getElementById('modalManualCost').value)
                });
            } else {
                 appState.manualServices.push({
                    id: instance.type === 'manual' ? instance.serviceId : `manual_${appState.nextManualServiceId++}`,
                    date: calcFormatDate(instance.date),
                    description: serviceType,
                    startTime: document.getElementById('modalStartTime').value,
                    endTime: document.getElementById('modalEndTime').value,
                    costDivider: parseFloat(document.getElementById('modalRatio').value) || 1,
                    overrideRate: parseFloat(document.getElementById('modalRate').value) || null
                });
            }
        }
    } else if (context === 'daily-one-off') {
        if (isManual) {
             appState.manualServices.push({
                id: `manual_${appState.nextManualServiceId++}`,
                date: appState.selectedDateStr,
                description: serviceType + ': ' + document.getElementById('modalManualDescription').value,
                cost: parseFloat(document.getElementById('modalManualCost').value)
            });
        } else {
            appState.manualServices.push({
                id: `manual_${appState.nextManualServiceId++}`,
                date: appState.selectedDateStr,
                description: serviceType,
                startTime: document.getElementById('modalStartTime').value,
                endTime: document.getElementById('modalEndTime').value,
                costDivider: parseFloat(document.getElementById('modalRatio').value) || 1,
                overrideRate: parseFloat(document.getElementById('modalRate').value) || null
            });
        }
    } else {
        const slotData = {
            day: document.getElementById('modalSlotDay').value,
            startTime: document.getElementById('modalStartTime').value,
            endTime: document.getElementById('modalEndTime').value,
            serviceType: serviceType,
            costDivider: parseFloat(document.getElementById('modalRatio').value) || 1,
            overrideRate: parseFloat(document.getElementById('modalRate').value) || null
        };
        const id = document.getElementById('modalServiceId').value;
        if(id) {
            const index = appState.weeklyScheduleSlots.findIndex(s => s.id === id);
            if(index > -1) appState.weeklyScheduleSlots[index] = { ...appState.weeklyScheduleSlots[index], ...slotData };
        } else {
            appState.weeklyScheduleSlots.push({ id: `weekly_${appState.nextWeeklySlotId++}`, ...slotData, exceptions: [] });
        }
    }

    renderAll();
    closeScheduleModal();
}

function deleteServiceFromModal() {
    const id = document.getElementById('modalServiceId').value;
    if (id) {
        appState.weeklyScheduleSlots = appState.weeklyScheduleSlots.filter(s => s.id !== id);
        renderAll();
        closeScheduleModal();
    }
}

function deleteServiceInstance(instanceId, shouldRender = true) {
    const instance = appState.allServiceInstances.find(inst => inst.instanceId === instanceId);
    if (!instance) return;

    if (instance.type === 'manual') {
        appState.manualServices = appState.manualServices.filter(ms => ms.id !== instance.serviceId);
    } else if (instance.type === 'weekly') {
        const weeklySlot = appState.weeklyScheduleSlots.find(slot => slot.id === instance.serviceId);
        if (weeklySlot) {
            if (!weeklySlot.exceptions) weeklySlot.exceptions = [];
            const instanceDateStr = calcFormatDate(instance.date);
            if (!weeklySlot.exceptions.includes(instanceDateStr)) {
                weeklySlot.exceptions.push(instanceDateStr);
            }
        }
    }

    if (shouldRender) renderAll();
}

// --- Multi-Day Logic ---
function setupMultiDayListeners() {
    document.getElementById('selectWeekdaysBtn').addEventListener('click', () => {
        document.querySelectorAll('#multiDaySelector .day-checkbox').forEach(cb => {
            cb.checked = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(cb.value);
        });
    });

    document.getElementById('selectWeekendBtn').addEventListener('click', () => {
        document.querySelectorAll('#multiDaySelector .day-checkbox').forEach(cb => {
            cb.checked = ['Sat', 'Sun'].includes(cb.value);
        });
    });

    document.getElementById('selectAllDaysBtn').addEventListener('click', () => {
        document.querySelectorAll('#multiDaySelector .day-checkbox').forEach(cb => {
            cb.checked = true;
        });
    });

    document.getElementById('resetMultiDayFormBtn').addEventListener('click', () => {
        document.getElementById('multiDayStartTime').value = '';
        document.getElementById('multiDayEndTime').value = '';
        document.getElementById('multiDayServiceType').value = 'Self-Care Activities/Social and Community Access';
        document.getElementById('multiDayFrequency').value = 'weekly';
        document.getElementById('multiDayRate').value = '';
        document.getElementById('multiDayRatio').value = '1';
        document.querySelectorAll('#multiDaySelector .day-checkbox').forEach(cb => cb.checked = false);
        document.getElementById('multiDayStartTime').disabled = false;
        document.getElementById('multiDayEndTime').disabled = false;
    });

    document.getElementById('multiDayServiceType').addEventListener('change', (e) => {
        const startEl = document.getElementById('multiDayStartTime');
        const endEl = document.getElementById('multiDayEndTime');
        if (e.target.value === 'Night-Time Sleepover') {
            startEl.value = '22:00';
            endEl.value = '06:00';
            startEl.disabled = true;
            endEl.disabled = true;
        } else {
            startEl.disabled = false;
            endEl.disabled = false;
        }
    });

    document.getElementById('addMultiDayScheduleBtn').addEventListener('click', () => {
        const start = document.getElementById('multiDayStartTime').value;
        const end = document.getElementById('multiDayEndTime').value;
        const type = document.getElementById('multiDayServiceType').value;
        const freq = document.getElementById('multiDayFrequency').value;
        const checkBoxes = document.querySelectorAll('#multiDaySelector input:checked');
        
        if(!start || !end || checkBoxes.length === 0) {
            calcShowMessage("Please complete all fields");
            return;
        }

        checkBoxes.forEach(cb => {
            appState.weeklyScheduleSlots.push({
                id: `weekly_${appState.nextWeeklySlotId++}`,
                day: cb.value,
                startTime: start,
                endTime: end,
                serviceType: type,
                frequency: freq,
                costDivider: parseFloat(document.getElementById('multiDayRatio').value) || 1,
                overrideRate: parseFloat(document.getElementById('multiDayRate').value) || null,
                exceptions: []
            });
        });
        renderAll();
        
        // Clear selection highlights after adding
        document.querySelectorAll('.selection-highlight').forEach(c => c.classList.remove('selection-highlight'));
    });
}

// --- Drag and Drop Logic (Weekly) ---
function setupDragAndDrop() {
    const table = document.getElementById('weeklyScheduleTable');
    if(!table) return;

    const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    table.addEventListener('mousedown', (e) => {
        // Target the cell directly
        const cell = e.target.closest('td[data-day]');
        if (!cell || e.target.closest('.service-block')) return;
        
        appState.isDragging = true;
        appState.dragStartCell = cell;
        
        // Clear existing highlights
        document.querySelectorAll('.selection-highlight').forEach(c => c.classList.remove('selection-highlight'));
        
        // Add highlight to start cell immediately
        cell.classList.add('selection-highlight');
        
        document.body.classList.add('dragging-selection');
        e.preventDefault();
    });

    table.addEventListener('mouseover', (e) => {
        if (!appState.isDragging || !appState.dragStartCell) return;
        const cell = e.target.closest('td[data-day]');
        if (!cell) return;
        
        const startDayIndex = daysOrder.indexOf(appState.dragStartCell.dataset.day);
        const currentDayIndex = daysOrder.indexOf(cell.dataset.day);
        
        const startHour = parseInt(appState.dragStartCell.dataset.hour);
        const currentHour = parseInt(cell.dataset.hour);

        const minDayIndex = Math.min(startDayIndex, currentDayIndex);
        const maxDayIndex = Math.max(startDayIndex, currentDayIndex);
        
        const minHour = Math.min(startHour, currentHour);
        const maxHour = Math.max(startHour, currentHour);

        // Reset highlights
        table.querySelectorAll('.selection-highlight').forEach(c => c.classList.remove('selection-highlight'));
        
        // Apply new highlights
        for (let d = minDayIndex; d <= maxDayIndex; d++) {
            const dayStr = daysOrder[d];
            for (let h = minHour; h <= maxHour; h++) {
                const target = table.querySelector(`td[data-day="${dayStr}"][data-hour="${h}"]`);
                if (target) target.classList.add('selection-highlight');
            }
        }
    });

    document.addEventListener('mouseup', () => {
        if (appState.isDragging) {
            appState.isDragging = false;
            document.body.classList.remove('dragging-selection');
            
            const highlights = table.querySelectorAll('.selection-highlight');
            
            if(highlights.length > 0 && appState.dragStartCell) {
                 const hours = Array.from(highlights).map(td => parseInt(td.dataset.hour));
                 const minHour = Math.min(...hours);
                 const maxHour = Math.max(...hours);
                 
                 const startStr = String(minHour).padStart(2, '0') + ':00';
                 const endStr = String(maxHour + 1).padStart(2, '0') + ':00';
                 
                 const selectedDays = new Set(Array.from(highlights).map(td => td.dataset.day));

                 const startEl = document.getElementById('multiDayStartTime');
                 const endEl = document.getElementById('multiDayEndTime');
                 
                 if(startEl && endEl) {
                     startEl.value = startStr;
                     endEl.value = endStr;
                 }
                 
                 document.querySelectorAll('#multiDaySelector .day-checkbox').forEach(cb => {
                     cb.checked = selectedDays.has(cb.value);
                 });
            }
            appState.dragStartCell = null;
        }
    });

    table.addEventListener('click', (e) => {
        const block = e.target.closest('.service-block');
        if(block) {
            openScheduleModal(null, null, block.dataset.serviceId);
        }
    });
}

// --- Drag and Drop Logic (Daily) ---
function setupDailyDragAndDrop() {
    const container = document.getElementById('dailyServiceViewContainer');
    
    container.addEventListener('mousedown', (e) => {
        const cell = e.target.closest('#dailyScheduleTable td[data-hour]');
        if (!cell || e.target.closest('.service-block')) return;
        
        appState.isDraggingDaily = true;
        appState.dragStartCellDaily = cell;
        
        container.querySelectorAll('.selection-highlight').forEach(c => c.classList.remove('selection-highlight'));
        cell.classList.add('selection-highlight');
        
        document.body.classList.add('dragging-selection');
        e.preventDefault();
    });

    container.addEventListener('mouseover', (e) => {
        if (!appState.isDraggingDaily || !appState.dragStartCellDaily) return;
        
        const cell = e.target.closest('#dailyScheduleTable td[data-hour]');
        if (!cell) return;

        const startHour = parseInt(appState.dragStartCellDaily.dataset.hour);
        const currentHour = parseInt(cell.dataset.hour);
        
        const low = Math.min(startHour, currentHour);
        const high = Math.max(startHour, currentHour);
        
        container.querySelectorAll('#dailyScheduleTable td[data-hour]').forEach(td => {
            const h = parseInt(td.dataset.hour);
            if (h >= low && h <= high) {
                td.classList.add('selection-highlight');
            } else {
                td.classList.remove('selection-highlight');
            }
        });
    });

    document.addEventListener('mouseup', () => {
        if (appState.isDraggingDaily) {
            appState.isDraggingDaily = false;
            document.body.classList.remove('dragging-selection');
            
            const highlighted = container.querySelectorAll('.selection-highlight');
            if(highlighted.length > 0) {
                const highlightedArray = Array.from(highlighted).sort((a,b) => parseInt(a.dataset.hour) - parseInt(b.dataset.hour));
                const startHour = parseInt(highlightedArray[0].dataset.hour);
                const endHour = parseInt(highlightedArray[highlightedArray.length - 1].dataset.hour);
                
                const date = new Date(appState.selectedDateStr);
                const dayStr = calcGetDayOfWeekString(date);

                openScheduleModal(dayStr, startHour, null, null, 'daily-one-off');
                document.getElementById('modalEndTime').value = String(endHour + 1).padStart(2, '0') + ':00';
            }
            
            appState.dragStartCellDaily = null;
        }
    });
}

// --- SAVE / LOAD ---
function saveCalculatorState() {
    const formData = {
        participantName: document.getElementById('participantName').value,
        ndisNumber: document.getElementById('ndisNumber').value,
        totalAvailableFunding: document.getElementById('totalAvailableFunding').value,
        releasePeriod: document.getElementById('releasePeriod').value,
        periodStartDate: document.getElementById('periodStartDate').value,
        periodEndDate: document.getElementById('periodEndDate').value
    };

    const saveData = {
        formData: formData,
        weeklyScheduleSlots: appState.weeklyScheduleSlots,
        manualServices: appState.manualServices,
        calcPeriods: appState.calcPeriods, 
        nextWeeklySlotId: appState.nextWeeklySlotId,
        nextManualServiceId: appState.nextManualServiceId
    };

    const blob = new Blob([JSON.stringify(saveData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const name = formData.participantName ? formData.participantName.replace(/[^a-z0-9]/gi, '_') : 'calculator';
    link.download = `${name}_save.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function loadCalculatorState(event) {
    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            if (data.formData) {
                if(data.formData.participantName !== undefined) document.getElementById('participantName').value = data.formData.participantName;
                if(data.formData.ndisNumber !== undefined) document.getElementById('ndisNumber').value = data.formData.ndisNumber;
                if(data.formData.totalAvailableFunding !== undefined) document.getElementById('totalAvailableFunding').value = data.formData.totalAvailableFunding;
                if(data.formData.releasePeriod !== undefined) document.getElementById('releasePeriod').value = data.formData.releasePeriod;
                if(data.formData.periodStartDate !== undefined) document.getElementById('periodStartDate').value = data.formData.periodStartDate;
                if(data.formData.periodEndDate !== undefined) document.getElementById('periodEndDate').value = data.formData.periodEndDate;
            }

            appState.weeklyScheduleSlots = data.weeklyScheduleSlots || [];
            appState.manualServices = data.manualServices || [];
            
            if (data.nextWeeklySlotId !== undefined) appState.nextWeeklySlotId = data.nextWeeklySlotId;
            if (data.nextManualServiceId !== undefined) appState.nextManualServiceId = data.nextManualServiceId;

            if (data.calcPeriods && data.calcPeriods.length > 0) {
                appState.calcPeriods = data.calcPeriods;
            } else {
                generatePeriods();
            }

            const startDateStr = document.getElementById('periodStartDate').value;
            if (startDateStr) {
                const startDate = new Date(startDateStr);
                if (!isNaN(startDate)) {
                    appState.calendarDate = startDate;
                    appState.selectedDateStr = calcFormatDate(startDate);
                }
            }

            updateDurationDisplay(); 
            renderAll();
            
            event.target.value = '';
            calcShowMessage("Plan loaded successfully.");

        } catch (error) {
            console.error("Error loading file:", error);
            calcShowMessage("Error loading file. Please ensure it is a valid JSON file.");
        }
    };
    reader.readAsText(file);
}