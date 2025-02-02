import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {RowEntity} from '../../entities'
import {GameModel} from '../../models/game-model'
import TFCDiscardedFromEffect from '../../status-effects/tfc-discarded-from'
import {beforeAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const TinFoilChefUltraRare: Hermit = {
	...hermit,
	id: 'tinfoilchef_ultra_rare',
	numericId: 47,
	name: 'TFC',
	expansion: 'default',
	rarity: 'ultra_rare',
	tokens: 3,
	type: ['miner'],
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

		const hasDiscardedFrom = (row: RowEntity): boolean => {
			return game.components.exists(
				StatusEffectComponent,
				query.effect.is(TFCDiscardedFromEffect),
				query.effect.targetIsCardAnd(query.card.rowEntity(row)),
				(_game, value) => value.creatorEntity === component.entity,
			)
		}

		let targetCardQuery = query.every(
			query.card.active,
			query.card.opponentPlayer,
			query.card.slot(query.slot.attach, query.not(query.slot.frozen)),
		)

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				if (opponentPlayer.activeRow === null) return
				// Can't discard two effect cards on the same hermit
				if (hasDiscardedFrom(opponentPlayer.activeRow.entity)) return
				if (!game.components.exists(CardComponent, targetCardQuery)) return

				const coinFlip = flipCoin(game, player, component)
				if (coinFlip[0] === 'tails') return

				game.components
					.new(StatusEffectComponent, TFCDiscardedFromEffect, component.entity)
					.apply(opponentPlayer.activeRow.getHermit()?.entity)

				game.components.find(CardComponent, targetCardQuery)?.discard()
			},
		)
	},
}

export default TinFoilChefUltraRare
