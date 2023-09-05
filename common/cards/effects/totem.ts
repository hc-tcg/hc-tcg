import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {isTargetingPos} from '../../utils/attacks'
import {discardCard} from '../../utils/movement'
import EffectCard from '../base/effect-card'

class TotemEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'totem',
			numericId: 101,
			name: 'Totem',
			rarity: 'ultra_rare',
			description:
				'Recover 10hp and remain in battle after you are knocked out.\n\nDoes not count as a knockout. Discard after use.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		// If we are attacked from any source
		player.hooks.afterDefence.add(instance, (attack) => {
			if (!isTargetingPos(attack, pos) || !attack.target) return
			const {row} = attack.target
			if (row.health) return

			row.health = 10
			row.ailments = []

			// This will remove this hook, so it'll only be called once
			discardCard(game, row.effectCard)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		pos.player.hooks.afterDefence.remove(instance)
	}
}

export default TotemEffectCard
