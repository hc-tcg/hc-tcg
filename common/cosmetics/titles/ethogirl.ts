import Ethogirl from '../../achievements/ethogirl'
import {Cosmetic} from '../types'

const EthogirlTitle: Cosmetic = {
	type: 'title',
	id: 'ethogirl',
	name: 'Ethogirl',
	requires: Ethogirl.id,
}

export default EthogirlTitle
