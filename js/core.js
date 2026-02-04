// --- RATE LOGIC ---

function getRateInfo(serviceType, dateTimePoint) {
    const serviceDate = new Date(dateTimePoint);
    const currentHour = serviceDate.getHours();
    const calcRates = serviceDate < rateChangeDate ? ratesPre20250701 : ratesPost20250701;
    const serviceRateInfo = calcRates[serviceType];

    if (!serviceRateInfo) return { rateObj: { rate: 0, unit: 'hour' }, rateTypeString: "Invalid" };
    if (serviceRateInfo["Any"]) return { rateObj: { ...serviceRateInfo["Any"] }, rateTypeString: 'Flat Rate' };

    const dayIndex = serviceDate.getDay();
    if (dayIndex === 6) return { rateObj: { ...serviceRateInfo["Sat"] }, rateTypeString: 'Sat' };
    if (dayIndex === 0) return { rateObj: { ...serviceRateInfo["Sun"] }, rateTypeString: 'Sun' };

    if (currentHour >= 0 && currentHour < 6) return { rateObj: { ...serviceRateInfo["Mon-Fri-Night"] }, rateTypeString: 'Mon-Fri-Night' };
    if (currentHour >= 6 && currentHour < 20) return { rateObj: { ...serviceRateInfo["Mon-Fri-Day"] }, rateTypeString: 'Mon-Fri-Day' };
    if (currentHour >= 20 && currentHour < 24) return { rateObj: { ...serviceRateInfo["Mon-Fri-Evening"] }, rateTypeString: 'Mon-Fri-Evening' };

    return { rateObj: { rate: 0, unit: 'hour' }, rateTypeString: "Not Found" };
}

function calcGetRateForService(serviceType, dateTimePoint) {
    const serviceDate = new Date(dateTimePoint);
    const calcRates = serviceDate < rateChangeDate ? ratesPre20250701 : ratesPost20250701;
    const serviceRateInfoSet = calcRates[serviceType];

    if (calcIsPublicHoliday(serviceDate) && serviceRateInfoSet && serviceRateInfoSet["Public Holiday"]) {
        return { ...serviceRateInfoSet["Public Holiday"], rateType: 'Public Holiday' };
    }

    const baseRateInfo = getRateInfo(serviceType, dateTimePoint);
    return { ...baseRateInfo.rateObj, rateType: baseRateInfo.rateTypeString };
}

function calcGetStandardRateForService(serviceType, dateTimePoint) {
     const baseRateInfo = getRateInfo(serviceType, dateTimePoint);
     return baseRateInfo.rateObj;
}

// --- INSTANCE CREATION ---

function calculateAndCreateInstance(brokenService, date, type, baseId) {
    const formattedDate = calcFormatDate(date);
    const startDateTime = new Date(`${formattedDate}T${brokenService.startTime}:00`);
    let endDateTime = new Date(`${formattedDate}T${brokenService.endTime}:00`);
    if (endDateTime <= startDateTime) endDateTime.setDate(endDateTime.getDate() + 1);

    const diffMs = endDateTime.getTime() - startDateTime.getTime();
    if (diffMs <= 0) return null;

    const durationHours = diffMs / 3600000;
    let rateInfo;
    if (brokenService.overrideRate !== null && brokenService.overrideRate !== undefined) {
        rateInfo = { rate: brokenService.overrideRate, unit: 'hr', rateType: 'Custom' };
    } else {
        rateInfo = calcGetRateForService(brokenService.serviceType, startDateTime);
    }

    let cost;
    if (rateInfo.unit === 'night') {
        cost = rateInfo.rate / brokenService.costDivider;
    } else if (rateInfo.unit === 'km') {
        // Handle per-KM cost (use km from service object if available)
        cost = (brokenService.km || 0) * rateInfo.rate;
    } else {
        cost = (durationHours * rateInfo.rate) / brokenService.costDivider;
    }
    
    const serviceKey = Object.keys(serviceTypeMap).find(key => key.includes(brokenService.serviceType)) || brokenService.serviceType;
    const description = (type === 'weekly' && serviceTypeMap[serviceKey])
        ? serviceTypeMap[serviceKey]
        : serviceKey;

    let detailsText = `${brokenService.startTime}-${brokenService.endTime} (${durationHours.toFixed(2)} hrs)`;
    if (rateInfo.unit === 'km') {
        detailsText = `${brokenService.startTime}-${brokenService.endTime} (${brokenService.km || 0} km)`;
    }

    return {
        instanceId: `inst_${type === 'weekly' ? 'w' : 'm'}_${baseId}_${appState.allServiceInstances.length}`,
        serviceId: baseId,
        type: type,
        date: new Date(date),
        description: description,
        details: detailsText,
        rate: `${formatNumber(rateInfo.rate, true)}/${rateInfo.unit || 'hr'}`,
        cost: cost,
        rateType: rateInfo.rateType,
        ratio: brokenService.costDivider
    };
}

