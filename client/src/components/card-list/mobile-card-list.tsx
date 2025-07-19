import {LocalCardInstance} from 'common/types/server-requests'
import MobileCardComponent from 'components/card/mobile-card-component'
import css from './card-list.module.scss'

type CardListProps = {
	cards: Array<LocalCardInstance>
	tooltipAboveModal?: boolean
	onSubtractionClick?: (card: LocalCardInstance) => void
	onAdditionClick?: (card: LocalCardInstance) => void
	small: boolean
}

const MobileCardList = (props: CardListProps) => {
	const {onSubtractionClick, onAdditionClick, cards, tooltipAboveModal, small} =
		props

	const cardsWithAmounts: Array<Array<LocalCardInstance>> = []
	cards.forEach((card) => {
		const item = cardsWithAmounts.find((c) => c[0].id === card.id)
		if (item) return
		cardsWithAmounts.push(cards.filter((c) => c.id === card.id))
	})

	return (
		<div className={small ? css.mobileCardListSmall : css.mobileCardList}>
			{cardsWithAmounts.map((cards) => {
				return (
					<MobileCardComponent
						cards={cards}
						onSubtractionClick={
							onSubtractionClick
								? () => onSubtractionClick(cards[0])
								: undefined
						}
						onAdditionClick={
							onAdditionClick ? () => onAdditionClick(cards[0]) : undefined
						}
						key={cards[0].entity}
						tooltipAboveModal={tooltipAboveModal}
						small={small}
					></MobileCardComponent>
				)
			})}
		</div>
	)
}

export default MobileCardList
