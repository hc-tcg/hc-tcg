import {HERMIT_CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import Card, {Hermit, hermit} from '../../base/card'
import HermitCard from '../../base/hermit-card'

class Iskall85RareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'iskall85_rare',
		numericId: 48,
		name: 'Iskall',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		hermitType: 'farm',
		health: 290,
		primary: {
			name: 'Of Doom',
			cost: ['farm'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Bird Poop',
			cost: ['farm', 'farm'],
			damage: 80,
			power: 'Attack damage doubles versus Builder types.',
		},
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			const target = attack.getTarget()
			if (attack.id !== attackId || attack.type !== 'secondary' || !target) return

			const isBuilder =
				target.row.hermitCard &&
				HERMIT_CARDS[target.row.hermitCard.cardId]?.hermitType === 'builder'
					? 2
					: 1

			attack.multiplyDamage(this.props.id, isBuilder)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.beforeAttack.remove(instance)
	}
}

export default Iskall85RareHermitCard
