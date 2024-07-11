import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/components'
import Card, {Item} from '../../base/card'
import {item} from '../../base/defaults'

class TerraformCommonItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_terraform_common',
		numericId: 67,
		name: 'Terraform Item',
		shortName: 'Terraform',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'terraform',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type]
	}
}

export default TerraformCommonItemCard
