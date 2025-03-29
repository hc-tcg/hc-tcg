import {RowComponent} from '../../../components'
import {afterApply} from '../../../types/priorities'
import { fisherYatesShuffle } from '../../../utils/fisher-yates'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const ConfusingBed: SingleUse = {
	...singleUse,
	id: 'confusing_bed',
	name: 'Confusing Bed',
	expansion: 'default',
	numericId: 269,
	rarity: 'ultra_rare',
	tokens: 2,
	description: "Shuffle your board rows.",
	showConfirmationModal: true,
	onAttach(game, component, observer) {
		const {player} = component

		observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.CHECK_BOARD_STATE,
			() => {
                const shuffledRows = fisherYatesShuffle([0, 1, 2, 3, 4], game.rng)
				game.components.filter(RowComponent).forEach((row) => {
					if (row.playerId !== player.entity) return
                    row.index = shuffledRows[row.index]
				})
			},
		)
	},
}

export default ConfusingBed
