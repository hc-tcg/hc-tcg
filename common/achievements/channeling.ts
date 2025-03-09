import {
	ChainmailArmor,
	DiamondArmor,
	GoldArmor,
	IronArmor,
	NetheriteArmor,
} from '../cards/attach/armor'
import LightningRod from '../cards/attach/lightning-rod'
import Shield from '../cards/attach/shield'
import {CardComponent, StatusEffectComponent} from '../components'
import {WEAKNESS_DAMAGE} from '../const/damage'
import {STRENGTHS} from '../const/strengths'
import {ReadonlyAttackModel} from '../models/attack-model'
import {IgnoreAttachSlotEffect} from '../status-effects/ignore-attach'
import PoisonEffect from '../status-effects/poison'
import WeaknessEffect from '../status-effects/weakness'
import {afterAttack, beforeAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const ATTACH_REDUCTION_MAP = {
	[GoldArmor.id]: 10,
	[IronArmor.id]: 20,
	[DiamondArmor.id]: 20,
	[NetheriteArmor.id]: 20,
	[Shield.id]: 60,
}

const Channeling: Achievement = {
	...achievement,
	numericId: 22,
	id: 'channeling',
	levels: [
		{
			name: 'Channeling',
			steps: 1,
			description:
				'Redirect KO worthy damage away from your active Hermit with Lightning Rod.',
		},
	],
	onGameStart(game, player, component, observer) {
		const {opponentPlayer} = player

		let damageRedirected = 0,
			attachReduction = 0,
			activeRow = player.activeRow

		observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
			damageRedirected = 0
			attachReduction = 0
			activeRow = player.activeRow
		})

		/** Modified logic from `common/utils/attacks.ts > createWeaknessAttack` */
		function redirectedWeakness(attack: ReadonlyAttackModel): boolean {
			if (attack.createWeakness === 'never') return false
			if (!attack.isType('primary', 'secondary')) return false
			const attacker = attack.attacker
			if (!(attacker instanceof CardComponent && attacker.isHermit()))
				return false
			const target = activeRow?.getHermit()
			if (!target?.isHermit()) return false
			const testAttack = game
				.newAttack({
					attacker: attacker.entity,
					target: activeRow?.entity,
					type: attack.type,
				})
				.addDamage(attacker.entity, attack.getDamage())
			testAttack.createWeakness = attack.createWeakness
			game.hooks.beforeAttack.callSome([testAttack], (observerEntity) => {
				const wrappingComponent = game.components.get(
					game.components.get(observerEntity)?.wrappingEntity || null,
				)
				return (
					wrappingComponent instanceof StatusEffectComponent &&
					wrappingComponent.props.id === WeaknessEffect.id
				)
			})
			return (
				testAttack.createWeakness === 'always' ||
				STRENGTHS[attacker.props.type].includes(target.props.type)
			)
		}

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.RESOLVE_AFTER_MODIFIERS,
			(attack) => {
				if (attack.player.entity !== opponentPlayer.entity) return
				if (!activeRow) return
				const history = attack.getHistory('redirect').find((history) => {
					let creator = game.components.get(history.source as any)
					if (!(creator instanceof CardComponent)) return false
					return creator.props.id === LightningRod.id
				})
				if (!history || history.value.from !== activeRow.entity) return
				let attackDamage = attack.calculateDamage()

				const playerAttach = activeRow.getAttach()
				if (
					playerAttach &&
					!activeRow.getHermit()?.getStatusEffect(IgnoreAttachSlotEffect)
				) {
					if (
						!attachReduction &&
						playerAttach.props.id in ATTACH_REDUCTION_MAP
					) {
						attachReduction = ATTACH_REDUCTION_MAP[playerAttach.props.id]
					}
					if (attack.isType('effect')) {
						if (playerAttach.props.id === DiamondArmor.id) {
							attackDamage -= 20
						} else if (
							playerAttach.props.id === NetheriteArmor.id ||
							playerAttach.props.id === ChainmailArmor.id
						)
							return
					}
				}
				if (attackDamage <= 0) return
				if (redirectedWeakness(attack)) {
					attackDamage += WEAKNESS_DAMAGE
				}
				damageRedirected += attackDamage
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				if (!activeRow?.health || game.currentPlayerEntity === player.entity)
					return
				if (
					attack.attacker instanceof StatusEffectComponent &&
					attack.attacker.props.id === PoisonEffect.id
				) {
					// Poison should not determine if redirected damage was "KO worthy"
					damageRedirected = 0
				}
				if (damageRedirected - attachReduction < activeRow.health) return
				component.incrementGoalProgress({goal: 0})
				damageRedirected = 0
			},
		)
	},
}

export default Channeling
