import {execSync} from 'child_process'

export function getVersion() {
	if (process.env.VERSION !== undefined) {
		return process.env.VERSION
	}
	return execSync('git rev-parse --short HEAD').toString().trim()
}
