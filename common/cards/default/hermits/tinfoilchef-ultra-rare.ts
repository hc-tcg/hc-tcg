import {GameModel} from '../../../models/game-model'
import {card, query, slot} from '../../../components/query'
import {CardComponent, SlotComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {RowEntity} from '../../../types/game-state'

class TinFoilChefUltraRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'tinfoilchef_ultra_rare',
		numericId: 99,
		name: 'TFC',
		expansion: 'default',
		rarity: 'ultra_rare',
		tokens: 2,
		type: 'miner',
		health: 300,
		primary: {
			name: 'Phone Call',
			cost: ['miner'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Take It Easy',
			cost: ['miner', 'miner', 'miner'],
			damage: 100,
			power:
				'Flip a coin.\nIf heads, your opponent must discard any effect card attached to their active Hermit.\nOnly one effect card per Hermit can be discarded using this ability.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component

		let hasDiscardedFrom = new Set<RowEntity>()

		player.hooks.beforeAttack.add(component, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			if (opponentPlayer.activeRow === null) return
			if (
				!game.components.exists(
					SlotComponent,
					slot.opponent,
					slot.attachSlot,
					query.not(slot.frozen)
				)
			)
				return

			// Can't discard two effect cards on the same hermit
			if (hasDiscardedFrom.has(opponentPlayer.activeRow.entity)) return

			const coinFlip = flipCoin(player, component)
			if (coinFlip[0] === 'tails') return

			hasDiscardedFrom.add(opponentPlayer.activeRow.entity)

			game.components
				.find(
					CardComponent,
					card.active,
					card.opponentPlayer,
					card.slot(slot.attachSlot, query.not(slot.frozen))
				)
				?.discard()
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.beforeAttack.remove(component)
	}
}

export default TinFoilChefUltraRare
