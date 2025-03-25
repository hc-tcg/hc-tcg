import {AchievementProgress} from 'common/types/achievements'
import root from 'serverRoot'
import {z} from 'zod'

export const ApiKeyHeader = z.object({
	auth: z.string(),
})

export async function authenticateApiKey(key: string) {
	const body = await root.db.authenticateApiKey(key)
	if (body.type !== 'success' || body.body === false) {
		throw new Error('Authentication failed')
	}
}

export async function authenticateUser(
	userId: string | undefined,
	secret: string | undefined,
	savedAchievements: string | undefined,
): Promise<[number, any]> {
	if (!userId || !secret) {
		return [
			400,
			{error: 'Both a User ID and Secret are required to authorize a user.'},
		]
	}

	if (!root.db.connected) {
		return [
			500,
			{
				error: 'Endpoint is unavailable because database is disabled',
			},
		]
	}

	const userInfo = await root.db.authenticateUser(userId, secret)

	if (userInfo.type === 'failure') {
		return [401, 'Authentication information is not valid']
	}

	if (userInfo.body.banned) {
		return [401, 'You are banned']
	}

	if (!savedAchievements) return [200, userInfo.body]

	const achievements = userInfo.body.achievements

	const newAchievements: AchievementProgress = {}

	Object.entries(achievements.achievementData).forEach((p) => {
		const k = p[0]
		const v = p[1]

		if (!(k in achievements)) newAchievements[Number(k)] = v
	})

	userInfo.body.achievements = {achievementData: newAchievements}

	return [200, userInfo.body]
}

export async function createUser(
	username: string | undefined,
): Promise<[number, any]> {
	if (!username) {
		return [400, {error: 'A username is required to create a user.'}]
	}

	if (!root.db.connected) {
		return [
			500,
			{
				error: 'Endpoint is unavailable because database is disabled',
			},
		]
	}

	const userInfo = await root.db.insertUser(username)

	if (userInfo.type === 'failure') {
		return [401, 'Authentication information is not valid']
	}

	return [200, userInfo.body]
}
