import {createRequire} from 'module'
import seed from '../config/profanity-seed.json' assert {type: 'json'}

const require = createRequire(import.meta.url)

let filter = require('profanity-filter')
filter.seed(seed)
filter.setReplacementMethod('stars')

export default (string: string) => filter.clean(string)
