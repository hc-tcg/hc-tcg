import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import Card, {Item, item} from '../../base/card'

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

	override getEnergy(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		return [this.props.type]
	}
}

export default TerraformCommonItemCard
