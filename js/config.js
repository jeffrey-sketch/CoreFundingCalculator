// Rate Change Date
const rateChangeDate = new Date("2025-07-01T00:00:00");

// Pre-2025 Rates
const ratesPre20250701 = {
    "Self-Care Activities/Social and Community Access": {
        "Mon-Fri-Night": { startHour: 0, endHour: 6, rate: 75.82 },
        "Mon-Fri-Day": { startHour: 6, endHour: 20, rate: 67.56 },
        "Mon-Fri-Evening": { startHour: 20, endHour: 24, rate: 74.44 },
        "Sat": { startHour: 0, endHour: 24, rate: 95.07 },
        "Sun": { startHour: 0, endHour: 24, rate: 122.59 },
        "Public Holiday": { startHour: 0, endHour: 24, rate: 150.10 }
    },
    "Night-Time Sleepover": { "Any": { rate: 286.56, unit: "night" } },
    "House Cleaning": { "Any": { rate: 56.23, unit: "hour" } },
    "Increased Social and Community Access": { "Any": { rate: 77.00, unit: "hour" } },
    "Yard Maintenance": { "Any": { rate: 55.21, unit: "hour" } }
};

// Post-2025 Rates
const ratesPost20250701 = {
    "Self-Care Activities/Social and Community Access": {
        "Mon-Fri-Night": { startHour: 0, endHour: 6, rate: 78.81 },
        "Mon-Fri-Day": { startHour: 6, endHour: 20, rate: 70.23 },
        "Mon-Fri-Evening": { startHour: 20, endHour: 24, rate: 77.38 },
        "Sat": { startHour: 0, endHour: 24, rate: 98.83 },
        "Sun": { startHour: 0, endHour: 24, rate: 127.43 },
        "Public Holiday": { startHour: 0, endHour: 24, rate: 156.03 }
    },
    "Night-Time Sleepover": { "Any": { rate: 297.60, unit: "night" } },
    "House Cleaning": { "Any": { rate: 58.03, unit: "hour" } },
    "Increased Social and Community Access": { "Any": { rate: 80.06, unit: "hour" } },
    "Yard Maintenance": { "Any": { rate: 56.98, unit: "hour" } }
};

// Holidays
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
    "Self-Care Activities/Social and Community Access": "Self-Care/Social",
    "Night-Time Sleepover": "Night Sleepover",
    "House Cleaning": "House Cleaning",
    "Increased Social and Community Access": "Increased Social",
    "Yard Maintenance": "Yard Maintenance"
};

// Colors
const serviceTypeColors = {
    "Self-Care Activities/Social and Community Access": "bg-blue-500",
    "Night-Time Sleepover": "bg-indigo-500",
    "House Cleaning": "bg-green-500",
    "Increased Social and Community Access": "bg-purple-500",
    "Yard Maintenance": "bg-yellow-500",
    "Transport": "bg-gray-500",
    "Consumable": "bg-gray-500"
};

// The Main Application State
const appState = {
    calcPeriods: [],
    weeklyScheduleSlots: [],
    allServiceInstances: [],
    manualServices: [],
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