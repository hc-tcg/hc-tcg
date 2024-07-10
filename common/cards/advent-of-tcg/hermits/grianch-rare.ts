import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {flipCoin} from '../../../utils/coinFlips'
import {slot} from '../../../filters'
import Card, {Hermit, hermit} from '../../base/card'
import {CardComponent} from '../../../types/game-state'

class GrianchRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'grianch_rare',
		numericId: 209,
		name: 'The Grianch',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 3,
		type: 'builder',
		health: 250,
		primary: {
			name: 'Nice',
			cost: ['builder', 'any'],
			damage: 70,
			power: 'Heal any AFK Hermit for 40hp.',
		},
		secondary: {
			name: 'Naughty',
			cost: ['builder', 'builder'],
			damage: 80,
			power:
				'Flip a Coin.\nIf heads, attack damage doubles.\nIf tails, your opponent may attack twice next round.',
		},
	}

	override onAttach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack.add(instance, (attack) => {
			const attacker = attack.getAttacker()
			if (attack.id !== instanceKey || attack.type !== 'secondary' || !attacker) return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)

			if (coinFlip[0] === 'tails') {
				opponentPlayer.hooks.afterAttack.add(instance, (attack) => {
					game.removeCompletedActions('PRIMARY_ATTACK', 'SECONDARY_ATTACK', 'SINGLE_USE_ATTACK')
					opponentPlayer.hooks.afterAttack.remove(instance)
				})
				return
			}

			attack.addDamage(this.props.id, this.props.secondary.damage)
		})

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'primary') return

			const pickCondition = slot.every(
				slot.not(slot.activeRow),
				slot.not(slot.empty),
				slot.hermitSlot
			)

			if (!game.someSlotFulfills(pickCondition)) return

			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: 'Pick an AFK Hermit from either side of the board',
				canPick: pickCondition,
				onResult(pickedSlot) {
					healHermit(pickedSlot.rowId, 40)
				},
			})
		})
	}

	override onDetach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
	}
}

export default GrianchRareHermitCard
