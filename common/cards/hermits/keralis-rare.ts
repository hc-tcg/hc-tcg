import HermitCard from '../base/hermit-card'
import {HERMIT_CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import { HermitAttackType } from '../../types/attack'
import { PickedSlots } from '../../types/pick-process'
import { AttackModel } from '../../models/attack-model'

class KeralisRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'keralis_rare',
			numericId: 72,
			name: 'Keralis',
			rarity: 'rare',
			hermitType: 'terraform',
			health: 250,
			primary: {
				name: 'Booshes',
				cost: ['any'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Sweet Face',
				cost: ['terraform', 'terraform', 'any'],
				damage: 0,
				power: 'Heal any AFK Hermit for 100hp.',
			},
			pickOn: 'attack',
			pickReqs: [
				{
					target: 'board',
					slot: ['hermit'],
					type: ['hermit'],
					amount: 1,
					active: false,
				},
			],
		})
	}

	public override getAttacks(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType,
		pickedSlots: PickedSlots
	): AttackModel[] {
		const attacks = super.getAttacks(game, instance, pos, hermitAttackType, pickedSlots)

		if (hermitAttackType !== 'secondary') return attacks

		return attacks.filter((attack) => {
			return attack.type !== 'weakness'
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		// Heals the afk hermit *before* we actually do damage
		player.hooks.onAttack.add(instance, (attack, pickedSlots) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			const pickedHermit = pickedSlots[this.id]?.[0]
			if (!pickedHermit || !pickedHermit.row) return

			const rowState = pickedHermit.row.state
			if (!rowState.hermitCard) return

			const hermitInfo = HERMIT_CARDS[rowState.hermitCard.cardId]
			if (hermitInfo) {
				// Heal
				rowState.health = Math.min(
					rowState.health + 100,
					hermitInfo.health // Max health
				)
			} else {
				// Armor Stand
				rowState.health += 100
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		pos.player.hooks.onAttack.remove(instance)
	}
}

export default KeralisRareHermitCard
