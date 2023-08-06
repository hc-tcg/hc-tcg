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
		const activeRow = getActiveRow(player)

		player.hooks.afterAttack.add(instance, (attack) => {
			applySingleUse(game)

			// Only apply single use once
			player.hooks.afterAttack.remove(instance)
		})

		player.hooks.availableActions.add(instance, (availableActions) => {
			const newActiveRow = getActiveRow(player)
			// Only allow changing hermits once
			if (newActiveRow !== activeRow) {
				player.hooks.availableActions.remove(instance)
			} else {
				// We need to check again because of bdubs
				const isSleeping = activeRow?.ailments.some((a) => a.id === 'sleeping')

				if (!isSleeping && !availableActions.includes('CHANGE_ACTIVE_HERMIT')) {
					availableActions.push('CHANGE_ACTIVE_HERMIT')
				}
			}

			return availableActions
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
		player.hooks.availableActions.remove(instance)
	}
}

export default ChorusFruitSingleUseCard
