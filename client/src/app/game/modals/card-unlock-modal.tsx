import CardList from 'components/card-list'
import Modal from 'components/modal'
import {getRollFail, getRollResult} from 'logic/permits/permits-selectors'
import {useDispatch, useSelector} from 'react-redux'
import css from './game-modals.module.scss'
import Button from 'components/button'
import {clearResult} from 'logic/permits/permits-actions'

function CardUnlockModal() {
	const dispatch = useDispatch()
	const onModalClose = () => {
		dispatch(clearResult())
	}

	const rollFail = useSelector(getRollFail)
	const rollResult = useSelector(getRollResult)

	return (
		<Modal
			closeModal={onModalClose}
			title={rollFail === '' ? 'New Permit Unlocked!' : 'Permit Purchase Problem!'}
		>
			<div className={css.description}>
				<div className={css.card}>
					{rollResult ? (
						<CardList cards={[{cardId: rollResult?.card, cardInstance: ''}]} />
					) : (
						rollFail
					)}
				</div>{' '}
			</div>
			<div className={css.options}>
				<Button onClick={onModalClose}>Ok</Button>
			</div>
		</Modal>
	)
}

export default CardUnlockModal
