import HermitCard from '../base/hermit-card'
import {HERMIT_CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {HermitAttackType} from '../../types/attack'
import {PickedSlots} from '../../types/pick-process'

class RendogRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'rendog_rare',
			numericId: 87,
			name: 'Rendog',
			rarity: 'rare',
			hermitType: 'builder',
			health: 250,
			primary: {
				name: "Comin' At Ya",
				cost: ['builder'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Role Play',
				cost: ['builder', 'builder', 'builder'],
				damage: 0,
				power: "Use any secondary move of your opponent's Hermits.",
			},
			pickOn: 'attack',
			pickReqs: [{target: 'opponent', slot: ['hermit'], type: ['hermit'], amount: 1}],
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

		// "Attach" that card to our side of the board
		hermitInfo.onAttach(game, instance, pos)

		// Store which card we are imitating, to delete the hooks next turn
		const imitatingCard = this.getInstanceKey(instance, 'imitatingCard')
		pos.player.custom[imitatingCard] = card.cardId

		// Return that cards secondary attack
		return hermitInfo.getAttacks(game, instance, pos, hermitAttackType, {})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const imitatingCard = this.getInstanceKey(instance, 'imitatingCard')

		// At the start of every turn, remove the hooks of the imitated hermit from our player
		player.hooks.onTurnStart.add(instance, () => {
			if (player.custom[imitatingCard] === undefined) return

			// Find the hermit info of the card we were imitating, and "detach" it
			const hermitInfo = HERMIT_CARDS[player.custom[imitatingCard]]
			if (hermitInfo) {
				hermitInfo.onDetach(game, instance, pos)
			}

			delete player.custom[imitatingCard]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const imitatingCard = this.getInstanceKey(instance, 'imitatingCard')

		player.hooks.onTurnStart.remove(instance)
		delete player.custom[imitatingCard]
	}
}

export default RendogRareHermitCard
