import { Achievement } from "./types"

const achievementClasses: Array<Achievement> = [
    
]

export const ACHIEVEMENTS: Record<string | number, Achievement> = achievementClasses.reduce(
    (result: Record<string | number, Achievement>, achievement) => {
        result[achievement.numericId] = achievement
        return result
    },
    {},
)

export const ACHIEVEMENTS_LIST = achievementClasses