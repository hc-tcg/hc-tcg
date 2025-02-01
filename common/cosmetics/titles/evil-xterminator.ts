import DefeatEvilX from '../../achievements/defeat-evil-x'
import {Title} from '../types'

const EvilXTerminatorTitle: Title = {
	type: 'title',
	id: 'evil_xterminator',
	name: 'Evil X-Terminator',
	requires: DefeatEvilX.id,
}

export default EvilXTerminatorTitle
