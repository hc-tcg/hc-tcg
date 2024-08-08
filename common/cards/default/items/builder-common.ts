import CardOld from '../../base/card'
import {item} from '../../base/defaults'
import {Item} from '../../base/types'

class BuilderItem extends CardOld {
	props: Item = {
		...item,
		id: 'item_builder_common',
		numericId: 51,
		name: 'Builder Item',
		shortName: 'Builder',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'builder',
		energy: ['builder'],
	}
}

export default BuilderItem
