import Ethogirl from '../../achievements/ethogirl'
import {Title} from '../types'

const EthogirlTitle: Title = {
	type: 'title',
	id: 'ethogirl',
	name: 'Ethogirl',
	requires: {achievement: Ethogirl.id, level: 0},
}

export default EthogirlTitle
