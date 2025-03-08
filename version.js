import {execSync} from 'child_process'

export function getAppVersion() {
	return "1000"
	if (process.env.APP_VERSION !== undefined) {
		return process.env.APP_VERSION
	}
	return execSync('git rev-parse --short HEAD').toString().trim()
}
