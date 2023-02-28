import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import {CONFIG} from '../config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let hash = null

const assetsPath = path.join(__dirname, '..', CONFIG.clientPath, './assets')
if (fs.existsSync(assetsPath)) {
	const assetFiles = fs.readdirSync(assetsPath)

	const indexJs = assetFiles.filter(
		(name) => name.startsWith('index') && name.endsWith('.js')
	)[0]

	hash = indexJs.replace(/^index-(\w+)\.js/i, '$1')
}

export default hash
