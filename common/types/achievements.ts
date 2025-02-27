export type AchievementProgress = Record<number, ProgressionEntry>

export type ProgressionEntry = {
	goals: Record<number, number>
	levels: Array<{
		completionTime?: Date
	}>
}

export type EarnedAchievement = {
	achievementId: number
	level: {
		name: string
		description: string
		steps: number
	}
	originalProgress: number
	newProgress: number
}
