import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import {CardComponent, RowStateWithHermit, healHermit} from '../../../types/game-state'
import {getActiveRow} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import Card, {Hermit, hermit} from '../../base/card'

class PharaohRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'pharaoh_rare',
		numericId: 214,
		name: 'Pharaoh',
		expansion: 'advent_of_tcg',
		palette: 'pharoah',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 2,
		type: 'balanced',
		health: 300,
		primary: {
			name: 'Targét',
			cost: ['balanced'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Xibalba',
			cost: ['balanced', 'balanced'],
			damage: 80,
			power:
				'Flip a coin. If heads, can give up to 80hp to AFK Hermit. Health given is equal to damage during attack. Can not heal other Pharaohs.',
		},
	}

	override onAttach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player} = pos
		let pickedRow: RowStateWithHermit | null = null

		// Pick the hermit to heal
		player.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance.entity !== instance.entity) return

			// Only secondary attack
			if (hermitAttackType !== 'secondary') return

			const attacker = getActiveRow(player)?.hermitCard
			if (!attacker) return

			const coinFlip = flipCoin(player, attacker)

			if (coinFlip[0] === 'tails') return

			const pickCondition = slot.every(
				slot.hermitSlot,
				slot.not(slot.activeRow),
				slot.not(slot.empty),
				slot.not(slot.hasId(this.props.id))
			)

			if (!game.someSlotFulfills(pickCondition)) return

			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: 'Pick an AFK Hermit from either side of the board',
				canPick: pickCondition,
				onResult(pickedSlot) {
					pickedRow = pickedSlot.rowId as RowStateWithHermit
				},
				onTimeout() {
					// We didn't pick anyone to heal, so heal no one
				},
			})
		})

		// Heals the afk hermit *before* we actually do damage
		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id === attackId) return
			healHermit(pickedRow, attack.calculateDamage())
		})

		player.hooks.onTurnEnd.add(instance, () => {
			pickedRow = null
		})
	}

	override onDetach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player} = pos
		player.hooks.getAttackRequests.remove(instance)
		player.hooks.onAttack.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
	}
}

export default PharaohRareHermitCard
