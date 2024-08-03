import {GameModel} from '../../../models/game-model'
import query from '../../../components/query'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import WeaknessEffect from '../../../status-effects/weakness'

export const weaknessAssociations: Record<TypeT, Array<TypeT>> = {
	balanced: [WeakToBalancedEffect, StrongToBalancedEffect],
	builder: [WeakToBuilderEffect, StrongToBuilderEffect],
	explorer: [WeakToExplorerEffect, StrongToExplorerEffect],
	farm: [WeakToFarmEffect, StrongToFarmEffect],
	miner: [WeakToMinerEffect, StrongToMinerEffect],
	prankster: [WeakToPranksterEffect, StrongToPranksterEffect],
	pvp: [WeakToPvPEffect, StrongToPvPEffect],
	redstone: [WeakToRedstoneEffect, StrongToRedstoneEffect],
	speedrunner: [WeakToSpeedrunnerEffect, StrongToSpeedrunnerEffect],
	terraform: [WeakToTerrafromEffect, StrongToTerraformEffect],
}
class PotionOfWeakness extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'potion_of_weakness',
		numericId: 146,
		name: 'Potion of Weakness',
		expansion: 'alter_egos',
		rarity: 'common',
		tokens: 2,
		description: "Your opponent's current active Hermit's type is now weak to your current active Hermit's type for 3 turns.",
		sidebarDescriptions: [
			{
				type: 'glossary',
				name: 'weak',
			},
		],
		showConfirmationModal: true,
		attachCondition: query.every(singleUse.attachCondition, query.slot.opponentHasActiveHermit),
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {opponentPlayer, player} = component

		let counter = 3
		const strongType = 0
		const weakType = 0

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.new(StatusEffectComponent, WeaknessEffect, component.entity)
				.apply(opponentPlayer.getActiveHermit()?.entity)
		})
	}
}

export default PotionOfWeakness
