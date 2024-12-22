import query from '../../../components/query'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const Feather: SingleUse = {
	...singleUse,
	id: 'feather',
	numericId: 199,
	name: 'Feather',
	expansion: 'minecraft',
	rarity: 'common',
	tokens: 0,
	description: 'Completely useless!\nNot allowed to be put in decks on its own',
	attachCondition: query.nothing,
}

export default Feather
