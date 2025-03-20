import {item} from '../defaults'
import {Item} from '../types'

const TerraformItem: Item = {
	...item,
	id: 'item_terraform_common',
	numericId: 67,
	name: 'Terraform Item',
	shortName: 'Terraform',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'terraform',
	energy: ['terraform'],
}

export default TerraformItem
