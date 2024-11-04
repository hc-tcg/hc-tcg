import {CardComponent, DeckSlotComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'
import Feather from './feather'

const FletchingTable: SingleUse = {
	...singleUse,
	id: 'fletching_table',
	numericId: 223,
	name: 'Fletching table',
	expansion: 'advent_of_tcg',
	rarity: 'common',
	tokens: -1,
	description:
		'Completely useless! At the start of the game, shuffle a feather into your deck. Feather is also completely useless.\nWorth -1 tokens.',
	attachCondition: query.nothing,
	onCreate(game: GameModel, component: CardComponent) {
		game.components.new(
			CardComponent,
			Feather,
			game.components.new(DeckSlotComponent, component.player.entity, {
				position: 'random',
			}).entity,
		)
	},
}

export default FletchingTable
