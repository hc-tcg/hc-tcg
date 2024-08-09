import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {RowEntity} from '../../../entities'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const TinFoilChefUltraRare: Hermit = {
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
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		let hasDiscardedFrom = new Set<RowEntity>()

		let targetCardQuery = query.every(
			query.card.active,
			query.card.opponentPlayer,
			query.card.slot(query.slot.attach, query.not(query.slot.frozen)),
		)

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return

			if (opponentPlayer.activeRow === null) return
			// Can't discard two effect cards on the same hermit
			if (hasDiscardedFrom.has(opponentPlayer.activeRow.entity)) return
			if (!game.components.exists(CardComponent, targetCardQuery)) return

			const coinFlip = flipCoin(player, component)
			if (coinFlip[0] === 'tails') return

			hasDiscardedFrom.add(opponentPlayer.activeRow.entity)

			game.components.find(CardComponent, targetCardQuery)?.discard()
		})
	},
}

export default TinFoilChefUltraRare
