import EffectCard from '../base/effect-card'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {HERMIT_CARDS} from '..'

class CatEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'cat',
			numericId: 172,
			name: 'Cat',
			rarity: 'rare',
			description:
				'Attach to any active or AFK Hermit.\n\nAfter the Hermit this card is attached to attacks, view the top card of your deck. You may choose to discard it and draw the bottom card of your deck at the end of your turn instead.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.afterAttack.add(instance, (attack) => {
			if (!pos.row || !pos.row.hermitCard) return
			if (
				attack.id !==
				HERMIT_CARDS[pos.row.hermitCard.cardId].getInstanceKey(pos.row.hermitCard.cardInstance)
			)
				return

			if (player.pile.length === 0) return

			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: 'Cat: Discard card and draw from bottom?',
						modalDescription: '',
						cards: [player.pile[0]],
						selectionSize: 0,
						primaryButton: {
							text: 'Yes',
							variant: 'primary',
						},
						secondaryButton: {
							text: 'No',
							variant: 'secondary',
						},
					},
				},
				onResult(modalResult) {
					if (!modalResult) return 'SUCCESS'
					if (!modalResult.result) return 'SUCCESS'

					const topCard = player.pile.shift()
					player.hooks.onTurnEnd.add(instance, (drawCards) => {
						player.hooks.onTurnEnd.remove(instance)
						return [player.pile[-1]]
					})
					if (!topCard) return 'SUCCESS'

					return 'SUCCESS'
				},
				onTimeout() {
					return
				},
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.afterAttack.remove(instance)
	}

	public override getExpansion(): string {
		return 'advent_of_tcg'
	}
}

export default CatEffectCard
