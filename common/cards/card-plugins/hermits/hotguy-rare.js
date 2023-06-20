import HermitCard from './_hermit-card'
import {GameModel} from '../../../../server/models/game-model'
import {SINGLE_USE_CARDS} from '../../../../common/cards'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/attack').HermitAttackType} HermitAttackType
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 */

class HotguyRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'hotguy_rare',
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

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {HermitAttackType} hermitAttackType
	 * @param {PickedSlots} pickedSlots
	 */
	getAttacks(game, instance, pos, hermitAttackType, pickedSlots) {
		const attacks = super.getAttacks(
			game,
			instance,
			pos,
			hermitAttackType,
			pickedSlots
		)
		// Used for the Bow, we need to know the attack type
		if (attacks[0].type === 'secondary') pos.player.custom[instance] = true

		return attacks
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		// How do I avoid using the cardId here?
		player.hooks.beforeAttack[instance] = (attack) => {
			const singleUseCard = player.board.singleUseCard
			if (
				!singleUseCard ||
				singleUseCard.cardId !== 'bow' ||
				!player.custom[instance]
			)
				return

			const bowId = SINGLE_USE_CARDS['bow'].getInstanceKey(
				singleUseCard.cardInstance
			)
			if (attack.id === bowId) {
				attack.addDamage(attack.damage)
			}
		}

		player.hooks.onTurnEnd[instance] = () => {
			delete player.custom[instance]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos

		delete player.hooks.beforeAttack[instance]
		delete player.hooks.onTurnEnd[instance]
		delete player.custom[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}

	getPalette() {
		return 'alter_egos'
	}

	getBackground() {
		return 'alter_egos_background'
	}
}

export default HotguyRareHermitCard
