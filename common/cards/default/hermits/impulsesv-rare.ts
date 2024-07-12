import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {CardComponent} from '../../../types/game-state'
import Card, {Hermit, hermit} from '../../base/card'

class ImpulseSVRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'impulsesv_rare',
		numericId: 41,
		name: 'Impulse',
		expansion: 'default',
		rarity: 'rare',
		tokens: 4,
		type: 'redstone',
		health: 250,
		primary: {
			name: 'Bop',
			cost: ['redstone'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Boomer',
			cost: ['redstone', 'any'],
			damage: 70,
			power:
				'For each of your AFK Bdubs or Tangos on the game board, do an additional 40hp damage, up to a maximum of 80hp additional damage.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = pos

		player.hooks.onAttack.add(component, (attack) => {
			if (attack.id !== this.getInstanceKey(component) || attack.type !== 'secondary') return
			const boomerAmount = game.filterSlots(
				slot.player,
				slot.hasId('bdoubleo100_common', 'bdoubleo100_rare', 'tangotek_common', 'tangotek_rare'),
				slot.not(slot.activeRow)
			).length

			attack.addDamage(this.props.id, Math.min(boomerAmount, 2) * 40)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default ImpulseSVRareHermitCard
