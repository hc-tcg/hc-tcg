import {ITEM_CARDS} from '..'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import SingleUseCard from '../base/single-use-card'

class TreasureHunterSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'treasure_hunter',
			numericId: 152,
			name: 'Treasure Hunter',
			rarity: 'rare',
			description: 'Shuffle 3 "Snow Block" coins into your deck',
		})
	}

	public override canApply(): boolean {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player} = pos

		player.hooks.onApply.add(instance, (pickedSlots) => {
			const cardInfo = {
				cardId: 'item_coin_common',
				cardInstance: Math.random().toString(),
			}
			player.pile.unshift(cardInfo)
		})
	}

	public override onDetach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player} = pos

		player.hooks.onApply.remove(instance)
	}
}

export default TreasureHunterSingleUseCard
