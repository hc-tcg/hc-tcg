export type AchievementProgress = Record<number, ProgressionEntry>

export type ProgressionEntry = {
	goals: Record<number, number>
	completionTime?: number
}
