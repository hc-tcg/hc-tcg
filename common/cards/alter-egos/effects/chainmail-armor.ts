import {EFFECT_CARDS, SINGLE_USE_CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {isTargetingPos} from '../../../utils/attacks'
import EffectCard from '../../base/effect-card'

class ChainmailArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'chainmail_armor',
			numericId: 119,
			name: 'Chainmail Armor',
			rarity: 'common',
			description:
				'Blocks damage from all effect cards. Also blocks damage redirected by effect cards.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onDefence.add(instance, (attack) => {
			if (!isTargetingPos(attack, pos)) {
				return
			}

			// only protect against su attacks and attacks which have been redirected by su cards
			let suRedirect = false

			const lastTargetChange = attack.getHistory('set_target').pop()
			if (lastTargetChange && SINGLE_USE_CARDS[lastTargetChange.sourceId]) {
				// This attack has been redirected to us by a su card
				suRedirect = true
			}

			if (attack.isType('effect') || suRedirect) {
				attack.multiplyDamage(this.id, 0).lockDamage(this.id)
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onDefence.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default ChainmailArmorEffectCard
