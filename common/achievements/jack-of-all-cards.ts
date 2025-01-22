import {CARDS_LIST} from '../cards'
import {EXPANSIONS} from '../const/expansions'
import {achievement} from './defaults'
import {Achievement} from './types'

const AllCards: Achievement = {
	...achievement,
	id: 'all_cards',
	numericId: 0,
	name: 'Jack of all cards',
	description: 'Play every permenant card',
	steps: CARDS_LIST.filter(
		(card) =>
			EXPANSIONS[card.expansion].disabled === false &&
			[
				'default',
				'alter_egos',
				'alter_egos_ii',
				'season_x',
				'alter_egos_iii',
			].includes(card.expansion),
	).length,
}

export default AllCards