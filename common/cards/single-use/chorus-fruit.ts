import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {applySingleUse, getActiveRow} from '../../utils/board'
import SingleUseCard from '../base/single-use-card'

class ChorusFruitSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'chorus_fruit',
			name: 'Chorus Fruit',
			rarity: 'common',
			description: 'Swap your active Hermit with one of your AFK Hermits after attacking.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.afterAttack.add(instance, (attack) => {
			applySingleUse(game)

			// Remove change active hermit from the blocked actions so it can be done once more
			game.removeBlockedActions('CHANGE_ACTIVE_HERMIT')

			// Only apply single use once
			player.hooks.afterAttack.remove(instance)
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const {player} = pos
		const activeRow = getActiveRow(player)

		const isSleeping = activeRow?.ailments.some((a) => a.id === 'sleeping')
		if (isSleeping) return 'NO'

		return 'YES'
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.afterAttack.remove(instance)
	}
}

export default ChorusFruitSingleUseCard
