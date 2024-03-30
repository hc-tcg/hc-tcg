import CardList from 'components/card-list'
import Modal from 'components/modal'
import {getRollFail, getRollResult} from 'logic/permits/permits-selectors'
import {useDispatch, useSelector} from 'react-redux'
import css from './game-modals.module.scss'
import Button from 'components/button'
import {clearResult} from 'logic/permits/permits-actions'
import {CREDIT_VALUES} from 'common/config'

type Props = {
	closeModal: () => void
}

function CreditValuesModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const onModalClose = () => {
		closeModal()
	}

	return (
		<Modal closeModal={onModalClose} title={'Ways to earn diamonds'}>
			<div className={css.description}>
				<div>
					{Object.keys(CREDIT_VALUES).map((method) => {
						return (
							<div className={css.creditMethod}>
								<span>{(CREDIT_VALUES as Record<string, any>)[method].name}</span>
								<span>{(CREDIT_VALUES as Record<string, any>)[method].value}</span>
							</div>
						)
					})}
				</div>
			</div>
			<div className={css.options}>
				<Button onClick={onModalClose}>Ok</Button>
			</div>
		</Modal>
	)
}

export default CreditValuesModal