// --- PERIOD GENERATION ---

function updateDurationDisplay() {
    const startDateStr = document.getElementById('periodStartDate').value;
    const endDateStr = document.getElementById('periodEndDate').value;
    const displayEl = document.getElementById('durationDisplay');
    
    if(startDateStr && endDateStr) {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        if(endDate >= startDate) {
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const weeks = Math.floor(diffDays / 7);
            const days = diffDays % 7;
            displayEl.textContent = `Duration: ${weeks} weeks, ${days} day(s) (Total ${diffDays} days)`;
        } else {
            displayEl.textContent = '';
        }
    } else {
        displayEl.textContent = '';
    }
}

function generatePeriods() {
    updateDurationDisplay();
    const totalFunding = parseFloat(document.getElementById('totalAvailableFunding').value) || 0;
    const startDateStr = document.getElementById('periodStartDate').value;
    const endDateStr = document.getElementById('periodEndDate').value;
    const releasePeriodVal = document.getElementById('releasePeriod').value;

    if (!startDateStr || !endDateStr) {
        appState.calcPeriods = [];
        return; 
    }

    const overallStartDate = new Date(startDateStr);
    const overallEndDate = new Date(endDateStr);

    if (overallEndDate < overallStartDate) {
        calcShowMessage("End Date cannot be before Start Date.");
        appState.calcPeriods = [];
        return;
    }

    const releaseMonths = parseInt(releasePeriodVal, 10);
    appState.calcPeriods = [];
    let periodIdCounter = 0;

    if (releaseMonths === 0) {
        appState.calcPeriods.push({
            id: `period_${periodIdCounter++}`,
            startDate: startDateStr,
            endDate: endDateStr,
            funding: totalFunding,
            isManual: false // Initialize manual flag
        });
    } else {
        let tempPeriods = [];
        let currentPeriodStart = new Date(overallStartDate);
        while (currentPeriodStart <= overallEndDate) {
            let currentPeriodEnd = new Date(currentPeriodStart);
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + releaseMonths);
            currentPeriodEnd.setDate(currentPeriodEnd.getDate() - 1);
            if (currentPeriodEnd > overallEndDate) {
                currentPeriodEnd = new Date(overallEndDate);
            }
            tempPeriods.push({
                id: `period_${periodIdCounter++}`,
                startDate: calcFormatDate(currentPeriodStart),
                endDate: calcFormatDate(currentPeriodEnd),
                isManual: false // Initialize manual flag
            });
            currentPeriodStart.setMonth(currentPeriodStart.getMonth() + releaseMonths);
        }

        const fundingPerPeriod = tempPeriods.length > 0 ? totalFunding / tempPeriods.length : 0;
        tempPeriods.forEach(p => p.funding = fundingPerPeriod);
        appState.calcPeriods = tempPeriods;
    }
}

