import {CardComponent} from '../../../components'
import {query, slot} from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import CardOld from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

class BerryBush extends CardOld {
	props: Attach = {
		...attach,
		id: 'berry_bush',
		numericId: 200,
		name: 'Sweet Berry Bush',
		expansion: 'advent_of_tcg',
		rarity: 'ultra_rare',
		tokens: 2,
		description:
			"Use like a Hermit card. Place on one of your opponent's empty Hermit slots. Has 30hp.\nCan not attach cards to it.\nYou do not get a point when it's knocked out.\nLoses 10hp per turn. If you knock out Sweet Berry Bush before it's HP becomes 0, add 2 Instant Healing II into your hand.",
		attachCondition: query.every(
			slot.opponent,
			slot.hermit,
			slot.empty,
			slot.playerHasActiveHermit,
			slot.opponentHasActiveHermit,
			query.not(slot.frozen),
		),
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		const {player, opponentPlayer, rowId: row} = pos
		if (!row) return

		row.health = 30

		player.hooks.afterAttack.add(component, () => {
			if (!row.health) {
				// Discard to prevent losing a life
				discardCard(game, row.hermitCard)
			}
		})

		opponentPlayer.hooks.afterAttack.add(component, () => {
			if (!row.health) {
				// Discard to prevent losing a life
				discardCard(game, row.hermitCard)
				for (let i = 0; i < 2; i++) {
					opponentPlayer.hand.push(
						CardComponent.fromCardId('instant_health_ii'),
					)
				}
			}
		})

		opponentPlayer.hooks.onTurnEnd.add(component, () => {
			if (!row.health || row.health <= 10) {
				discardCard(game, row.hermitCard)
				return
			}
			row.health -= 10
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player, opponentPlayer, type, rowId: row} = pos

		if (getActiveRow(player) === row) {
			player.changeActiveRow(null)
		}

		if (slot && type === 'hermit' && row) {
			row.health = null
			row.effectCard = null
			row.itemCards = []
		}

		player.hooks.afterAttack.remove(component)
		opponentPlayer.hooks.afterAttack.remove(component)
		opponentPlayer.hooks.onTurnEnd.remove(component)
	}
}

export default BerryBush
