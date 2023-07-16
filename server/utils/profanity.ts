import {createRequire} from 'module'
const require = createRequire(import.meta.url)

let filter = require('profanity-filter')
import seed from './profanity-seed.json' assert {type: 'json'}
filter.seed(seed)
filter.setReplacementMethod('stars')

export default (string: string) => filter.clean(string)
