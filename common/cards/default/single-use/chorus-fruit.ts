import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse, getActiveRow} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class ChorusFruitSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'chorus_fruit',
			numericId: 5,
			name: 'Chorus Fruit',
			rarity: 'common',
			description: 'Swap your active Hermit with one of your AFK Hermits after attacking.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const removedBlockKey = this.getInstanceKey(instance, 'removedBlockedAction')

		player.hooks.onAttack.add(instance, (attack) => {
			// Apply the card
			applySingleUse(game, [
				[`with `, 'plain'],
				[`your `, 'plain', 'player'],
				[`their `, 'plain', 'opponent'],
				[`attack `, 'plain'],
			])

			player.hooks.afterAttack.add(instance, (attack) => {
				if (player.custom[removedBlockKey]) return
				// Remove change active hermit from the blocked actions so it can be done once more
				game.removeBlockedActions('game', 'CHANGE_ACTIVE_HERMIT')
				player.custom[removedBlockKey] = true
				// If another attack loop runs let the blocked action be removed again
				player.hooks.beforeAttack.add(instance, (attack) => {
					delete player.custom[removedBlockKey]
					player.hooks.beforeAttack.remove(instance)
				})
			})

			player.hooks.onTurnEnd.add(instance, (attack) => {
				delete player.custom[removedBlockKey]
				player.hooks.beforeAttack.remove(instance)
				player.hooks.afterAttack.remove(instance)
				player.hooks.onTurnEnd.remove(instance)
			})

			player.hooks.onAttack.remove(instance)
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const {player} = pos
		const activeRow = getActiveRow(player)

		const isSleeping = game.state.statusEffects.some(
			(a) =>
				a.targetInstance == activeRow?.hermitCard?.cardInstance && a.statusEffectId == 'sleeping'
		)
		if (isSleeping) return 'NO'

		return 'YES'
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onAttack.remove(instance)
	}
}

export default ChorusFruitSingleUseCard
