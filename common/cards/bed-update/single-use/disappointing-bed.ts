import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {beforeAttack, onTurnEnd} from '../../../types/priorities'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const DisappointingBed: SingleUse = {
	...singleUse,
	id: 'disappointing_bed',
	numericId: 274,
	name: 'Disappointing Bed',
	expansion: 'beds',
	rarity: 'ultra_rare',
	tokens: 0,
	description:
		"Swap the health of your and your opponent's active hermit. Before attacking or ending your turn, swap them back.",
	showConfirmationModal: true,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		let playerActiveRow = player.activeRow
		let opponentActiveRow = opponentPlayer.activeRow

		let swappedBack = false

		observer.subscribe(player.hooks.onApply, () => {
			if (!playerActiveRow || !opponentActiveRow) return
			if (!playerActiveRow.health || !opponentActiveRow.health) return
			let placeholder = playerActiveRow.health
			playerActiveRow.health = opponentActiveRow.health
			opponentActiveRow.health = placeholder
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.REACT_TO_DAMAGE,
			() => {
				if (!playerActiveRow || !opponentActiveRow) return
				if (!playerActiveRow.health || !opponentActiveRow.health) return
				let placeholder = playerActiveRow.health
				playerActiveRow.health = opponentActiveRow.health
				opponentActiveRow.health = placeholder
				swappedBack = true
			},
		)

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (swappedBack) return
				if (!playerActiveRow || !opponentActiveRow) return
				if (!playerActiveRow.health || !opponentActiveRow.health) return
				let placeholder = playerActiveRow.health
				playerActiveRow.health = opponentActiveRow.health
				opponentActiveRow.health = placeholder
			},
		)
	},
}

export default DisappointingBed
