import {CardComponent} from '../../../components'
import {slot} from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import CardOld from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class GrianchRare extends CardOld {
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

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		const {player, opponentPlayer} = pos
		const componentKey = this.getInstanceKey(component)

		player.hooks.onAttack.add(component, (attack) => {
			const attacker = attack.getAttacker()
			if (
				attack.id !== componentKey ||
				attack.type !== 'secondary' ||
				!attacker
			)
				return

			const coinFlip = flipCoin(game, player, attacker.row.hermitCard)

			if (coinFlip[0] === 'tails') {
				opponentPlayer.hooks.afterAttack.add(component, (_attack) => {
					game.removeCompletedActions(
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'SINGLE_USE_ATTACK',
					)
					opponentPlayer.hooks.afterAttack.remove(component)
				})
				return
			}

			attack.addDamage(this.props.id, this.props.secondary.damage)
		})

		player.hooks.afterAttack.add(component, (attack) => {
			if (attack.id !== componentKey || attack.type !== 'primary') return

			const pickCondition = slot.every(
				slot.not(slot.active),
				slot.not(slot.empty),
				slot.hermit,
			)

			if (!game.someSlotFulfills(pickCondition)) return

			game.addPickRequest({
				player: player.entity,
				id: this.props.id,
				message: 'Pick an AFK Hermit from either side of the board',
				canPick: pickCondition,
				onResult(pickedSlot) {
					healHermit(pickedSlot.rowId, 40)
				},
			})
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onAttack.remove(component)
		player.hooks.afterAttack.remove(component)
	}
}

export default GrianchRare
