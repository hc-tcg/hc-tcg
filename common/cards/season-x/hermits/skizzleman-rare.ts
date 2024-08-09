import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {GasLightEffect} from '../../../status-effects/gas-light'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

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
			"After your attack, deal an additional 20hp damage to each of your opponent's AFK Hermits that took damage during this turn.",
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
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
		})
	},
}

export default SkizzlemanRare
