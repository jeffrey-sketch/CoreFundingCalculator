function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function renderWeeklyScheduleTable() {
    const table = document.getElementById('weeklyScheduleTable');
    if (!table) return;

    table.innerHTML = '';
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayFullNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; 

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    headerRow.insertCell().outerHTML = '<th class="w-16 bg-gray-50 text-gray-400 font-medium text-[10px] uppercase sticky left-0 z-20"></th>';
    
    for(let i = 0; i < 24; i++) {
        const th = document.createElement('th');
        th.className = "text-[10px] text-gray-400 font-medium bg-gray-50 h-8";
        th.textContent = (i % 12 === 0 ? 12 : i % 12) + (i < 12 ? 'a' : 'p');
        headerRow.appendChild(th);
    }

    const tbody = table.createTBody();
    days.forEach((day, index) => {
        const row = tbody.insertRow();
        row.className = "hover:bg-gray-50/50";
        // Day Header Column
        const dayCell = row.insertCell();
        dayCell.className = "day-header sticky left-0 bg-white z-10 border-r border-gray-100 text-xs font-bold text-gray-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]";
        dayCell.innerHTML = `<div class="flex items-center justify-center h-full">${dayFullNames[index]}</div>`;
        
        for(let hour = 0; hour < 24; hour++) {
            const cell = row.insertCell();
            cell.dataset.day = day;
            cell.dataset.hour = hour;
            // Add schedule-cell class for better targeting
            cell.className = "schedule-cell border-r border-b border-gray-100 relative h-10";
            if(hour % 6 === 0) cell.classList.add("border-l-2", "border-l-gray-100"); 
        }
    });

    // 1. Process all slots into renderable blocks
    let blocksToRender = [];
    appState.weeklyScheduleSlots.forEach(slot => {
        const startMinOfDay = timeToMinutes(slot.startTime);
        let endMinOfDay = timeToMinutes(slot.endTime);
        const isOvernight = endMinOfDay <= startMinOfDay;

        // Ratio logic (show KM if available, otherwise show ratio)
        let ratioText = '';
        if (slot.km) {
            ratioText = `<span class="bg-black/20 px-1 rounded mr-1">${slot.km}km</span>`;
        } else {
            ratioText = parseFloat(slot.costDivider) < 1 
                ? `<span class="bg-black/20 px-1 rounded mr-1">${1 / parseFloat(slot.costDivider)}:1</span>` 
                : (slot.costDivider != 1 ? `<span class="bg-black/20 px-1 rounded mr-1">1:${slot.costDivider}</span>` : '');
        }

        const serviceText = serviceTypeMap[slot.serviceType] || slot.serviceType;
        let icon = '';
        if(serviceText.includes('Cleaning')) icon = 'fa-broom';
        else if(serviceText.includes('Social')) icon = 'fa-user-friends';
        else if(serviceText.includes('Sleep')) icon = 'fa-bed';
        else if(serviceText.includes('Yard')) icon = 'fa-leaf';
        else if(serviceText.includes('Travel')) icon = 'fa-car';
        
        const blockContent = `
            <div class="flex items-center gap-1 w-full h-full overflow-hidden leading-none">
                ${icon ? `<i class="fas ${icon} opacity-50 text-[10px]"></i>` : ''}
                ${ratioText}
                <span class="truncate text-[10px] font-medium">${serviceText}</span>
            </div>
        `;
        const colorClass = serviceTypeColors[slot.serviceType] || 'bg-gray-500';

        const blockBase = {
            id: slot.id,
            content: blockContent,
            color: colorClass,
            slot: slot
        };

        if (isOvernight) {
            if (startMinOfDay < 1440) {
                blocksToRender.push({ ...blockBase, day: slot.day, startMin: startMinOfDay, endMin: 1440 });
            }
            if (endMinOfDay > 0) {
                const dayIndex = days.indexOf(slot.day);
                const nextDay = days[(dayIndex + 1) % 7];
                blocksToRender.push({ ...blockBase, day: nextDay, startMin: 0, endMin: endMinOfDay });
            }
        } else {
            blocksToRender.push({ ...blockBase, day: slot.day, startMin: startMinOfDay, endMin: endMinOfDay });
        }
    });

    // 2. Group by day & Calculate Lanes
    const blocksByDay = days.reduce((acc, day) => ({ ...acc, [day]: [] }), {});
    blocksToRender.forEach(block => {
        if (blocksByDay[block.day]) blocksByDay[block.day].push(block);
    });

    let allProcessedBlocks = [];
    days.forEach(day => {
        const dayBlocks = blocksByDay[day].sort((a, b) => a.startMin - b.startMin);
        let lanes = [];

        dayBlocks.forEach(block => {
            let placed = false;
            for (let i = 0; i < lanes.length; i++) {
                const lastBlockInLane = lanes[i][lanes[i].length - 1];
                if (block.startMin >= lastBlockInLane.endMin) {
                    lanes[i].push(block);
                    block.laneIndex = i;
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                lanes.push([block]);
                block.laneIndex = lanes.length - 1;
            }
        });

        const totalLanes = lanes.length > 0 ? lanes.length : 1;
        dayBlocks.forEach(block => block.totalLanes = totalLanes);
        allProcessedBlocks = allProcessedBlocks.concat(dayBlocks);
    });

    // 3. Render
    allProcessedBlocks.forEach(block => {
        const startHour = Math.floor(block.startMin / 60);
        if (startHour >= 24) return; 

        const startCell = table.querySelector(`td[data-day="${block.day}"][data-hour="${startHour}"]`);
        if (!startCell) return;

        const blockDiv = document.createElement('div');
        blockDiv.className = `service-block ${block.color}`;
        blockDiv.dataset.serviceId = block.id;
        blockDiv.innerHTML = block.content;

        const laneHeight = 100 / block.totalLanes;
        blockDiv.style.top = `${block.laneIndex * laneHeight}%`;
        blockDiv.style.height = `calc(${laneHeight}% - 2px)`; 
        blockDiv.style.bottom = 'auto';
        
        const startOffsetMinutes = block.startMin % 60;
        const durationMinutes = block.endMin - block.startMin;
        
        blockDiv.style.left = `${(startOffsetMinutes / 60) * 100}%`;
        blockDiv.style.width = `calc(${(durationMinutes / 60) * 100}% - 2px)`; 

        startCell.appendChild(blockDiv);
    });
}

function renderDailyServices() {
    const container = document.getElementById('dailyServiceViewContainer');
    container.innerHTML = '';
    if (!appState.selectedDateStr) return;

    // Filter services starting today
    const servicesStartingToday = appState.allServiceInstances.filter(inst => calcFormatDate(inst.date) === appState.selectedDateStr);
    
    const yesterday = new Date(appState.selectedDateStr + "T00:00:00");
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = calcFormatDate(yesterday);
    
    const servicesEndingToday = appState.allServiceInstances.filter(inst => {
        if (calcFormatDate(inst.date) !== yesterdayStr) return false;
        const times = inst.details.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
        if (!times) return false;
        const startMinutes = timeToMinutes(times[1]);
        const endMinutes = timeToMinutes(times[2]);
        return endMinutes <= startMinutes || (times[2] === '00:00' && startMinutes > 0);
    });

    let html = `<div class="flex justify-between items-center mb-4">
                    <h4 class="text-lg font-bold text-gray-800">
                        <span class="text-gray-400 font-normal">Day View:</span> ${calcFormatDisplayDate(appState.selectedDateStr)}
                    </h4>
                    <span class="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">${servicesStartingToday.length} Services</span>
                </div>`;

    if (servicesStartingToday.length === 0 && servicesEndingToday.length === 0) {
        html += `<div class="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <div class="text-gray-400 mb-2"><i class="far fa-calendar-times text-2xl"></i></div>
            <p class="text-gray-500 font-medium">No services scheduled.</p>
            <p class="text-xs text-gray-400">Click a time slot below to add one.</p>
        </div>`;
    }

    // --- 1. Render the Visual Timetable ---
    html += '<div class="mt-4 overflow-x-auto rounded-xl border border-gray-200 shadow-inner bg-white"><table id="dailyScheduleTable" class="w-full"><thead><tr>';
    for(let i = 0; i < 24; i++) {
        html += `<th class="text-[10px] text-gray-400 bg-gray-50 py-1 border-r border-gray-100">${(i % 12 === 0 ? 12 : i % 12) + (i < 12 ? 'a' : 'p')}</th>`;
    }
    html += '</tr></thead><tbody><tr>';
    for(let i = 0; i < 24; i++) {
        html += `<td data-hour="${i}" class="h-12 border-r border-gray-100 relative hover:bg-blue-50/50 transition-colors"></td>`;
    }
    html += '</tr></tbody></table></div>';
    html += `<p class="text-[10px] text-gray-400 mt-2 text-right">Drag to select time • Click blocks to edit</p>`;

    // --- 2. Render the Detailed Summary Table (NEW) ---
    if (servicesStartingToday.length > 0) {
        html += `
            <div class="mt-6">
                <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Daily Cost Breakdown</h5>
                <div class="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                            <tr>
                                <th class="px-4 py-3">Service</th>
                                <th class="px-4 py-3">Time</th>
                                <th class="px-4 py-3 text-center">Qty</th>
                                <th class="px-4 py-3 text-right">Cost</th>
                                <th class="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
        `;

        let totalDayHours = 0;
        let totalDayCost = 0;

        servicesStartingToday.sort((a,b) => {
            const timeA = a.details.match(/\d{2}:\d{2}/) ? a.details : '00:00';
            const timeB = b.details.match(/\d{2}:\d{2}/) ? b.details : '00:00';
            return timeA.localeCompare(timeB);
        });

        servicesStartingToday.forEach(inst => {
            let qty = 0;
            // Handle Hours or KM
            if(inst.details.includes('hrs')) {
                const match = inst.details.match(/\(([\d\.]+) hrs\)/);
                if(match) qty = parseFloat(match[1]);
            } else if (inst.details.includes('km')) {
                const match = inst.details.match(/\(([\d\.]+) km\)/);
                if(match) qty = parseFloat(match[1]);
            }
            
            // Note: totalDayHours is now a mix of hrs/km, which is conceptually weird but okay for "Qty"
            totalDayHours += qty; 
            totalDayCost += inst.cost;

            html += `
                <tr class="hover:bg-gray-50 transition-colors group">
                    <td class="px-4 py-3">
                        <div class="font-medium text-gray-800">${inst.description}</div>
                        <div class="text-[10px] text-blue-500">${getRateTypeSuffix(inst.rateType)}</div>
                    </td>
                    <td class="px-4 py-3 text-gray-500 text-xs">${inst.details}</td>
                    <td class="px-4 py-3 text-center text-gray-600 font-mono text-xs">${qty > 0 ? qty.toFixed(2) : '-'}</td>
                    <td class="px-4 py-3 text-right font-medium text-gray-800">${formatNumber(inst.cost, true)}</td>
                    <td class="px-4 py-3 text-center">
                        <button class="text-gray-300 hover:text-red-500 transition-colors delete-instance-btn" data-instance-id="${inst.instanceId}" title="Delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                        <tfoot class="bg-gray-50 font-bold border-t border-gray-100 text-gray-800">
                            <tr>
                                <td colspan="2" class="px-4 py-3 text-right text-xs uppercase text-gray-500">Total</td>
                                <td class="px-4 py-3 text-center">-</td>
                                <td class="px-4 py-3 text-right text-blue-600">${formatNumber(totalDayCost, true)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;

    // --- 3. Render Visual Blocks on the Timetable ---
    const table = container.querySelector('#dailyScheduleTable');
    if (!table) return;

    let blocksToRender = [];

    const getBlockContent = (inst) => {
        return `
            <div class="flex justify-between items-center w-full px-1">
                <span class="truncate text-[9px] font-semibold">${inst.description}</span>
                <button class="daily-delete-btn-on-block ml-1 hover:text-red-200" data-instance-id="${inst.instanceId}">&times;</button>
            </div>
        `;
    };

    servicesStartingToday.forEach(inst => {
        const times = inst.details.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
        const serviceKey = Object.keys(serviceTypeMap).find(key => key.includes(inst.description)) || inst.description;
        const colorClass = serviceTypeColors[serviceKey] || 'bg-gray-500';

        if (times) {
            const startTime = times[1];
            const endTime = times[2];
            const startMinutes = timeToMinutes(startTime);
            let endMinutes = timeToMinutes(endTime);
            const isOvernight = endMinutes <= startMinutes || (endTime === '00:00' && startMinutes > 0);

            const blockBase = {
                instanceId: inst.instanceId,
                content: getBlockContent(inst),
                color: colorClass
            };

            if (isOvernight) {
                if (startMinutes < 1440) {
                    blocksToRender.push({ ...blockBase, startMin: startMinutes, endMin: 1440 });
                }
            } else {
                blocksToRender.push({ ...blockBase, startMin: startMinutes, endMin: endMinutes });
            }
        }
    });

    servicesEndingToday.forEach(inst => {
        const times = inst.details.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
        const endTime = times[2];
        const endMinutes = timeToMinutes(endTime);

        if (endMinutes > 0) {
            const serviceKey = Object.keys(serviceTypeMap).find(key => key.includes(inst.description)) || inst.description;
            const colorClass = serviceTypeColors[serviceKey] || 'bg-gray-500';
            blocksToRender.push({
                instanceId: inst.instanceId,
                content: getBlockContent(inst),
                color: colorClass,
                startMin: 0,
                endMin: endMinutes
            });
        }
    });

    const timedBlocks = blocksToRender.sort((a, b) => a.startMin - b.startMin);
    let lanes = [];
    timedBlocks.forEach(block => {
        let placed = false;
        for (let i = 0; i < lanes.length; i++) {
            const lastBlockInLane = lanes[i][lanes[i].length - 1];
            if (block.startMin >= lastBlockInLane.endMin) {
                lanes[i].push(block);
                block.laneIndex = i;
                placed = true;
                break;
            }
        }
        if (!placed) {
            lanes.push([block]);
            block.laneIndex = lanes.length - 1;
        }
    });

    const totalLanes = lanes.length > 0 ? lanes.length : 1;
    timedBlocks.forEach(block => {
        block.totalLanes = totalLanes;
        const startHour = Math.floor(block.startMin / 60);
        if (startHour >= 24) return;

        const startCell = table.querySelector(`td[data-hour="${startHour}"]`);
        if (!startCell) return;

        const blockDiv = document.createElement('div');
        blockDiv.className = `service-block ${block.color} flex items-center shadow-sm`;
        blockDiv.dataset.instanceId = block.instanceId;
        blockDiv.innerHTML = block.content;

        const laneHeight = 100 / block.totalLanes;
        blockDiv.style.top = `${block.laneIndex * laneHeight}%`;
        blockDiv.style.height = `calc(${laneHeight}% - 1px)`;
        blockDiv.style.bottom = 'auto';
        
        const startOffsetMinutes = block.startMin % 60;
        const durationMinutes = block.endMin - block.startMin;
        blockDiv.style.left = `${(startOffsetMinutes / 60) * 100}%`;
        blockDiv.style.width = `calc(${(durationMinutes / 60) * 100}% - 1px)`;
        blockDiv.style.padding = '0';

        startCell.appendChild(blockDiv);
    });
}
