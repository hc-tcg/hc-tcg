import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {HermitAttackType} from '../../../types/attack'
import {MockedAttack, setupMockCard} from '../../../utils/attacks'
import ArmorStand from '../../alter-egos/effects/armor-stand'
import {InstancedValue} from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const pickCondition = query.every(
	query.slot.opponent,
	query.slot.hermit,
	query.not(query.slot.empty),
	query.not(query.slot.has(ArmorStand)),
)

const mockedAttacks = new InstancedValue<MockedAttack | null>(() => null)

const RendogRare: Hermit = {
	...hermit,
	id: 'rendog_rare',
	numericId: 87,
	name: 'Rendog',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	type: 'builder',
	health: 250,
	primary: {
		name: "Comin' At Ya",
		cost: ['builder'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Role Play',
		cost: ['builder', 'builder', 'builder'],
		damage: 0,
		power: "Use an attack from any of your opponent's Hermits.",
	},
	getAttack(
		game: GameModel,
		component: CardComponent,
		hermitAttackType: HermitAttackType,
	) {
		if (hermitAttackType !== 'secondary')
			return hermit.getAttack.call(this, game, component, hermitAttackType)

		const mockedAttack = mockedAttacks.get(component)
		if (!mockedAttack) return null

		let newAttack = mockedAttack.getAttack()
		if (!newAttack) return null

		const attackName = mockedAttack.attackName
		newAttack.updateLog(
			(values) =>
				`${values.attacker} ${values.coinFlip ? values.coinFlip + ', then ' : ''} attacked ${
					values.target
				} with $v${mockedAttack.hermitName}'s ${attackName}$ for ${values.damage} damage`,
		)
		return newAttack
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(
			player.hooks.getAttackRequests,
			(activeInstance, hermitAttackType) => {
				// Make sure we are attacking
				if (activeInstance.entity !== component.entity) return
				// Only activate power on secondary attack
				if (hermitAttackType !== 'secondary') return

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: "Pick one of your opponent's Hermits",
					canPick: pickCondition,
					onResult: (pickedSlot) => {
						let pickedCard = pickedSlot.getCard() as CardComponent<Hermit>
						if (!pickedCard) return

						game.addModalRequest({
							player: player.entity,
							modal: {
								type: 'copyAttack',
								name: 'Rendog: Choose an attack to copy',
								description:
									"Which of the Hermit's attacks do you want to copy?",
								hermitCard: pickedCard.entity,
								cancelable: true,
							},
							onResult: (modalResult) => {
								if (!modalResult) return
								if (modalResult.cancel) {
									// Cancel this attack so player can choose a different hermit to imitate
									game.state.turn.currentAttack = null
									game.cancelPickRequests()
									return
								}

								// Store the chosen attack to copy
								mockedAttacks.set(
									component,
									setupMockCard(game, component, pickedCard, modalResult.pick),
								)

								return
							},
							onTimeout: () => {
								mockedAttacks.set(
									component,
									setupMockCard(game, component, pickedCard, 'primary'),
								)
							},
						})
					},
					onTimeout() {
						// We didn't pick someone to imitate so do nothing
					},
				})
			},
		)

		observer.subscribe(player.hooks.blockedActions, (blockedActions) => {
			// Block "Role Play" if there are not opposing Hermit cards other than rare Ren(s)
			if (!game.components.exists(SlotComponent, pickCondition))
				blockedActions.push('SECONDARY_ATTACK')
			return blockedActions
		})
	},
	onDetach(
		_game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		mockedAttacks.clear(component)
	},
}

export default RendogRare
