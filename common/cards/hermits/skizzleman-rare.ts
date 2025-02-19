import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {
	GasLightEffect,
	GasLightPotentialEffect,
} from '../../status-effects/gas-light'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const SkizzlemanRare: Hermit = {
	...hermit,
	id: 'skizzleman_rare',
	numericId: 172,
	name: 'Skizz',
	expansion: 'season_x',
	rarity: 'rare',
	tokens: 2,
	type: 'builder',
	health: 290,
	primary: {
		name: 'Hupper Cut ',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Gas Light',
		cost: ['builder', 'builder'],
		damage: 70,
		power:
			"After your attack, do an additional 20hp damage to each of your opponent's AFK Hermits that took damage during this turn.",
	},
	onCreate(game: GameModel, component: CardComponent) {
		const newObserver = game.components.new(ObserverComponent, component.entity)

		game.components.filter(PlayerComponent).forEach((player) => {
			newObserver.subscribe(player.hooks.getAttack, () => {
				game.components
					.filter(
						CardComponent,
						query.card.opponentPlayer,
						query.card.afk,
						query.card.slot(query.slot.hermit),
					)
					.forEach((afkHermit) =>
						game.components
							.new(
								StatusEffectComponent,
								GasLightPotentialEffect,
								component.entity,
							)
							.apply(afkHermit.entity),
					)

				return null
			})
		})
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				game.components
					.filter(
						CardComponent,
						query.card.opponentPlayer,
						query.card.afk,
						query.card.slot(query.slot.hermit),
					)
					.map((card) => {
						game.components
							.new(StatusEffectComponent, GasLightEffect, component.entity)
							.apply(card.entity)
					})
			},
		)
	},
}

export default SkizzlemanRare
