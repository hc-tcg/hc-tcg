import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {isTargetingPos} from '../../utils/attacks'
import EffectCard from '../base/effect-card'

class ChainmailArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'chainmail_armor',
			name: 'Chainmail Armor',
			rarity: 'common',
			description: 'Prevents damage from all effect cards.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeDefence.add(instance, (attack, pickedSlots) => {
			if (!isTargetingPos(attack, pos) || attack.type !== 'effect') return

			attack.multiplyDamage(this.id, 0).lockDamage()
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.beforeDefence.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default ChainmailArmorEffectCard
