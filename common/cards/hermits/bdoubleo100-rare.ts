import {HERMIT_CARDS} from '..'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import HermitCard from '../base/hermit-card'

class BdoubleO100RareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'bdoubleo100_rare',
			numeric_id: 1,
			name: 'Bdubs',
			rarity: 'rare',
			hermitType: 'balanced',
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
					'Sleep for the following 2 turns. Restore Full Health. Can not attack. Can not go AFK.\n\nCan still draw and attach cards while sleeping.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			const attacker = attack.attacker
			if (!attacker) return
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			// restore health
			const hermitInfo = HERMIT_CARDS[attacker.row.hermitCard.cardId]
			attacker.row.health = hermitInfo.health

			// remove old sleeping
			attacker.row.ailments = attacker.row.ailments.filter((a) => a.id !== 'sleeping')

			// sleep for 3 turns (2 + the current turn)
			attacker.row.ailments.push({id: 'sleeping', duration: 3})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default BdoubleO100RareHermitCard
