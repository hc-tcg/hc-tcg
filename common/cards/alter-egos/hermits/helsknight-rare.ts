import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {card, slot} from '../../../components/query'

class HelsknightRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'helsknight_rare',
		numericId: 130,
		name: 'Helsknight',
		expansion: 'alter_egos',
		palette: 'alter_egos',
		background: 'alter_egos',
		rarity: 'rare',
		tokens: 2,
		type: 'pvp',
		health: 270,
		primary: {
			name: 'Pitiful',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Trap Hole',
			cost: ['pvp', 'pvp', 'pvp'],
			damage: 100,
			power:
				'If your opponent uses a single use effect card on their next turn, flip a coin.\nIf heads, you take that card after its effect is applied and add it to your hand.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: Observer) {
		const {player, opponentPlayer} = component

		player.hooks.onAttack.add(component, (attack) => {
			if (attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			opponentPlayer.hooks.onApply.add(component, () => {
				let singleUseCard = game.components.find(CardComponent, card.slot(slot.singleUseSlot))
				if (!singleUseCard) return

				const coinFlip = flipCoin(player, component, 1, opponentPlayer)

				if (coinFlip[0] == 'heads') {
					game.battleLog.addEntry(
						player.entity,
						`$p{Helsknight}$ flipped $pheads$ and took $e${singleUseCard.props.name}$`
					)
				} else {
					game.battleLog.addEntry(player.entity, `$p{Helsknight}$ flipped $btails$b`)
				}
			})

			opponentPlayer.hooks.onTurnEnd.add(component, () => {
				opponentPlayer.hooks.onApply.remove(component)
				opponentPlayer.hooks.onTurnEnd.remove(component)
			})
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onAttack.remove(component)
	}
}

export default HelsknightRare
