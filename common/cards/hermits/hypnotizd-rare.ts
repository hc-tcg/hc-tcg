import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {HermitAttackType} from '../../types/attack'
import {PickedSlots} from '../../types/pick-process'
import {createWeaknessAttack} from '../../utils/attacks'
import {discardCard} from '../../utils/movement'
import {getNonEmptyRows} from '../../utils/board'
import HermitCard from '../base/hermit-card'

/*
- Has to support having two different afk targets (one for hypno, one for su effect like bow)
- If the afk target for Hypno's ability & e.g. bow are the same, don't apply weakness twice
- TODO - Can't use Got 'Em to attack AFK hermits even with Efficiency if Hypno has no item cards to discard
*/
class HypnotizdRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'hypnotizd_rare',
			numericId: 37,
			name: 'Hypno',
			rarity: 'rare',
			hermitType: 'miner',
			health: 270,
			primary: {
				name: 'MmHmm',
				cost: ['miner'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: "Got 'Em",
				cost: ['miner', 'any'],
				damage: 70,
				power:
					"You can choose to attack an opponent's AFK Hermit.\n\nIf AFK Hermit is attacked, you must discard 1 attached item card.",
			},
			pickOn: 'attack',
			pickReqs: [
				{
					target: 'opponent',
					slot: ['hermit'],
					amount: 1,
				},
				{
					target: 'player',
					slot: ['item'],
					type: ['item'],
					amount: 1,
					active: true,
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
		const {opponentPlayer} = pos
		const attacks = super.getAttacks(game, instance, pos, hermitAttackType, pickedSlots)

		if (attacks[0].type !== 'secondary') return attacks

		const opponentInactiveRows = getNonEmptyRows(opponentPlayer, false)
		if (opponentInactiveRows.length === 0) return attacks

		const hermitAttack = attacks[0]

		const pickedHermit = pickedSlots[this.id]?.[0]
		if (!pickedHermit || !pickedHermit.row || !pickedHermit.row.state.hermitCard) return attacks

		// Change attack target
		hermitAttack.target = {
			player: game.state.players[pickedHermit.playerId],
			rowIndex: pickedHermit.row.index,
			row: pickedHermit.row.state,
		}

		const isActive = opponentPlayer.board.activeRow === pickedHermit.row?.index
		if (isActive || opponentInactiveRows.length === 0) return attacks

		const pickedItem = pickedSlots[this.id]?.[1]
		if (!pickedItem) return attacks

		// Discard item card
		discardCard(game, pickedItem.slot.card)

		const newAttacks = [hermitAttack]

		const weaknessAttack = createWeaknessAttack(hermitAttack)
		if (weaknessAttack) newAttacks.push(weaknessAttack)

		return newAttacks
	}
}

export default HypnotizdRareHermitCard
