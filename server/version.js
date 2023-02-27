import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import config from '../server-config.json' assert {type: 'json'}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const assetFiles = fs.readdirSync(
	path.join(__dirname, '..', config.clientPath, './assets')
)

const indexJs = assetFiles.filter(
	(name) => name.startsWith('index') && name.endsWith('.js')
)[0]

const hash = indexJs.replace(/^index-(\w+)\.js/i, '$1')

export default hash
