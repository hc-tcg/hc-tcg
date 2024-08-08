import CardOld from '../../base/card'
import {item} from '../../base/defaults'
import {Description, Item} from '../../base/types'

const TerraformDoubleItem: Item = {
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

export default TerraformDoubleItem
