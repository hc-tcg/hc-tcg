import Card from '../../base/card'
import {Description, Item} from '../../base/types'
import {item} from '../../base/defaults'

class TerraformDoubleItem extends Card {
	props: Item & Description = {
		...item,
		id: 'item_terraform_rare',
		numericId: 68,
		name: 'Terraform Item x2',
		shortName: 'Terraform',
		description: 'Counts as 2 Terraform Item cards.',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'terraform',
		energy: ['terraform', 'terraform'],
	}
}

export default TerraformDoubleItem
