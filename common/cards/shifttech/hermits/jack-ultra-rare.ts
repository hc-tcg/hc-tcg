import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {beforeAttack} from '../../../types/priorities'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const JackUltraRare: Hermit = {
	...hermit,
	id: 'jack_ultra_rare',
	numericId: 133,
	name: 'Jack',
	expansion: 'shifttech',
	rarity: 'rare',
	tokens: 3,
	type: ['explorer'],
	health: 280,
	primary: {
		name: 'DOTD Champion',
		cost: ['any'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Golden Ratio',
		cost: ['any', 'any'],
		damage: 80,
		power: 
		'If there are 5 unique Hermits on your side of the board, deal double damage.\nIncludes non-Hermit cards like Armor Stand and Berry Bush.\nDifferent rarities on the Hermits do count as unique cards.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				let uniqueHermits: Array<string> = []

				game.components.filter(CardComponent, query.every(
					query.card.currentPlayer,
					query.card.attached,
					query.card.slot(query.slot.hermit)
					)
				).forEach(
					(card) => {
						if (!uniqueHermits.includes(card.props.id)) uniqueHermits.push(card.props.id)
					}
				)

				if (uniqueHermits.length === 5)
					attack.multiplyDamage(component.entity, 2)

				console.log(uniqueHermits)
			},
		)
	},
}

export default JackUltraRare
