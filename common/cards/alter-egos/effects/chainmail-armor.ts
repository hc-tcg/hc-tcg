import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import CardOld from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

class ChainmailArmor extends CardOld {
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

	override onAttach(
		_game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onDefence, (attack) => {
			if (!attack.isTargeting(component)) {
				return
			}

			// only protect against su attacks and attacks which have been redirected by su cards
			let suRedirect = false

			const lastTargetChange = attack.getHistory('redirect').pop()
			if (lastTargetChange) {
				// This attack has been redirected to us by a su card
				suRedirect = true
			}

			if (attack.isType('effect') || suRedirect) {
				attack.multiplyDamage(component.entity, 0).lockDamage(component.entity)
			}
		})
	}
}

export default ChainmailArmor
