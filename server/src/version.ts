import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import {CONFIG} from 'common/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let hash: string | null = null

const assetsPath = path.join(
	__dirname,
	'../..',
	CONFIG.server.clientPath,
	'./assets',
)
if (fs.existsSync(assetsPath)) {
	const assetFiles = fs.readdirSync(assetsPath)

	const indexJs = assetFiles.filter(
		(name) => name.startsWith('index') && name.endsWith('.js'),
	)[0]

	hash = indexJs.replace(/^index-(\w+)\.js/i, '$1')
}

export default hash
