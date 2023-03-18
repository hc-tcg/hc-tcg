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
			attachReq: {target: 'player', type: ['health']},
		}
	}

	const ailments = Array.from(
		new Set(rowState?.ailments.map((a) => a.id) || [])
	)
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
						ailments.map((id) => {
							const cssClass = css[id + 'Ailment']
							console.log({cssClass})
							if (!cssClass) return null
							return <div key={id} className={cssClass} />
						})}
				</>
			) : (
				<img draggable="false" className={css.frame} src="/images/frame.png" />
			)}
		</div>
	)
}

export default Slot
