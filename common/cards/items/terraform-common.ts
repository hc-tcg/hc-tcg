import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const TerraformItem: Item = {
	...item,
	id: 'item_terraform_common',
	numericId: 0.04,
	name: 'Terraform Item',
	shortName: 'Terraform',
	expansion: 'item',
	rarity: 'common',
	tokens: 0,
	type: ['terraform'],
	energy: ['terraform'],
}

export default TerraformItem
