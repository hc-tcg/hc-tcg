import {Modal} from 'components/modal'
import css from './import-export.module.scss'
import {LocalCardInstance} from 'common/types/server-requests'
import Card from 'components/card'
import classNames from 'classnames'

type Props = {
	setOpen: boolean
	cards: Array<LocalCardInstance>
	onClose: () => void
}

export function ScreenshotDeckModal({setOpen, cards, onClose}: Props) {
	return (
		<Modal
			title="Full Deck"
			setOpen={setOpen}
			onClose={onClose}
			veryWide={true}
		>
			<div className={css.fullDeckContainer}>
				<div
					className={classNames(css.cardListContainer, css.showOnMobile)}
					style={{
						gridTemplateRows: `repeat(${7}, 14vw)`,
						gridTemplateColumns: `repeat(${Math.ceil(cards.length / 7)}, 14vw)`,
					}}
				>
					{cards.map((card) => {
						return (
							<Card
								card={card.props}
								displayTokenCost={false}
								key={card.entity}
								tooltipAboveModal={true}
							/>
						)
					})}
				</div>
				<div
					className={classNames(css.cardListContainer, css.hideOnMobile)}
					style={{
						gridTemplateRows: `repeat(${5}, 8vw)`,
						gridTemplateColumns: `repeat(${Math.ceil(cards.length / 5)}, 8vw)`,
					}}
				>
					{cards.map((card) => {
						return (
							<Card
								card={card.props}
								displayTokenCost={false}
								key={card.entity}
								tooltipAboveModal={true}
							/>
						)
					})}
				</div>
			</div>
		</Modal>
	)
}
