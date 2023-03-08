import classnames from 'classnames'
import CARDS from 'server/cards'
import Card from 'components/card'
import {SlotTypeT} from 'common/types/pick-process'
import {CardT} from 'common/types/game-state'
import {RowState} from 'common/types/game-state'
import css from './board.module.css'

export type SlotProps = {
	type: SlotTypeT
	onClick?: () => void
	card: CardT | null
	rowState?: RowState
	active?: boolean
}
const Slot = ({type, onClick, card, rowState, active}: SlotProps) => {
	let cardInfo = card?.cardId ? CARDS[card.cardId] : null
	if (type === 'health' && rowState?.health) {
		cardInfo = {
			name: rowState.health + ' Health',
			rarity: 'common',
			type: 'health',
			health: rowState.health,
			id: 'health_' + rowState.health,
		}
	}
	return (
		<div
			onClick={onClick}
			className={classnames(css.slot, {
				[css.available]: !!onClick,
				[css[type]]: true,
				[css.empty]: !cardInfo,
				[css.afk]: cardInfo?.type === 'hermit' && !active,
			})}
		>
			{cardInfo ? (
				<>
					<Card card={cardInfo} />
					{type === 'health' &&
					rowState?.ailments.find((a) => a.id === 'fire') ? (
						<div className={css.fireAilment} />
					) : null}

					{type === 'health' &&
					rowState?.ailments.find((a) => a.id === 'poison') ? (
						<div className={css.poisonAilment} />
					) : null}

					{type === 'health' &&
					rowState?.ailments.find((a) => a.id === 'sleeping') ? (
						<div className={css.sleepingAilment} />
					) : null}
				</>
			) : (
				<img draggable="false" className={css.frame} src="/images/frame.png" />
			)}
		</div>
	)
}

export default Slot
