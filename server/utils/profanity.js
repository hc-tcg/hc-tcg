import filter from 'profanity-filter'
import seed from './profanity-seed.json' assert {type: 'json'}
filter.seed(seed)
filter.setReplacementMethod('stars')

export default (string) => filter.clean(string)
