import British from '../../achievements/british'
import {Title} from '../types'

const BritishTitle: Title = {
	type: 'title',
	id: 'british',
	name: "Bri'ish",
	requires: British.id,
}

export default BritishTitle
