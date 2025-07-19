import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {afterAttack} from '../../../types/priorities'
import {attach} from '../../defaults'
import {Attach} from '../../types'

const ImmortalityBed: Attach = {
	...attach,
	id: 'immortality_bed',
	numericId: 265,
	expansion: 'beds',
	name: 'Immortality Bed',
	rarity: 'ultra_rare',
	tokens: 5,
	description:
		'When the hermit this bed is attached to is knocked out, return the hermit to your hand and do not lose a life.\nThis card can not be returned to your hand from your discard pile.\nYou may only have one copy of this card in your deck.',
	sidebarDescriptions: [
		{
			type: 'glossary',
			name: 'knockout',
		},
	],
	attachCondition: query.every(attach.attachCondition, query.slot.active),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (!attack.isTargeting(component)) return
				let target = attack.target

				if (!target) return

				let targetHermit = target.getHermit()
				if (targetHermit?.isAlive()) return

				observer.unsubscribe(game.hooks.afterAttack)

				const newObserver = game.components.new(
					ObserverComponent,
					component.entity,
				)
				newObserver.subscribe(target.hooks.onKnockOut, (hermit) => {
					game.battleLog.addEntry(
						player.entity,
						`$e${component.props.name}$ returned $p${hermit.props.name}$ to $p{your|${player.playerName}'s}$ hand and restored one life`,
					)
					hermit.draw()
					player.lives++
					const prizeCard = player
						.getDrawPile()
						.sort(CardComponent.compareOrder)
						.at(0)
					if (prizeCard) {
						newObserver.subscribe(
							prizeCard.hooks.onChangeSlot,
							(_newSlot, oldSlot) => {
								newObserver.unsubscribe(prizeCard.hooks.onChangeSlot)
								if (prizeCard.prizeCard) {
									prizeCard.attach(oldSlot)
									prizeCard.prizeCard = false
								}
							},
						)
					}
					newObserver.unsubscribe(target.hooks.onKnockOut)
				})
			},
		)
	},
}

export default ImmortalityBed
