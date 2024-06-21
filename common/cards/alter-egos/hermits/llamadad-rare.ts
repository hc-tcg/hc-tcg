import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import HermitCard from '../../base/hermit-card'

class LlamadadRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'llamadad_rare',
			numericId: 134,
			name: 'Llamadad',
			rarity: 'rare',
			hermitType: 'balanced',
			health: 290,
			primary: {
				name: 'Spitz',
				cost: ['balanced'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Matilda',
				cost: ['balanced', 'balanced'],
				damage: 80,
				power: 'Flip a coin.\nIf heads, do an additional 40hp damage.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			const attacker = attack.getAttacker()
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary' || !attacker)
				return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)
			if (coinFlip[0] === 'heads') {
				attack.addDamage(this.id, 40)
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}
}

export default LlamadadRareHermitCard
