import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {GasLightEffect} from '../../../status-effects/gas-light'

class SkizzlemanRare extends Card {
	props: Hermit = {
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
				"At the end of your turn, deal 20hp damage to each of your opponent's AFK hermits that took damage this turn.",
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return
			game.components
				.filter(CardComponent, query.card.opponentPlayer, query.card.afk)
				.map((card) => {
					game.components.new(StatusEffectComponent, GasLightEffect).apply(card.entity)
				})
		})
	}
}

export default SkizzlemanRare
