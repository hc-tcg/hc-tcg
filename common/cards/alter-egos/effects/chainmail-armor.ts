import {CARDS} from '../..'
import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import {isTargeting} from '../../../utils/attacks'
import Card, {Attach, attach} from '../../base/card'

class ChainmailArmorEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'chainmail_armor',
		numericId: 119,
		name: 'Chainmail Armour',
		expansion: 'alter_egos',
		rarity: 'common',
		tokens: 1,
		description:
			'Prevents any damage from effect cards and any damage redirected by effect cards to the Hermit this card is attached to.',
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = pos

		player.hooks.onDefence.add(component, (attack) => {
			if (!isTargeting(attack, pos)) {
				return
			}

			// only protect against su attacks and attacks which have been redirected by su cards
			let suRedirect = false

			const lastTargetChange = attack.getHistory('set_target').pop()
			if (lastTargetChange && CARDS[lastTargetChange.sourceId]) {
				// This attack has been redirected to us by a su card
				suRedirect = true
			}

			if (attack.isType('effect') || suRedirect) {
				attack.multiplyDamage(this.props.id, 0).lockDamage(this.props.id)
			}
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		player.hooks.onDefence.remove(component)
	}
}

export default ChainmailArmorEffectCard
