import {SINGLE_USE_CARDS} from '..'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {HermitAttackType} from '../../types/attack'
import {PickedSlots} from '../../types/pick-process'
import HermitCard from '../base/hermit-card'

class HotguyRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'hotguy_rare',
			numericId: 131,
			name: 'Hotguy',
			rarity: 'rare',
			hermitType: 'explorer',
			health: 280,
			primary: {
				name: 'Velocité',
				cost: ['explorer'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Hawkeye',
				cost: ['explorer', 'explorer'],
				damage: 80,
				power:
					'When used with the bow effect card, the bow card does double damage to the chosen AFK opposing Hermit.',
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
		// Used for the Bow, we need to know the attack type
		if (attacks[0].type === 'secondary') pos.player.custom[this.getInstanceKey(instance)] = true

		return attacks
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		// How do I avoid using the cardId here? | Impossible so long as this is about a specific card - sense
		player.hooks.beforeAttack.add(instance, (attack) => {
			const singleUseCard = player.board.singleUseCard
			if (
				!singleUseCard ||
				singleUseCard.cardId !== 'bow' ||
				!player.custom[this.getInstanceKey(instance)]
			)
				return

			const bowId = SINGLE_USE_CARDS['bow'].getInstanceKey(singleUseCard.cardInstance)
			if (attack.id === bowId) {
				attack.addDamage(this.id, attack.getDamage())
			}
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
		return 'alter_egos'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}
}

export default HotguyRareHermitCard
