import EffectCard from '../base/effect-card'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {applyAilment} from '../../utils/board'

class BrewingStandEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'brewing_stand',
			numericId: 160,
			name: 'Brewing stand',
			rarity: 'rare',
			description:
				'Attach to any active or AFK Hermit.\n\nEvery other turn, choose an item to discard from the Hermit Brewing Stand is attached to and heal this Hermit 50hp.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const brewingInstanceKey = this.getInstanceKey(instance, 'brewed_last_turn')

		player.hooks.onTurnEnd.add(instance, () => {
			if (!player.custom[brewingInstanceKey]) {
				applyAilment(game, 'brewing', instance)
			}
			player.custom[brewingInstanceKey] = !player.custom[brewingInstanceKey]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const brewingInstanceKey = this.getInstanceKey(instance, 'brewed_last_turn')

		player.hooks.onTurnStart.remove(instance)
		delete player.custom[brewingInstanceKey]
	}

	public override getExpansion(): string {
		return 'advent_of_tcg'
	}
}

export default BrewingStandEffectCard
