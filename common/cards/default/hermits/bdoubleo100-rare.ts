import {HERMIT_CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import HermitCard from '../../base/hermit-card'
import {applyStatusEffect, getActiveRow, removeStatusEffect} from '../../../utils/board'

class BdoubleO100RareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'bdoubleo100_rare',
			numericId: 1,
			name: 'Bdubs',
			rarity: 'rare',
			type: 'balanced',
			health: 260,
			primary: {
				name: 'Retexture',
				cost: ['any'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Shreep',
				cost: ['balanced', 'balanced', 'any'],
				damage: 0,
				power:
					'This Hermit restores all HP, then sleeps for the rest of this turn, and the following two turns, before waking up.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			const attacker = attack.getAttacker()
			if (!attacker) return
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			const row = getActiveRow(player)

			if (!row) return

			// Add new sleeping statusEffect
			applyStatusEffect(game, 'sleeping', row.hermitCard.instance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}

	override sidebarDescriptions() {
		return [
			{
				type: 'statusEffect',
				name: 'sleeping',
			},
		]
	}
}

export default BdoubleO100RareHermitCard
