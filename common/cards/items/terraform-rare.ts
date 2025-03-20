import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const TerraformDoubleItem: Item = {
	...item,
	id: 'item_terraform_rare',
	numericId: 0.041,
	name: 'Terraform Item x2',
	shortName: 'Terraform',
	description: 'Counts as 2 Terraform Item cards.',
	expansion: 'item',
	rarity: 'rare',
	tokens: 2,
	type: ['terraform'],
	energy: ['terraform', 'terraform'],
}

export default TerraformDoubleItem
