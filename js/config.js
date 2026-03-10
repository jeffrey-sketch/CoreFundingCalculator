// Rate Change Date
const rateChangeDate = new Date("2025-07-01T00:00:00");

// Pre-2025 Rates (Split Self-Care and Social)
const ratesPre20250701 = {
    "Self-Care Activities": {
        "Mon-Fri-Night": { startHour: 0, endHour: 6, rate: 75.82, rateRemote: 106.15, rateVeryRemote: 113.73 },
        "Mon-Fri-Day": { startHour: 6, endHour: 20, rate: 67.56, rateRemote: 94.58, rateVeryRemote: 101.34 },
        "Mon-Fri-Evening": { startHour: 20, endHour: 24, rate: 74.44, rateRemote: 104.22, rateVeryRemote: 111.66 },
        "Sat": { startHour: 0, endHour: 24, rate: 95.07, rateRemote: 133.10, rateVeryRemote: 142.61 },
        "Sun": { startHour: 0, endHour: 24, rate: 122.59, rateRemote: 171.63, rateVeryRemote: 183.89 },
        "Public Holiday": { startHour: 0, endHour: 24, rate: 150.10, rateRemote: 210.14, rateVeryRemote: 225.15 }
    },
    "Social and Community Access": {
        "Mon-Fri-Night": { startHour: 0, endHour: 6, rate: 75.82, rateRemote: 106.15, rateVeryRemote: 113.73 },
        "Mon-Fri-Day": { startHour: 6, endHour: 20, rate: 67.56, rateRemote: 94.58, rateVeryRemote: 101.34 },
        "Mon-Fri-Evening": { startHour: 20, endHour: 24, rate: 74.44, rateRemote: 104.22, rateVeryRemote: 111.66 },
        "Sat": { startHour: 0, endHour: 24, rate: 95.07, rateRemote: 133.10, rateVeryRemote: 142.61 },
        "Sun": { startHour: 0, endHour: 24, rate: 122.59, rateRemote: 171.63, rateVeryRemote: 183.89 },
        "Public Holiday": { startHour: 0, endHour: 24, rate: 150.10, rateRemote: 210.14, rateVeryRemote: 225.15 }
    },
    "Night-Time Sleepover": { "Any": { rate: 286.56, rateRemote: 401.18, rateVeryRemote: 429.84, unit: "night" } },
    "House Cleaning": { "Any": { rate: 56.23, rateRemote: 78.72, rateVeryRemote: 84.35, unit: "hour" } },
    "Increased Social and Community Access": { "Any": { rate: 77.00, rateRemote: 107.80, rateVeryRemote: 115.50, unit: "hour" } },
    "Yard Maintenance": { "Any": { rate: 55.21, rateRemote: 77.29, rateVeryRemote: 82.82, unit: "hour" } },
    "Travel": { "Any": { rate: 1.00, rateRemote: 1.00, rateVeryRemote: 1.00, unit: "km" } },
    // Retain legacy combined string just in case old save files request it for lookups
    "Self-Care Activities/Social and Community Access": {
        "Mon-Fri-Night": { startHour: 0, endHour: 6, rate: 75.82, rateRemote: 106.15, rateVeryRemote: 113.73 },
        "Mon-Fri-Day": { startHour: 6, endHour: 20, rate: 67.56, rateRemote: 94.58, rateVeryRemote: 101.34 },
        "Mon-Fri-Evening": { startHour: 20, endHour: 24, rate: 74.44, rateRemote: 104.22, rateVeryRemote: 111.66 },
        "Sat": { startHour: 0, endHour: 24, rate: 95.07, rateRemote: 133.10, rateVeryRemote: 142.61 },
        "Sun": { startHour: 0, endHour: 24, rate: 122.59, rateRemote: 171.63, rateVeryRemote: 183.89 },
        "Public Holiday": { startHour: 0, endHour: 24, rate: 150.10, rateRemote: 210.14, rateVeryRemote: 225.15 }
    }
};

