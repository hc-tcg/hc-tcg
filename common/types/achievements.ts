export type AchievementProgress = Record<number, ProgressionEntry>

export type ProgressionEntry = {
	goals: Record<number, Array<number>>
	completionTime?: Date
}
