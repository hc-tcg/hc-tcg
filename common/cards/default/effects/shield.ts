import {row} from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Attach} from '../../base/types'
import {attach} from '../../base/defaults'

class ShieldEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'shield',
		numericId: 88,
		name: 'Shield',
		expansion: 'default',
		rarity: 'common',
		tokens: 2,
		description:
			'When the Hermit this card is attached to takes damage, that damage is reduced by up to 60hp, and then this card is discarded.',
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component
		let damageBlocked = 0

		// Note that we are using onDefence because we want to activate on any attack to us, not just from the opponent
		player.hooks.onDefence.add(component, (attack) => {
			let rowWithCard = game.state.rows.findEntity(row.hasCard(component.entity))
			if (attack.getTarget() !== rowWithCard || attack.isType('status-effect')) return attack

			if (damageBlocked < 60) {
				const damageReduction = Math.min(attack.calculateDamage(), 60 - damageBlocked)
				damageBlocked += damageReduction
				attack.reduceDamage(component.entity, damageReduction)
			}
		})

		player.hooks.afterDefence.add(component, (attack) => {
			if (damageBlocked > 0 && row) {
				discardCard(game, row.effectCard)
				if (!row.hermitCard) return attack
				const hermitName = row.hermitCard?.props.name
				game.battleLog.addEntry(player.entity, `$p${hermitName}'s$ $eShield$ was broken`)
			}
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onDefence.remove(component)
		player.hooks.afterDefence.remove(component)
	}
}

export default ShieldEffectCard
