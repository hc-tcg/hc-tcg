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
			description: 'After your attack, choose an AFK Hermit to set as your active Hermit.',
			log: (values) => `${values.defaultLog} with {your|their} attack`,
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.afterAttack.add(instance, (attack) => {
			// Remove change active hermit from the blocked actions so it can be done once more
			game.removeBlockedActions('game', 'CHANGE_ACTIVE_HERMIT')

			// Apply the card
			applySingleUse(game)

			player.hooks.afterAttack.remove(instance)
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result = super.canAttach(game, pos)

		const {player} = pos
		const activeRow = getActiveRow(player)

		const isSleeping = game.state.statusEffects.some(
			(a) =>
				a.targetInstance == activeRow?.hermitCard?.cardInstance && a.statusEffectId == 'sleeping'
		)
		if (isSleeping) result.push('UNMET_CONDITION')

		return result
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.afterAttack.remove(instance)
	}
}

export default ChorusFruitSingleUseCard
