import Card from '../../base/card'
import {Item} from '../../base/types'
import {item} from '../../base/defaults'

class TerraformItem extends Card {
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
		energy: ['terraform'],
	}
}

export default TerraformItem
