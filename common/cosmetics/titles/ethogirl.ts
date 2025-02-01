import Ethogirl from '../../achievements/ethogirl'
import {Title} from '../types'

const EthogirlTitle: Title = {
	type: 'title',
	id: 'ethogirl',
	name: 'Ethogirl',
	requires: Ethogirl.id,
}

export default EthogirlTitle
