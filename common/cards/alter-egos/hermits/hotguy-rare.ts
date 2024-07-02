import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {HermitAttackType} from '../../../types/attack'
import {CardInstance} from '../../../types/game-state'
import Card, {Hermit, InstancedValue, hermit} from '../../base/card'

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

	usingSecondaryAttack = new InstancedValue<boolean>(false)

	override getAttack(
		game: GameModel,
		instance: CardInstance,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	) {
		const attack = super.getAttack(game, instance, pos, hermitAttackType)
		// Used for the Bow, we need to know the attack type
		if (attack && attack.type === 'secondary') {
			this.usingSecondaryAttack.set(instance, true)
		}

		return attack
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		// How do I avoid using the id here? | Impossible so long as this is about a specific card - sense
		player.hooks.beforeAttack.add(instance, (attack) => {
			const singleUseCard = player.board.singleUseCard
			if (
				!singleUseCard ||
				singleUseCard.props.id !== 'bow' ||
				!this.usingSecondaryAttack.get(instance)
			)
				return

			const bowId = singleUseCard.card.getInstanceKey(singleUseCard)
			if (attack.id === bowId) {
				attack.addDamage(this.props.id, attack.getDamage())
			}
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		this.usingSecondaryAttack.clear(instance)
		player.hooks.beforeAttack.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
	}
}

export default HotguyRareHermitCard
