import {CardComponent, ObserverComponent, RowComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const TinFoilChefMythic: Hermit = {
	...hermit,
	id: 'tinfoilchef_mythic',
	numericId: 607,
	name: 'TinFoilChef',
	expansion: 'hc_plus',
	rarity: 'mythic',
	tokens: 5,
	type: ['miner'],
	health: 300,
	primary: {
		name: 'Very Humble Abode',
		shortName: 'V. Humble Abode',
		cost: ['any'],
		damage: 40,
		power: 'Flip 3 coins.\nDeal +40 damage per head.',
	},
	secondary: {
		name: "I'm Outta here",
		shortName: 'Outta Here',
		cost: ['miner', 'miner', 'miner'],
		damage: 100,
		power:
			'Take the average hp of the hermits on your side of the board and double it. Heal all of your hermits to that value and discard this card.\nThis only removes a life if all of your hermits are at full hp after the healing.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		// Copied from Etho UR.
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'primary')
					return
				if (!(attack.attacker instanceof CardComponent)) return
				if (!attack.attacker.slot.inRow()) return

				const coinFlip = flipCoin(game, player, attack.attacker, 3)
				const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
				attack.addDamage(component.entity, headsAmount * 40)
			},
		)
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				// Calculate average health.
				let total = 0
				let count = 0
				game.components
					.filter(RowComponent, query.row.currentPlayer, query.row.hasHermit)
					.forEach((row) => {
						if (!row.health) return
						total += row.health
						count += 1
					})

				// Heal
				game.components
					.filter(RowComponent, query.row.currentPlayer, query.row.hasHermit)
					.forEach((row) => {
						let healValue = (total * 2) / count
						healValue -= healValue % 10

						row.heal(healValue)
						let hermit = row.getHermit()
						game.battleLog.addEntry(
							player.entity,
							`$p${hermit?.props.name} (${row.index + 1})$ was healed $g${healValue}hp$ by $p${
								component.props.name
							}$`,
						)
					})

				// Check full health
				let allFullHealth = true
				game.components
					.filter(RowComponent, query.row.currentPlayer, query.row.hasHermit)
					.forEach((row) => {
						let hermit = row.getHermit()
						if (!hermit) return
						if (!hermit.isHealth()) return
						if (!row.health) return

						if (row.health >= hermit.props.health) {
							allFullHealth = false
						}
					})

				if (allFullHealth) {
					player.lives -= 1
				}
			},
		)
	},
}

export default TinFoilChefMythic
