import assert from 'assert'
import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {PlayerEntity} from '../../entities'
import {GameModel} from '../../models/game-model'
import {GameValue} from '../../models/game-value'
import LooseShellEffect from '../../status-effects/loose-shell'
import {beforeAttack, onTurnEnd} from '../../types/priorities'
import {attach} from '../defaults'
import {Attach} from '../types'

type ActiveInfo = {
	readonly hermit: CardComponent
	readonly stage: HermitState
}

type HermitState = 'activated' | 'defend-then-discard' | 'too-late'

type InstanceState = 'activated' | 'defend-then-discard' | 'inactive'

const lastActiveHermit = new GameValue<
	Record<PlayerEntity, ActiveInfo | undefined>
>(() => {
	return {}
})

const startProtectionEntry = (hermit: CardComponent) =>
	`$p${hermit.props.name}$ is now protected by $e${TurtleShell.name}$`
const endProtectionEntry = (hermit: CardComponent, rowIndex: number) =>
	`$p${hermit.props.name} (${rowIndex + 1})$ is no longer protected by $e${TurtleShell.name}$`

const TurtleShell: Attach = {
	...attach,
	id: 'turtle_shell',
	numericId: 130,
	name: 'Turtle Shell',
	expansion: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
	description:
		"Attach to any of your AFK Hermits. On that Hermit's first turn after becoming active, any damage done by your opponent to that Hermit is prevented, and then this card is discarded.",
	attachCondition: query.every(
		attach.attachCondition,
		query.not(query.slot.active),
	),
	onCreate(game: GameModel, component: CardComponent) {
		if (game.id in lastActiveHermit.values) return
		lastActiveHermit.set(game, {})

		const newObserver = game.components.new(ObserverComponent, component.entity)

		// Keeps track of when hermits are made active for all Turtle Shells to reference when attached
		game.components.filter(PlayerComponent).forEach((player) => {
			newObserver.subscribe(
				player.hooks.onActiveRowChange,
				(oldHermit, newHermit) => {
					if (oldHermit !== null) {
						if (
							lastActiveHermit.get(game)[player.entity]?.hermit.entity ===
							newHermit.entity
						) {
							// Ladder was used to move active hermit to new row
							return
						}
					}
					lastActiveHermit.get(game)[player.entity] = {
						hermit: newHermit,
						stage: 'activated',
					}
				},
			)

			newObserver.subscribe(player.hooks.onTurnStart, () => {
				game.components.filter(PlayerComponent).forEach((player) => {
					const activeHermit = player.getActiveHermit()
					if (activeHermit === null) {
						delete lastActiveHermit.get(game)[player.entity]
						return
					}

					const activeInfo = lastActiveHermit.get(game)[player.entity]
					assert(activeInfo)
					switch (activeInfo.stage) {
						case 'activated':
							lastActiveHermit.get(game)[player.entity] = {
								hermit: activeHermit,
								stage: 'defend-then-discard',
							}
							break
						case 'defend-then-discard':
							lastActiveHermit.get(game)[player.entity] = {
								hermit: activeHermit,
								stage: 'too-late',
							}
							break
					}
				})
			})
		})
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component
		/** Keeps track of whether Turtle Shell is protecting its row and if it should be discarded */
		let state: InstanceState = 'inactive'

		if (query.slot.active(game, component.slot)) {
			// Only possible when this card is moved from the opponent's board. For example, Emerald or Grian's Borrow
			const activeInfo = lastActiveHermit.get(game)[player.entity]
			if (activeInfo) {
				if (activeInfo.stage === 'too-late') {
					game.components
						.new(StatusEffectComponent, LooseShellEffect, component.entity)
						.apply(activeInfo.hermit.entity)
				} else {
					state = activeInfo.stage

					game.battleLog.addEntry(
						player.entity,
						startProtectionEntry(activeInfo.hermit),
					)
				}
			}
		}

		observer.subscribe(
			player.hooks.onActiveRowChange,
			(oldActiveHermit, newActiveHermit) => {
				const myHermitCard = game.components.find(
					CardComponent,
					query.card.isHermit,
					query.card.row(query.row.hasCard(component.entity)),
				)

				if (!myHermitCard) return

				if (newActiveHermit.entity === myHermitCard.entity) {
					const activeInfo = lastActiveHermit.get(game)[player.entity]
					if (activeInfo && activeInfo.hermit.entity === myHermitCard.entity) {
						if (activeInfo.stage === 'too-late') {
							game.components
								.new(StatusEffectComponent, LooseShellEffect, component.entity)
								.apply(activeInfo.hermit.entity)
							return
						}
						if (state !== 'defend-then-discard') {
							if (state === 'inactive')
								game.battleLog.addEntry(
									player.entity,
									startProtectionEntry(activeInfo.hermit),
								)
							state = activeInfo.stage
						}
					}
				} else if (
					oldActiveHermit?.entity === myHermitCard.entity &&
					state !== 'defend-then-discard'
				) {
					game.components
						.find(
							StatusEffectComponent,
							query.effect.is(LooseShellEffect),
							(_game, effect) => effect.creatorEntity === component.entity,
							query.not(query.effect.targetEntity(null)),
						)
						?.remove()
					const activeInfo = lastActiveHermit.get(game)[player.entity]
					if (
						activeInfo &&
						activeInfo.hermit.slot.inRow() &&
						state !== 'inactive'
					)
						game.battleLog.addEntry(
							player.entity,
							endProtectionEntry(
								activeInfo.stage === 'activated' &&
									game.currentPlayerEntity === player.opponentPlayer.entity
									? myHermitCard
									: activeInfo.hermit,
								activeInfo.hermit.slot.row.index,
							),
						)
					state = 'inactive'
				}
			},
		)

		observer.subscribe(component.hooks.onChangeSlot, (newSlot) => {
			if (query.slot.active(game, newSlot)) return
			game.components
				.find(
					StatusEffectComponent,
					query.effect.is(LooseShellEffect),
					(_game, effect) => effect.creatorEntity === component.entity,
					query.not(query.effect.targetEntity(null)),
				)
				?.remove()
			if (state !== 'inactive') {
				const hermit = lastActiveHermit.get(game)[player.entity]?.hermit
				if (hermit && hermit.slot.inRow())
					game.battleLog.addEntry(
						player.entity,
						endProtectionEntry(hermit, hermit.slot.row.index),
					)
			}
			state = 'inactive'
		})

		observer.subscribeWithPriority(
			player.opponentPlayer.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (state === 'defend-then-discard') {
					if (component.slot.inRow()) {
						game.battleLog.addEntry(
							player.entity,
							`$p${TurtleShell.name} (${component.slot.row.index + 1})$ discarded itself`,
						)
					}
					component.discard()
				}
			},
		)

		observer.subscribe(player.opponentPlayer.hooks.onTurnStart, () => {
			if (state === 'activated') {
				state = 'defend-then-discard'
			}
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.EFFECT_BLOCK_DAMAGE,
			(attack) => {
				if (!component.slot.inRow()) return
				if (state === 'inactive' || game.currentPlayerEntity === player.entity)
					return

				if (!attack.isTargeting(component)) return
				// Do not block backlash or status-effect attacks
				if (attack.isBacklash || attack.isType('status-effect')) return

				if (attack.getDamage() > 0) {
					// Block all damage
					attack
						.multiplyDamage(component.entity, 0)
						.lockDamage(component.entity)
				}
			},
		)
	},
	onDetach(game, component) {
		game.components
			.filter(
				StatusEffectComponent,
				query.effect.is(LooseShellEffect),
				(_game, effect) => effect.creatorEntity === component.entity,
				query.not(query.effect.targetEntity(null)),
			)
			.forEach((effect) => effect.remove())
	},
}

export default TurtleShell
