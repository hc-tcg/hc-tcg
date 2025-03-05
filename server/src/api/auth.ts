import root from 'serverRoot'

export async function authenticateUser(
	userId: string | undefined,
	secret: string | undefined,
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
