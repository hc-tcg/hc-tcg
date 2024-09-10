import {
	PlayerComponent,
	ObserverComponent,
	StatusEffectComponent,
	CardComponent,
	RowComponent
} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import { getGameState } from '../utils/state-gen'
import '../cards/index'
import {Counter, statusEffect} from './status-effect'
import { targetEntity } from '../components/query/effect'
import { CARDS } from '../cards'
import { Hermit } from '../cards/base/types'
import { TypeT } from '../types/cards'

const WeaknessEffect: Counter<CardComponent> = {
	...statusEffect,
	icon: 'weakness',
	name: 'Weakness',
	description: "[weakType] currently has modified weakness to [strongType].",
	counter: 3,
	counterType: 'turns',
	onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		const { player } = target

		if (!effect.counter) effect.counter = this.counter

		const weakHermit = _game.components.find(
			CardComponent,
			query.card.rowEntity(player.activeRowEntity),
			query.card.isHermit,
		)

		if (!weakHermit?.isHermit()) return null

		const weakType = weakHermit.props.type

		observer.subscribe(player.hooks.onTurnEnd, () => {
			if (!effect.counter) return
			effect.counter--

			if (effect.counter === 0) effect.remove()
		})
		
		observer.subscribe(player.hooks.beforeDefence, (attack) => {
			if (!target.slot.inRow()) return
			if (
				attack.targetEntity !== target.slot.rowEntity ||
				attack.createWeakness === 'never'
			)
				return
			attack.createWeakness = 'always'
		})
	},
}

export default WeaknessEffect
