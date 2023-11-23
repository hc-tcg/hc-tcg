import EffectCard from '../base/effect-card'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {flipCoin} from '../../utils/coinFlips'
import {discardCard} from '../../utils/movement'
import {HERMIT_CARDS} from '..'

class BrewingStandEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'brewing_stand',
			numericId: 160,
			name: 'Brewing stand',
			rarity: 'rare',
			description:
				'Attach to any active or AFK Hermit. At the start of every turn where this Hermit is active, flip a coin. If heads, discard an item card attached to this Hermit and heal by 50hp.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onTurnStart.add(instance, () => {
			if (!pos.row?.itemCards || pos.row.itemCards.filter((card) => card !== null).length === 0) return

			const flip = flipCoin(player, this.id)[0]
			if (flip !== 'heads') return

			game.addPickRequest({
				playerId: player.id,
				id: this.id,
				message: 'Pick an item card to discard',
				onResult(pickResult) {
					if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'
					if (pickResult.rowIndex !== pos.rowIndex) return 'FAILURE_INVALID_SLOT'

					if (pickResult.slot.type !== 'item') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					const playerRow = player.board.rows[pickResult.rowIndex]
					const hermitCard = playerRow.hermitCard
					if (!hermitCard || !playerRow.health) return 'SUCCESS'
					const hermitInfo = HERMIT_CARDS[hermitCard.cardId]
					if (hermitInfo) {
						playerRow.health = Math.min(playerRow.health + 50, hermitInfo.health)
					} else {
						// Armor Stand
						playerRow.health += 50
					}
					discardCard(game, pickResult.card)

					return 'SUCCESS'
				},
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onTurnStart.remove(instance)
	}

	public override getExpansion(): string {
		return 'advent_of_tcg'
	}
}

export default BrewingStandEffectCard
