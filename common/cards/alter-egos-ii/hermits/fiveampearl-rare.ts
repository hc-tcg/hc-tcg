import {EFFECT_CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getActiveRow} from '../../../utils/board'
import HermitCard from '../../base/hermit-card'

class FiveAMPearlRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'fiveampearl_rare',
			numericId: 230,
			name: '5AM Pearl',
			rarity: 'rare',
			hermitType: 'balanced',
			health: 270,
			primary: {
				name: 'Wicked',
				cost: ['balanced'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Dogs of War',
				cost: ['balanced', 'balanced'],
				damage: 70,
				power: 'If Wolf card is attached to this Hermit, do an additional 30hp damage.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			const effectCard = getActiveRow(player)?.effectCard
			if (!effectCard || effectCard.cardId !== 'wolf') return

			attack.addDamage(this.id, 30)
		})

		player.hooks.onTurnEnd.add(instance, () => {
			delete player.custom[this.getInstanceKey(instance)]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeAttack.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
		delete player.custom[this.getInstanceKey(instance)]
	}

	override getExpansion() {
		return 'alter_egos_ii'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}
}

export default FiveAMPearlRareHermitCard