// --- NEW: Funding Redistribution Logic ---
function updatePeriodFunding(periodId, newAmount) {
    const totalFunding = parseFloat(document.getElementById('totalAvailableFunding').value) || 0;
    const period = appState.calcPeriods.find(p => p.id === periodId);
    
    if (!period) return;
    
    // 1. Update the changed period and lock it
    period.funding = newAmount;
    period.isManual = true;

    // 2. Identify Locked (Manual) vs Unlocked (Auto) periods
    const manualPeriods = appState.calcPeriods.filter(p => p.isManual);
    const autoPeriods = appState.calcPeriods.filter(p => !p.isManual);

    // 3. Calculate remaining funding available for Auto periods
    const totalAllocatedToManual = manualPeriods.reduce((sum, p) => sum + p.funding, 0);
    
    if (autoPeriods.length > 0) {
        const remainingForAuto = totalFunding - totalAllocatedToManual;
        // Distribute remaining equally
        const perAutoPeriod = remainingForAuto / autoPeriods.length;
        
        // Update Auto periods
        autoPeriods.forEach(p => p.funding = perAutoPeriod);
    } else {
        // If NO auto periods left (all manual), the sum might not match Total Funding.
        // We generally allow this state as the user might be building up to a new total.
        // Or we could strictly enforce by updating the Total input? 
        // For now, we leave it as is, but the "Remaining" calculations in UI will reflect the discrepancy.
    }
}

// --- GENERATE ALL INSTANCES ---

function getSegments(start, end, boundaries) {
    const timePoints = [...new Set([start, end, ...boundaries.filter(b => b > start && b < end)])].sort();
    const segments = [];
    for (let i = 0; i < timePoints.length - 1; i++) {
        segments.push({ start: timePoints[i], end: timePoints[i+1] });
    }
    return segments;
}

function breakdownService(service) {
    const rateBoundaries = ['06:00', '20:00'];
    const isWeekday = !['Sat', 'Sun'].includes(service.day);

    if (!isWeekday || service.serviceType !== 'Self-Care Activities/Social and Community Access') {
        const simpleService = {...service};
        simpleService.details = `${service.day} ${service.startTime}-${service.endTime}`;
        return [simpleService];
    }

    let { startTime, endTime } = service;
    const brokenDownServices = [];

    if (endTime <= startTime) {
        const segmentsPart1 = getSegments(startTime, '24:00', rateBoundaries);
        segmentsPart1.forEach(seg => {
            const endTimeDisplay = seg.end === '24:00' ? '00:00' : seg.end;
            brokenDownServices.push({ ...service, startTime: seg.start, endTime: endTimeDisplay, details: `${service.day} ${seg.start}-${endTimeDisplay}` });
        });

        const segmentsPart2 = getSegments('00:00', endTime, rateBoundaries);
         segmentsPart2.forEach(seg => {
             const nextDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(service.day) + 1) % 7];
             brokenDownServices.push({ ...service, day: nextDay, startTime: seg.start, endTime: seg.end, details: `${nextDay} ${seg.start}-${seg.end}` });
        });
    } else {
        const segments = getSegments(startTime, endTime, rateBoundaries);
        segments.forEach(seg => {
            brokenDownServices.push({ ...service, startTime: seg.start, endTime: seg.end, details: `${service.day} ${seg.start}-${seg.end}` });
        });
    }
    return brokenDownServices;
}

