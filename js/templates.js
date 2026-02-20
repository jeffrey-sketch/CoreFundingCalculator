function buildCalculatorHTML(placeholder) {
     placeholder.innerHTML = `
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex items-center gap-4">
                <div class="h-16 w-16 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden shadow-inner">
                    <img src="Connect_Support_Group_Logo.png" alt="Logo" class="max-h-full max-w-full" onerror="this.onerror=null;this.src='https://placehold.co/96x96/eee/ccc?text=Logo';">
                </div>
                <div>
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Core Funding Calculator</h1>
                    <p class="text-sm text-gray-500 font-medium">Plan Management & Estimator</p>
                </div>
            </div>
        </div>

        <!-- Main Plan Inputs Card -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Left Column: Participant & Funding -->
            <div class="p-6 border border-gray-100 rounded-2xl bg-white shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow duration-300">
                <div class="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    <div class="p-2 bg-blue-50 rounded-lg text-blue-600"><i class="fas fa-user-circle text-xl"></i></div>
                    <h3 class="text-xl font-bold text-gray-800">Plan Details</h3>
                </div>

                <div class="space-y-5">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="group">
                            <label for="participantName" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Participant Name</label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="fas fa-user"></i></span>
                                <input type="text" id="participantName" class="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white transition-colors" placeholder="e.g., Jane Smith">
                            </div>
                        </div>
                        <div class="group">
                            <label for="ndisNumber" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">NDIS Number</label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="fas fa-id-card"></i></span>
                                <input type="text" id="ndisNumber" class="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white transition-colors" placeholder="e.g., 430xxxxx">
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                         <div class="group">
                             <label for="totalAvailableFunding" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Total Core Funding</label>
                             <div class="relative">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="fas fa-dollar-sign"></i></span>
                                <input type="text" id="totalAvailableFunding" class="currency-input w-full pl-10 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 font-bold text-lg focus:bg-white transition-colors" placeholder="0.00">
                             </div>
                         </div>
                         <div class="group">
                             <label for="releasePeriod" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Release Interval</label>
                             <div class="relative">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="fas fa-clock"></i></span>
                                <select id="releasePeriod" class="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 appearance-none focus:bg-white">
                                    <option value="0" selected>Full Period (No Breakdown)</option>
                                    <option value="1">Monthly</option>
                                    <option value="3">Quarterly (3 Months)</option>
                                    <option value="6">Biannually (6 Months)</option>
                                    <option value="12">Annually (12 Months)</option>
                                </select>
                                <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400"><i class="fas fa-chevron-down"></i></span>
                             </div>
                         </div>
                     </div>
                     
                     <!-- Other Expenses Dynamic Section -->
                     <div class="mb-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div class="flex justify-between items-center mb-3">
                              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Other Expenses</label>
                              <button id="addOtherExpenseBtn" class="px-3 py-1.5 bg-white border border-gray-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm"><i class="fas fa-plus mr-1"></i>Add Service</button>
                          </div>
                          <div id="otherExpensesContainer" class="space-y-3"></div>
                          <div class="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                              <span class="text-sm font-semibold text-gray-500">Total Other Expenses</span>
                              <span class="text-base font-bold text-red-600">-$<span id="totalOtherExpensesDisplay">0.00</span></span>
                          </div>
                     </div>
                </div>
            </div>

            <!-- Right Column: Schedule & Dates -->
            <div id="planDatesCard" class="p-6 border border-gray-100 rounded-2xl bg-white shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div class="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                    <div class="flex items-center gap-2">
                        <div class="p-2 bg-indigo-50 rounded-lg text-indigo-600"><i class="fas fa-calendar-alt text-xl"></i></div>
                        <h3 class="text-xl font-bold text-gray-800">Duration</h3>
                    </div>
                    <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        <button id="set1YearBtn" class="px-3 py-1 text-xs font-medium text-gray-600 hover:text-indigo-600 hover:bg-white rounded-md transition-all shadow-sm">1 Yr</button>
                        <button id="set2YearsBtn" class="px-3 py-1 text-xs font-medium text-gray-600 hover:text-indigo-600 hover:bg-white rounded-md transition-all shadow-sm">2 Yrs</button>
                        <button id="set5YearsBtn" class="px-3 py-1 text-xs font-medium text-gray-600 hover:text-indigo-600 hover:bg-white rounded-md transition-all shadow-sm">3 Yrs</button>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-5 mb-4">
                    <div>
                        <label for="periodStartDate" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Start Date</label>
                        <input type="date" id="periodStartDate" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:bg-white">
                    </div>
                    <div>
                        <label for="periodEndDate" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">End Date</label>
                        <input type="date" id="periodEndDate" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:bg-white">
                    </div>
                </div>
                
                <div class="flex items-center mb-4 px-1">
                    <input type="checkbox" id="includePublicHolidays" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 transition-colors cursor-pointer" checked>
                    <label for="includePublicHolidays" class="ml-2 text-sm font-medium text-gray-700 cursor-pointer">Include Public Holidays</label>
                </div>

                <div id="durationDisplay" class="text-center text-sm font-medium text-indigo-600 bg-indigo-50 py-2 rounded-lg mb-4"></div>

                <!-- Small Calendar Preview Area -->
                <div class="flex-grow flex flex-col">
                     <div id="calendarViewContainer" class="flex-grow rounded-xl overflow-hidden border border-gray-200"></div>
                </div>
            </div>
        </div>

        <!-- Schedule Builder CTA -->
        <div class="mb-10 text-center">
            <button id="openRecurringServiceModalBtn" class="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 font-lg rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <span class="absolute left-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                <span class="relative flex items-center gap-3">
                    <i class="fas fa-plus-circle text-xl group-hover:rotate-90 transition-transform"></i>
                    Build Weekly Schedule
                </span>
            </button>
        </div>

        <div class="space-y-8">
            <!-- Day View -->
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                 <div id="dailyServiceViewContainer"></div>
            </div>

            <!-- Overall Summary (Moved here) -->
            <div id="overallSummarySection" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-0 overflow-hidden">
                <div class="p-6 border-b border-gray-100 bg-gray-50">
                    <h2 class="text-lg font-bold text-gray-800">Plan Summary</h2>
                </div>
                <div id="summaryBoxContainer" class="p-6"></div>
                <div class="bg-gray-900 text-white p-6">
                    <div class="flex justify-between items-end">
                        <span class="text-sm font-medium text-gray-400 uppercase tracking-wide">Remaining Funding</span>
                        <span id="grandRemainingFundingCell" class="text-2xl font-bold tracking-tight">N/A</span>
                    </div>
                </div>
            </div>

            <!-- Service Log (Moved here) -->
             <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-0 overflow-hidden">
                <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors" id="toggleServiceLogBtn">
                    <h2 class="text-lg font-bold text-gray-800">Service Log</h2>
                    <div class="flex items-center gap-2">
                         <button id="exportCsvBtn" class="text-gray-500 hover:text-blue-600 p-2 rounded-lg transition-colors" title="Export CSV"><i class="fas fa-file-csv text-lg"></i></button>
                         <span class="toggle-button-icon text-gray-400">►</span>
                    </div>
                </div>
                <div id="serviceLogCollapsibleContent" class="collapsible-content">
                    <div id="serviceLogContainer" class="p-4 max-h-[500px] overflow-y-auto"></div>
                </div>
            </div>

            <!-- Period Breakdown -->
            <div id="periodBreakdownSection" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div class="flex items-center gap-3 mb-6">
                     <div class="p-2 bg-green-50 rounded-lg text-green-600"><i class="fas fa-chart-pie text-xl"></i></div>
                     <h2 class="text-xl font-bold text-gray-800">Funding Breakdown</h2>
                </div>
                <div id="periodsContainer" class="space-y-6"></div>
            </div>
        </div>

        <!-- Overlays -->
        <div id="calcMessageBoxOverlay" class="fixed inset-0 z-[2000] hidden flex-col justify-center items-center backdrop-blur-sm bg-black/40">
            <div id="calcMessageBoxContent" class="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center transform transition-all scale-100">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                    <i class="fas fa-info text-blue-600 text-lg"></i>
                </div>
                <p id="calcMessageBoxText" class="text-gray-600 mb-6 text-lg"></p>
                <button id="calcMessageBoxButton" class="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-colors">OK</button>
            </div>
        </div>

        <!-- Add/Edit Single Service Modal -->
        <div id="scheduleModalOverlay" class="fixed inset-0 z-[1300] hidden flex-col justify-center items-center backdrop-blur-sm bg-black/40">
            <div id="scheduleModalContent" class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 id="scheduleModalTitle" class="text-lg font-bold text-gray-800">Manage Service</h3>
                    <div class="h-1 w-12 bg-gray-300 rounded-full"></div>
                </div>
                <div class="p-6 space-y-5">
                    <input type="hidden" id="modalSlotDay">
                    <input type="hidden" id="modalSlotHour">
                    <input type="hidden" id="modalServiceId">
                    <input type="hidden" id="modalContext" value="">
                    
                    <div>
                        <label for="modalServiceType" class="block text-sm font-semibold text-gray-700 mb-2">Service Type</label>
                        <select id="modalServiceType" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                            <option value="Self-Care Activities/Social and Community Access">Self-Care / Social Access</option>
                            <option value="Night-Time Sleepover">Night Sleepover</option>
                            <option value="House Cleaning">House Cleaning</option>
                            <option value="Increased Social and Community Access">Increased Social Access</option>
                            <option value="Yard Maintenance">Yard Maintenance</option>
                            <option value="Consumable">Consumable</option>
                            <option value="Transport">Transport</option>
                            <option value="Travel">Travel ($1.00/km)</option>
                        </select>
                    </div>

                    <div id="modalWeeklyFields" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="modalStartTime" class="block text-sm font-semibold text-gray-700 mb-2">Start</label>
                                <input type="time" id="modalStartTime" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" step="900">
                            </div>
                            <div>
                                <label for="modalEndTime" class="block text-sm font-semibold text-gray-700 mb-2">End</label>
                                <input type="time" id="modalEndTime" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" step="900">
                            </div>
                        </div>
                         <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="modalRatio" class="block text-sm font-semibold text-gray-700 mb-2">Support Ratio</label>
                                <select id="modalRatio" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                                    ${[1,2,3,4,5,6,7].map(n => `<option value="${n}">1:${n}</option>`).join('')}
                                    <option value="0.5">2:1</option>
                                </select>
                            </div>
                            <div>
                                <label for="modalRate" class="block text-sm font-semibold text-gray-700 mb-2">Custom Rate ($)</label>
                                <input type="text" id="modalRate" class="currency-input w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="Auto">
                            </div>
                        </div>
                    </div>

                    <!-- Manual Fields (Consumable/Transport) -->
                    <div id="modalManualFields" style="display: none;" class="space-y-4">
                         <div class="grid grid-cols-2 gap-4">
                            <div class="col-span-2">
                                <label for="modalManualDescription" class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <input type="text" id="modalManualDescription" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="e.g., PPE, Taxi to Doctor">
                            </div>
                            <div class="col-span-2">
                                <label for="modalManualCost" class="block text-sm font-semibold text-gray-700 mb-2">Total Cost ($)</label>
                                <input type="text" id="modalManualCost" class="currency-input w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-800" placeholder="0.00">
                            </div>
                        </div>
                    </div>

                    <!-- Travel Fields (Travel) -->
                    <div id="modalTravelFields" style="display: none;" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="col-span-2">
                                <label for="modalTravelKm" class="block text-sm font-semibold text-gray-700 mb-2">Distance (km)</label>
                                <div class="relative">
                                     <input type="number" step="0.1" id="modalTravelKm" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-lg" placeholder="0">
                                     <span class="absolute right-4 top-3.5 text-gray-400 text-sm font-bold">km</span>
                                </div>
                            </div>
                            <div class="col-span-2">
                                 <label class="block text-sm font-semibold text-gray-700 mb-2">Calculated Cost ($1.00/km)</label>
                                 <div class="p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 font-bold text-xl flex justify-between items-center">
                                    <span id="modalTravelCostDisplay">$0.00</span>
                                    <i class="fas fa-car text-orange-200"></i>
                                 </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <button id="deleteServiceBtn" class="text-red-500 hover:text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
                    <div class="flex gap-3">
                        <button id="cancelModalBtn" class="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                        <button id="saveServiceBtn" class="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">Save Service</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recurring Service Modal -->
        <div id="recurringServiceModalOverlay" class="fixed inset-0 z-[1200] hidden flex-col justify-center items-center backdrop-blur-sm bg-black/40">
            <div id="recurringServiceModalContent" class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                <!-- Header -->
                <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white z-10">
                    <h3 class="text-xl font-bold text-gray-800">Weekly Schedule Builder</h3>
                    <button id="closeRecurringServiceModalBtn" class="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">&times;</button>
                </div>
                
                <div class="flex-grow overflow-y-auto p-6 bg-gray-50">
                    <!-- Template Builder -->
                    <div class="mb-8 p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
                        <div class="flex items-center gap-2 mb-4">
                            <i class="fas fa-magic text-purple-500"></i>
                            <h4 class="text-sm font-bold text-gray-500 uppercase tracking-wider">Service Template</h4>
                        </div>
                        
                        <div id="addMultiDayFormContent" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4"> 
                                <div class="col-span-2 lg:col-span-2">
                                    <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Service Type</label>
                                    <select id="multiDayServiceType" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white">
                                        <option value="Self-Care Activities/Social and Community Access">Self-Care/Social Access</option>
                                        <option value="Night-Time Sleepover">Night Sleepover</option>
                                        <option value="House Cleaning">House Cleaning</option>
                                        <option value="Increased Social and Community Access">Increased Social Access</option>
                                        <option value="Yard Maintenance">Yard Maintenance</option>
                                        <option value="Travel">Travel</option>
                                    </select>
                                </div>
                                <div><label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Start</label><input type="time" id="multiDayStartTime" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" step="900"></div>
                                <div><label class="block text-xs font-semibold text-gray-500 uppercase mb-1">End</label><input type="time" id="multiDayEndTime" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" step="900"></div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Frequency</label>
                                    <select id="multiDayFrequency" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                                        <option value="weekly" selected>Weekly</option>
                                        <option value="fortnightly">Fortnightly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                                
                                <!-- Toggleable KM vs Ratio -->
                                <div id="multiDayRatioGroup">
                                    <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Ratio</label>
                                    <select id="multiDayRatio" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                                        ${[1,2,3,4,5,6,7].map(n => `<option value="${n}">1:${n}</option>`).join('')}
                                        <option value="0.5">2:1</option>
                                    </select>
                                </div>
                                <div id="multiDayKmGroup" class="hidden">
                                     <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">KM</label>
                                     <input type="number" id="multiDayKm" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" placeholder="0" step="0.1">
                                </div>

                                <div><label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Rate ($)</label><input type="text" id="multiDayRate" class="currency-input w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" placeholder="Auto"></div>
                            </div>
                            
                            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <label class="block text-xs font-semibold text-gray-500 uppercase mb-3">Apply to Days</label>
                                <div id="multiDaySelector" class="flex flex-wrap gap-4 mb-4">
                                    ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => `
                                        <label class="inline-flex items-center cursor-pointer p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 transition-colors">
                                            <input type="checkbox" class="form-checkbox h-4 w-4 text-blue-600 rounded day-checkbox" value="${d}"> 
                                            <span class="ml-2 text-sm font-medium text-gray-700">${d}</span>
                                        </label>
                                    `).join('')}
                                </div>
                                <div class="flex flex-wrap gap-2 items-center justify-between">
                                    <div class="flex gap-2">
                                        <button id="selectWeekdaysBtn" class="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">Weekdays</button>
                                        <button id="selectWeekendBtn" class="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">Weekend</button>
                                        <button id="selectAllDaysBtn" class="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">All</button>
                                    </div>
                                    <div class="flex gap-3">
                                        <button id="resetMultiDayFormBtn" class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">Reset</button>
                                        <button id="addMultiDayScheduleBtn" class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"><i class="fas fa-plus mr-2"></i>Add to Schedule</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Weekly Table Card -->
                    <div class="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
                        <div class="flex justify-between items-center mb-4">
                            <div class="flex items-center gap-2">
                                <i class="far fa-calendar-alt text-blue-500"></i>
                                <h4 class="text-sm font-bold text-gray-500 uppercase tracking-wider">Visual Schedule</h4>
                            </div>
                            <button id="clearAllWeeklySlotsBtn" class="text-xs text-red-500 hover:text-red-700 font-medium border border-red-100 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">Clear All</button>
                        </div>
                        
                        <div class="overflow-x-auto rounded-xl border border-gray-200 shadow-inner bg-white mb-2">
                            <table id="weeklyScheduleTable" class="w-full"></table>
                        </div>
                        <p class="text-xs text-center text-gray-400">Click and drag to select time ranges. Click existing blocks to edit.</p>
                        
                        <!-- NEW WEEKLY SUMMARY SECTION -->
                        <div id="weeklySummaryContainer" class="mt-8 pt-6 border-t border-gray-100" style="display:none;">
                            <h4 class="text-sm font-bold text-gray-800 mb-4">Est. Weekly Hours</h4>
                            <div class="overflow-hidden rounded-xl border border-gray-200">
                                <table class="min-w-full text-sm">
                                    <thead class="bg-gray-50 text-gray-600 font-medium">
                                        <tr class="text-left border-b border-gray-200">
                                            <th class="py-3 px-4">Pattern</th>
                                            <th class="py-3 px-4">Time</th>
                                            <th class="py-3 px-4">Daily Hrs</th>
                                            <th class="py-3 px-4 text-right">Weekly Total</th>
                                        </tr>
                                    </thead>
                                    <tbody id="weeklySummaryBody" class="divide-y divide-gray-100 bg-white"></tbody>
                                    <tfoot>
                                        <tr class="font-bold bg-gray-50 text-gray-800">
                                            <td colspan="3" class="py-3 px-4 text-right">TOTAL:</td>
                                            <td id="weeklySummaryTotal" class="py-3 px-4 text-right text-blue-600">0 Hrs/Wk</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