// Post-2025 Rates (Split Self-Care and Social)
const ratesPost20250701 = {
    "Self-Care Activities": {
        "Mon-Fri-Night": { startHour: 0, endHour: 6, rate: 78.81, rateRemote: 110.33, rateVeryRemote: 118.22 },
        "Mon-Fri-Day": { startHour: 6, endHour: 20, rate: 70.23, rateRemote: 98.32, rateVeryRemote: 105.35 },
        "Mon-Fri-Evening": { startHour: 20, endHour: 24, rate: 77.38, rateRemote: 108.33, rateVeryRemote: 116.07 },
        "Sat": { startHour: 0, endHour: 24, rate: 98.83, rateRemote: 138.36, rateVeryRemote: 148.25 },
        "Sun": { startHour: 0, endHour: 24, rate: 127.43, rateRemote: 178.40, rateVeryRemote: 191.15 },
        "Public Holiday": { startHour: 0, endHour: 24, rate: 156.03, rateRemote: 218.44, rateVeryRemote: 234.05 }
    },
    "Social and Community Access": {
        "Mon-Fri-Night": { startHour: 0, endHour: 6, rate: 78.81, rateRemote: 110.33, rateVeryRemote: 118.22 },
        "Mon-Fri-Day": { startHour: 6, endHour: 20, rate: 70.23, rateRemote: 98.32, rateVeryRemote: 105.35 },
        "Mon-Fri-Evening": { startHour: 20, endHour: 24, rate: 77.38, rateRemote: 108.33, rateVeryRemote: 116.07 },
        "Sat": { startHour: 0, endHour: 24, rate: 98.83, rateRemote: 138.36, rateVeryRemote: 148.25 },
        "Sun": { startHour: 0, endHour: 24, rate: 127.43, rateRemote: 178.40, rateVeryRemote: 191.15 },
        "Public Holiday": { startHour: 0, endHour: 24, rate: 156.03, rateRemote: 218.44, rateVeryRemote: 234.05 }
    },
    "Night-Time Sleepover": { "Any": { rate: 297.60, rateRemote: 416.64, rateVeryRemote: 446.40, unit: "night" } },
    "House Cleaning": { "Any": { rate: 58.03, rateRemote: 81.24, rateVeryRemote: 87.05, unit: "hour" } },
    "Increased Social and Community Access": { "Any": { rate: 80.06, rateRemote: 112.08, rateVeryRemote: 120.09, unit: "hour" } },
    "Yard Maintenance": { "Any": { rate: 56.98, rateRemote: 79.77, rateVeryRemote: 85.47, unit: "hour" } },
    "Travel": { "Any": { rate: 1.00, rateRemote: 1.00, rateVeryRemote: 1.00, unit: "km" } },
    // Retain legacy combined string
    "Self-Care Activities/Social and Community Access": {
        "Mon-Fri-Night": { startHour: 0, endHour: 6, rate: 78.81, rateRemote: 110.33, rateVeryRemote: 118.22 },
        "Mon-Fri-Day": { startHour: 6, endHour: 20, rate: 70.23, rateRemote: 98.32, rateVeryRemote: 105.35 },
        "Mon-Fri-Evening": { startHour: 20, endHour: 24, rate: 77.38, rateRemote: 108.33, rateVeryRemote: 116.07 },
        "Sat": { startHour: 0, endHour: 24, rate: 98.83, rateRemote: 138.36, rateVeryRemote: 148.25 },
        "Sun": { startHour: 0, endHour: 24, rate: 127.43, rateRemote: 178.40, rateVeryRemote: 191.15 },
        "Public Holiday": { startHour: 0, endHour: 24, rate: 156.03, rateRemote: 218.44, rateVeryRemote: 234.05 }
    }
};

// Holidays (Fallback)
const holidaysByYear = {
    "2024": ["2024-01-01", "2024-01-26", "2024-03-11", "2024-03-29", "2024-03-30", "2024-03-31", "2024-04-01", "2024-04-25", "2024-06-10", "2024-09-27", "2024-11-05", "2024-12-25", "2024-12-26"],
    "2025": ["2025-01-01", "2025-01-27", "2025-03-10", "2025-04-18", "2025-04-19", "2025-04-20", "2025-04-21", "2025-04-25", "2025-06-09", "2025-09-26", "2025-11-04", "2025-12-25", "2025-12-26"],
    "2026": ["2026-01-01", "2026-01-26", "2026-03-09", "2026-04-03", "2026-04-04", "2026-04-05", "2026-04-06", "2026-04-25", "2026-06-08", "2026-09-25", "2026-11-03", "2026-12-25", "2026-12-26"],
    "2027": [
        "2027-01-01", "2027-01-26", "2027-03-08", "2027-03-26", "2027-03-27", "2027-03-28", "2027-03-29",
        "2027-04-25", "2027-06-14", "2027-09-24", "2027-11-02", "2027-12-25", "2027-12-26", "2027-12-27", "2027-12-28"
    ],
    "2028": [
        "2028-01-01", "2028-01-03", "2028-01-26", "2028-03-13", "2028-04-14", "2028-04-15", "2028-04-16",
        "2028-04-17", "2028-04-25", "2028-06-12", "2028-09-29", "2028-11-07", "2028-12-25", "2028-12-26"
    ]
};

const calcAllPublicHolidays = [
    ...(holidaysByYear[2024] || []),
    ...(holidaysByYear[2025] || []),
    ...(holidaysByYear[2026] || []),
    ...(holidaysByYear[2027] || []),
    ...(holidaysByYear[2028] || [])
];

// Service Types
const serviceTypeMap = {
    "Self-Care Activities": "Self-Care",
    "Social and Community Access": "Social Access",
    "Self-Care Activities/Social and Community Access": "Self-Care/Social", // Retained for backwards compatibility on loading
    "Night-Time Sleepover": "Night Sleepover",
    "House Cleaning": "House Cleaning",
    "Increased Social and Community Access": "Increased Social",
    "Yard Maintenance": "Yard Maintenance",
    "Travel": "Travel"
};

// Colors
const serviceTypeColors = {
    "Self-Care Activities": "bg-blue-500",
    "Social and Community Access": "bg-cyan-500",
    "Self-Care Activities/Social and Community Access": "bg-blue-500",
    "Night-Time Sleepover": "bg-indigo-500",
    "House Cleaning": "bg-green-500",
    "Increased Social and Community Access": "bg-purple-500",
    "Yard Maintenance": "bg-yellow-500",
    "Transport": "bg-gray-500",
    "Consumable": "bg-gray-500",
    "Travel": "bg-orange-500"
};

// The Main Application State
const appState = {
    calcPeriods: [],
    weeklyScheduleSlots: [],
    allServiceInstances: [],
    manualServices: [],
    importedHolidays: [], 
    selectedState: 'VIC', 
    remoteness: 'National',
    categoryBudgets: {}, // Store sub-budgets
    nextWeeklySlotId: 0,
    nextManualServiceId: 0,
    isDragging: false,
    dragStartCell: null,
    isDraggingDaily: false,
    dragStartCellDaily: null,
    serviceLogSort: { column: 'date', order: 'asc' },
    calendarDate: new Date(),
    selectedDateStr: null
};