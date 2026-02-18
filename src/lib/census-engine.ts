/**
 * Census Engine — Rotaflow
 * Translates live bed occupancy into required nurse headcount using
 * evidence-based nurse-to-patient ratios.
 */

// Nurse-to-patient ratios per acuity level
// Key = acuity level (1–5), Value = patients per nurse
export const RATIOS: Record<number, number> = {
    1: 6, // Level 1a — Stable / Routine (6 patients per nurse)
    2: 5, // Level 1b — Moderate (5 patients per nurse)
    3: 3, // Level 1c — Complex / High Monitoring (3 patients per nurse)
    4: 2, // Level 2  — Critical / One-to-One (2 patients per nurse)
    5: 1, // Level 3  — Life Sustaining / ECMO (1 patient per nurse)
}

export const ACUITY_LABELS: Record<number, string> = {
    1: 'Stable / Routine',
    2: 'Moderate',
    3: 'Complex',
    4: 'Critical',
    5: 'Life Sustaining',
}

export const ACUITY_COLORS: Record<number, string> = {
    1: '#22c55e',  // green
    2: '#3b82f6',  // blue
    3: '#f59e0b',  // amber
    4: '#f97316',  // orange
    5: '#ef4444',  // red
}

/**
 * Given a count of patients at each acuity level, calculate
 * the total number of nurses required.
 */
export function calculateRequiredNurses(acuityCounts: Record<number, number>): number {
    return Object.entries(acuityCounts)
        .map(([acuity, count]) => Math.ceil(count / (RATIOS[Number(acuity)] ?? 6)))
        .reduce((a, b) => a + b, 0)
}

/**
 * Summarise a list of active bed assignments into acuity counts.
 */
export function groupByAcuity(assignments: { patientAcuity: number }[]): Record<number, number> {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const a of assignments) {
        const level = Math.min(5, Math.max(1, a.patientAcuity))
        counts[level] = (counts[level] || 0) + 1
    }
    return counts
}

/**
 * Full census snapshot for a given set of active assignments.
 */
export interface CensusSnapshot {
    totalOccupied: number
    acuityCounts: Record<number, number>
    requiredNurses: number
    acuityBreakdown: {
        level: number
        label: string
        count: number
        nursesNeeded: number
        color: string
    }[]
}

export function buildCensusSnapshot(assignments: { patientAcuity: number }[]): CensusSnapshot {
    const acuityCounts = groupByAcuity(assignments)
    const requiredNurses = calculateRequiredNurses(acuityCounts)

    const acuityBreakdown = [1, 2, 3, 4, 5].map(level => ({
        level,
        label: ACUITY_LABELS[level],
        count: acuityCounts[level] || 0,
        nursesNeeded: Math.ceil((acuityCounts[level] || 0) / RATIOS[level]),
        color: ACUITY_COLORS[level],
    }))

    return {
        totalOccupied: assignments.length,
        acuityCounts,
        requiredNurses,
        acuityBreakdown,
    }
}
