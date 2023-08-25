import {HERMIT_CARDS} from '..'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {HermitAttackType} from '../../types/attack'
import {PickedSlots} from '../../types/pick-process'
import {getNonEmptyRows} from '../../utils/board'
import HermitCard from '../base/hermit-card'

class ZombieCleoRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'zombiecleo_rare',
			numeric_id: 116,
			name: 'Cleo',
			rarity: 'rare',
			hermitType: 'pvp',
			health: 290,
			primary: {
				name: 'Dismissed',
				cost: ['pvp'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Puppetry',
				cost: ['pvp', 'pvp', 'pvp'],
				damage: 0,
				power: 'Use a secondary attack from any of your AFK Hermits.',
			},
			pickOn: 'attack',
			pickReqs: [
				{
					target: 'player',
					slot: ['hermit'],
					type: ['hermit'],
					amount: 1,
					active: false,
				},
			],
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

		if (attacks[0].type !== 'secondary') return attacks

		const pickedHermit = pickedSlots[this.id]?.[0]
		if (!pickedHermit || !pickedHermit.row) return []
		const rowState = pickedHermit.row.state
		const card = rowState.hermitCard
		if (!card) return []

		// No loops please
		if (card.cardId === this.id) return []

		const hermitInfo = HERMIT_CARDS[card.cardId]
		if (!hermitInfo) return []

		// Return that cards secondary attack
		return hermitInfo.getAttacks(game, card.cardInstance, pos, hermitAttackType, {})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.blockedActions.add(instance, (blockedActions) => {
			const afkHermits = getNonEmptyRows(player, false).length
			if (
				player.board.activeRow === pos.rowIndex &&
				afkHermits <= 0 &&
				!blockedActions.includes('SECONDARY_ATTACK')
			) {
				blockedActions.push('SECONDARY_ATTACK')
			}

			return blockedActions
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.blockedActions.remove(instance)
	}
}

export default ZombieCleoRareHermitCard