function generateAllServiceInstances() {
    appState.allServiceInstances = [];
    const startDateStr = document.getElementById('periodStartDate').value;
    const endDateStr = document.getElementById('periodEndDate').value;

    if (!startDateStr || !endDateStr) return;

    const overallStartDate = new Date(startDateStr + 'T00:00:00');
    const overallEndDate = new Date(endDateStr + 'T23:59:59');

    appState.weeklyScheduleSlots.forEach(slot => {
        const brokenDownServices = breakdownService(slot);

        brokenDownServices.forEach(brokenService => {
            // 1. Find the first occurrence of the day
            let firstOccurrence = null;
            let tempDate = new Date(overallStartDate);
            while(tempDate <= overallEndDate) {
                if (calcGetDayOfWeekString(tempDate) === brokenService.day) {
                    firstOccurrence = new Date(tempDate);
                    break;
                }
                tempDate.setDate(tempDate.getDate() + 1);
            }

            if (!firstOccurrence) return;

            // 2. Get frequency from slot (default to 'weekly')
            const frequency = slot.frequency || 'weekly';

            // 3. Iterate from the first occurrence based on frequency
            let currentDateIterator = firstOccurrence;
            while(currentDateIterator <= overallEndDate) {
                const formattedDate = calcFormatDate(currentDateIterator);

                // Check exceptions
                if (!(brokenService.exceptions && brokenService.exceptions.includes(formattedDate))) {
                    const instance = calculateAndCreateInstance(brokenService, currentDateIterator, 'weekly', slot.id);
                    if (instance) {
                        appState.allServiceInstances.push(instance);
                    }
                }

                // 4. Increment the date based on frequency
                switch (frequency) {
                    case 'weekly':
                        currentDateIterator.setDate(currentDateIterator.getDate() + 7);
                        break;
                    case 'fortnightly':
                        currentDateIterator.setDate(currentDateIterator.getDate() + 14);
                        break;
                    case 'monthly':
                        const originalDate = currentDateIterator.getDate();
                        const dayOfWeek = currentDateIterator.getDay(); // 0-6
                        const weekOfMonth = Math.floor((originalDate - 1) / 7); // 0-4 (0=1st week, 1=2nd week, etc.)
                        
                        let currentMonth = currentDateIterator.getMonth();
                        currentDateIterator.setMonth(currentMonth + 1, 1); // Set to 1st of next month

                        // Find the first occurrence of that day in the new month
                        let firstDayOfMonth = currentDateIterator.getDay();
                        let dateOfFirstOccurrence = (dayOfWeek - firstDayOfMonth + 7) % 7 + 1;
                        
                        let targetDate = dateOfFirstOccurrence + (weekOfMonth * 7);

                        // Check if this date is still in the same month
                        let testDate = new Date(currentDateIterator.getFullYear(), currentDateIterator.getMonth(), targetDate);
                        
                        if (testDate.getMonth() !== currentDateIterator.getMonth()) {
                            // This means we asked for (e.g.) the 5th Friday, but this month only has 4.
                            // So, we'll use the *last* Friday instead.
                            targetDate -= 7;
                        }
                        
                        currentDateIterator.setDate(targetDate);
                        break;
                }
            }
        });
    });

    appState.manualServices.forEach(manualService => {
        const serviceDate = new Date(manualService.date + 'T00:00:00');
        if (serviceDate >= overallStartDate && serviceDate <= overallEndDate) {
            if (manualService.startTime && manualService.endTime) {
                const brokenDownManuals = breakdownService({
                    ...manualService,
                    day: calcGetDayOfWeekString(serviceDate),
                    serviceType: manualService.description
                });

                brokenDownManuals.forEach(brokenService => {
                     const instance = calculateAndCreateInstance(brokenService, serviceDate, 'manual', manualService.id);
                     if (instance) {
                         appState.allServiceInstances.push(instance);
                     }
                });
            } else {
                 // Try to determine rate for display purposes
                 let rateDisplay = 'N/A';
                 let type = manualService.description.split(':')[0]; // e.g. "Travel" from "Travel: 50km"
                 
                 // Access rates from config via global object
                 const currentRates = serviceDate < rateChangeDate ? ratesPre20250701 : ratesPost20250701;
                 if (currentRates[type] && currentRates[type].Any) {
                    rateDisplay = '$' + currentRates[type].Any.rate.toFixed(2) + '/' + currentRates[type].Any.unit;
                 }

                 appState.allServiceInstances.push({
                    instanceId: `inst_m_${manualService.id}`,
                    serviceId: manualService.id,
                    type: 'manual',
                    date: serviceDate,
                    description: manualService.description,
                    details: 'One-off cost',
                    rate: rateDisplay,
                    cost: manualService.cost,
                    rateType: 'Manual',
                    ratio: 'N/A'
                });
            }
        }
    });
}
