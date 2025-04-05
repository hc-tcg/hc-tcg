import {CARDS} from '../..'
import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {attach} from '../../defaults'
import {Attach, Hermit} from '../../types'

const CorruptionBed: Attach = {
	...attach,
	id: 'corruption_bed',
	numericId: 272,
	expansion: 'beds',
	name: 'Corruption bed',
	rarity: 'ultra_rare',
	tokens: 2,
	description:
		'If the hermit this bed is attached to has items of its rare variant attached, convert it into the rare version.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		const tryUpgrade = () => {
			if (!component.slot.inRow()) return
			const hermit = component.slot.row.hermitSlot.card
			if (!hermit) return
			if (hermit.props.rarity !== 'common') return
			const new_id = hermit.props.id.replace('common', 'rare')
			const new_card = CARDS[new_id]
			console.log(new_card)
			if (!new_card) return
			const items = component.slot.row
				.getItems()
				.map((card) => card.props.id)
				.join(' ')
			if (!items.includes((new_card as Hermit).type)) return
			console.log('Replacing!')
			game.components.new(
				CardComponent,
				new_card,
				component.slot.row.hermitSlot.entity,
			)
			game.components.delete(hermit.entity)
		}
		tryUpgrade()

		observer.subscribe(player.hooks.onAttach, (card) => {
			if (card.props.category !== 'item') return
			tryUpgrade()
		})
	},
}

export default CorruptionBed
