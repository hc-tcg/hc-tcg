import {CARDS} from './card-plugins'

const cardMap = CARDS.reduce((result, card) => {
	result[card.id] = card
	return result
}, {})

export default cardMap
