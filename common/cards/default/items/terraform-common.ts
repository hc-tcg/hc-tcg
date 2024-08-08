import CardOld from '../../base/card'
import {item} from '../../base/defaults'
import {Item} from '../../base/types'

class TerraformItem extends CardOld {
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
