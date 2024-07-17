import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {RowEntity} from '../../../entities'

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

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		let hasDiscardedFrom = new Set<RowEntity>()

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			if (opponentPlayer.activeRow === null) return
			if (
				!game.components.exists(
					SlotComponent,
					query.slot.opponent,
					query.slot.attachSlot,
					query.not(query.slot.frozen)
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
					query.card.active,
					query.card.opponentPlayer,
					query.card.slot(query.slot.attachSlot, query.not(query.slot.frozen))
				)
				?.discard()
		})
	}
}

export default TinFoilChefUltraRare
