import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardInstance} from '../../../types/game-state'
import {isTargetingPos} from '../../../utils/attacks'
import {discardCard} from '../../../utils/movement'
import Card, {Attach, attach} from '../../base/card'

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

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos
		let damageBlocked = 0

		// Note that we are using onDefence because we want to activate on any attack to us, not just from the opponent
		player.hooks.onDefence.add(instance, (attack) => {
			if (!isTargetingPos(attack, pos) || attack.isType('status-effect')) return attack

			if (damageBlocked < 60) {
				const damageReduction = Math.min(attack.calculateDamage(), 60 - damageBlocked)
				damageBlocked += damageReduction
				attack.reduceDamage(this.props.id, damageReduction)
			}
		})

		player.hooks.afterDefence.add(instance, (attack) => {
			const {player, row} = pos

			if (damageBlocked > 0 && row) {
				discardCard(game, row.effectCard)
				if (!row.hermitCard) return attack
				const hermitName = row.hermitCard?.props.name
				game.battleLog.addEntry(player.id, `$p${hermitName}'s$ $eShield$ was broken`)
			}
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onDefence.remove(instance)
		player.hooks.afterDefence.remove(instance)
	}
}

export default ShieldEffectCard
