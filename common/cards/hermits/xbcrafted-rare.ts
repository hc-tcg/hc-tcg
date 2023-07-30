import {CardPosModel, getCardPos} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {HermitAttackType} from '../../types/attack'
import {PickedSlots} from '../../types/pick-process'
import HermitCard from '../base/hermit-card'

/*
Combination of Totem + Scars ability can be tricky here to get right
*/
class XBCraftedRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'xbcrafted_rare',
			name: 'XB',
			rarity: 'rare',
			hermitType: 'explorer',
			health: 270,
			primary: {
				name: 'Giggle',
				cost: ['explorer'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Noice!',
				cost: ['explorer', 'any'],
				damage: 70,
				power: 'Ignore any effect card attached to opponent.',
			},
		})
	}

	override getAttacks(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType,
		pickedSlots: PickedSlots
	) {
		const attacks = super.getAttacks(game, instance, pos, hermitAttackType, pickedSlots)

		if (attacks[0].type === 'secondary') {
			// Noice attack, ignore target effect card
			attacks[0].shouldIgnoreCards.push((instance) => {
				const pos = getCardPos(game, instance)
				if (!pos || !attacks[0].target) return false

				const onTargetRow = pos.rowIndex === attacks[0].target.rowIndex
				if (onTargetRow && pos.slot.type === 'effect') {
					// It's the targets effect card, ignore it
					return true
				}

				return false
			})
		}

		return attacks
	}
}

export default XBCraftedRareHermitCard
