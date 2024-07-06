import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardInstance} from '../../../types/game-state'
import Card, {Hermit, hermit} from '../../base/card'

class HotguyRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'hotguy_rare',
		numericId: 131,
		name: 'Hotguy',
		expansion: 'alter_egos',
		palette: 'alter_egos',
		background: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		type: 'explorer',
		health: 280,
		primary: {
			name: 'Velocité',
			cost: ['explorer'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Hawkeye',
			cost: ['explorer', 'explorer'],
			damage: 80,
			power: 'When used with a bow effect card, bow damage doubles.',
		},
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		let usingSecondaryAttack = false

		// How do I avoid using the id here? | Impossible so long as this is about a specific card - sense
		player.hooks.beforeAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			usingSecondaryAttack = attack.type === 'secondary'
		})

		player.hooks.beforeAttack.add(instance, (attack) => {
			const singleUseCard = player.board.singleUseCard
			if (singleUseCard?.props.id !== 'bow' || !usingSecondaryAttack) return

			const bowId = singleUseCard.card.getInstanceKey(singleUseCard)
			if (attack.id === bowId) {
				attack.addDamage(this.props.id, attack.getDamage())
			}
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeAttack.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
	}
}

export default HotguyRareHermitCard
