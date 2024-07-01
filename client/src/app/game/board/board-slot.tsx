import classnames from 'classnames'
import {CARDS} from 'common/cards'
import Card from 'components/card'
import {CardT, RowState} from 'common/types/game-state'
import css from './board.module.scss'
import HermitCard from 'common/cards/base/hermit-card'
import EffectCard from 'common/cards/base/effect-card'
import SingleUseCard from 'common/cards/base/single-use-card'
import ItemCard from 'common/cards/base/item-card'
import HealthCard from 'common/cards/base/health-card'
import {StatusEffectT} from 'common/types/game-state'
import StatusEffect from 'components/status-effects/status-effect'
import {STATUS_EFFECT_CLASSES} from 'common/status-effects'
import {SlotTypeT} from 'common/types/cards'
import {useSelector} from 'react-redux'
import {
	getCardsCanBePlacedIn,
	getGameState,
	getPickRequestPickableSlots,
	getSelectedCard,
} from 'logic/game/game-selectors'
import {getLocalPlayerState} from 'server/src/utils/state-gen'
import {slot} from 'common/slot'

export type SlotProps = {
	type: SlotTypeT
	rowIndex?: number
	index?: number
	playerId: string
	onClick?: () => void
	card: CardT | null
	rowState?: RowState
	active?: boolean
	cssId?: string
	statusEffects: Array<StatusEffectT>
}
const Slot = ({
	type,
	rowIndex,
	index,
	playerId,
	onClick,
	card,
	rowState,
	active,
	cssId,
	statusEffects,
}: SlotProps) => {
	const cardsCanBePlacedIn = useSelector(getCardsCanBePlacedIn)
	const pickRequestPickableCard = useSelector(getPickRequestPickableSlots)
	const selectedCard = useSelector(getSelectedCard)
	const localGameState = useSelector(getGameState)

	let cardInfo = card?.cardId
		? (CARDS[card.cardId] as HermitCard | EffectCard | SingleUseCard | ItemCard | HealthCard)
		: null
	if (type === 'health' && rowState?.health) {
		cardInfo = new HealthCard({
			id: 'health',
			name: 'Health Card',
			rarity: 'common',
			health: rowState.health,
		})
	}

	const renderStatusEffects = (cleanedStatusEffects: StatusEffectT[]) => {
		return (
			<div className={css.statusEffectContainer}>
				{cleanedStatusEffects.map((a) => {
					const statusEffect = STATUS_EFFECT_CLASSES[a.statusEffectId]
					if (!statusEffect || !statusEffect.visible) return null
					if (statusEffect.damageEffect == true) return null
					return <StatusEffect statusEffect={statusEffect} duration={a.duration} />
				})}
			</div>
		)
	}
	const renderDamageStatusEffects = (cleanedStatusEffects: StatusEffectT[] | null) => {
		return (
			<div className={css.damageStatusEffectContainer}>
				{cleanedStatusEffects
					? cleanedStatusEffects.map((a) => {
							const statusEffect = STATUS_EFFECT_CLASSES[a.statusEffectId]
							if (!statusEffect || !statusEffect.visible) return null
							if (statusEffect.damageEffect == false) return null
							return <StatusEffect statusEffect={statusEffect} />
						})
					: null}
			</div>
		)
	}

	const hermitStatusEffects = Array.from(
		new Set(
			statusEffects
				.filter((a) => rowState?.hermitCard && a.targetInstance == rowState.hermitCard.cardInstance)
				.map((a) => a) || []
		)
	)
	const effectStatusEffects = Array.from(
		new Set(
			statusEffects.filter(
				(a) => rowState?.effectCard && a.targetInstance == rowState.effectCard.cardInstance
			) || []
		)
	)
	const frameImg = type === 'hermit' ? '/images/game/frame_glow.png' : '/images/game/frame.png'

	const getPickableSlots = () => {
		if (pickRequestPickableCard !== null && pickRequestPickableCard !== undefined) {
			return pickRequestPickableCard
		}

		if (!cardsCanBePlacedIn || !selectedCard) return []

		return cardsCanBePlacedIn.filter(
			([card, _]) => card?.cardInstance == selectedCard.cardInstance
		)[0][1]
	}

	const getIsPickable = () => {
		for (const slot of getPickableSlots()) {
			if (
				slot.type === type &&
				slot.rowIndex == rowIndex &&
				slot.index == index &&
				slot.playerId == playerId
			) {
				return true
			}
		}
		return false
	}

	let isPickable = false
	let somethingPickable = false
	let isClickable = false

	if (
		(localGameState && localGameState.playerId === localGameState.turn.currentPlayerId) ||
		pickRequestPickableCard !== null
	) {
		isPickable = getIsPickable()
		somethingPickable = selectedCard !== null || pickRequestPickableCard !== null
		isClickable = somethingPickable && isPickable
	}

	if (card !== null) {
		isClickable = true
	}

	return (
		<div
			onClick={isClickable ? onClick : () => {}}
			id={css[cssId || 'slot']}
			className={classnames(css.slot, {
				[css.pickable]: isPickable && somethingPickable,
				[css.unpickable]: !isPickable && somethingPickable,
				[css.available]: isClickable,
				[css[type]]: true,
				[css.empty]: !cardInfo,
				[css.hermitSlot]: type == 'hermit',
				[css.afk]: !active && type !== 'single_use',
			})}
		>
			{cardInfo ? (
				<div className={css.cardWrapper}>
					<Card card={cardInfo} />
					{type === 'health'
						? renderStatusEffects(hermitStatusEffects)
						: type === 'effect'
							? renderStatusEffects(effectStatusEffects)
							: null}
					{type === 'health'
						? renderDamageStatusEffects(hermitStatusEffects)
						: type === 'effect'
							? renderDamageStatusEffects(effectStatusEffects)
							: renderDamageStatusEffects(null)}
				</div>
			) : type === 'health' ? null : (
				<img draggable="false" className={css.frame} src={frameImg} />
			)}
		</div>
	)
}

export default Slot
