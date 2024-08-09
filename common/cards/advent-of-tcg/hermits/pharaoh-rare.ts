import {CardComponent} from '../../../components'
import {slot} from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import CardOld from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class PharaohRare extends CardOld {
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

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		const {player} = component
		let pickedRow: RowStateWithHermit | null = null

		// Pick the hermit to heal
		player.hooks.getAttackRequests.add(
			component,
			(activeInstance, hermitAttackType) => {
				// Make sure we are attacking
				if (activeInstance.entity !== component.entity) return

				// Only secondary attack
				if (hermitAttackType !== 'secondary') return

				const attacker = getActiveRow(player)?.hermitCard
				if (!attacker) return

				const coinFlip = flipCoin(player, attacker)

				if (coinFlip[0] === 'tails') return

				const pickCondition = slot.every(
					slot.hermit,
					slot.not(slot.active),
					slot.not(slot.empty),
					slot.not(slot.hasId(this.props.id)),
				)

				if (!game.someSlotFulfills(pickCondition)) return

				game.addPickRequest({
					player: player.entity,
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
			},
		)

		// Heals the afk hermit *before* we actually do damage
		player.hooks.onAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component)
			if (attack.id === attackId) return
			healHermit(pickedRow, attack.calculateDamage())
		})

		player.hooks.onTurnEnd.add(component, () => {
			pickedRow = null
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.getAttackRequests.remove(component)
		player.hooks.onAttack.remove(component)
		player.hooks.onTurnEnd.remove(component)
	}
}

export default PharaohRare
