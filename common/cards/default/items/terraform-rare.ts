import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card, {Item} from '../../base/card'
import {item} from '../../base/defaults'

class TerraformRareItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_terraform_rare',
		numericId: 68,
		name: 'Terraform Item x2',
		shortName: 'Terraform',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'terraform',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type, this.props.type]
	}
}

export default TerraformRareItemCard
