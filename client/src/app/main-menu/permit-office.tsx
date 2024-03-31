import {useDispatch, useSelector} from 'react-redux'
import css from './main-menu.module.scss'
import Button from 'components/button'
import MenuLayout from 'components/menu-layout/menu-layout'
import {PermitRarityT} from 'common/types/permits'
import {rollPermit} from 'logic/permits/permits-actions'
import {PERMIT_RANKS} from 'common/config'
import {getCredits, getRollFail, getRollResult} from 'logic/permits/permits-selectors'
import {CardUnlockModal, CreditValuesModal} from '../game/modals'
import {useState} from 'react'

type Props = {
	setMenuSection: (section: string) => void
}

export function PermitOffice({setMenuSection}: Props) {
	const dispatch = useDispatch()

	const credits = useSelector(getCredits)
	const rollFail = useSelector(getRollFail)
	const rollResult = useSelector(getRollResult)

	const [showMethods, setShowMethods] = useState(false)

	const handleBuyPermit = (permit: PermitRarityT) => {
		return () => {
			dispatch(rollPermit(permit))
		}
	}

	return (
		<>
			{rollFail != '' || rollResult ? <CardUnlockModal /> : <></>}
			{showMethods ? <CreditValuesModal closeModal={() => setShowMethods(false)} /> : <></>}
			<MenuLayout
				back={() => setMenuSection('mainmenu')}
				title="Permit Office"
				returnText="Main Menu"
				className={css.permitMenu}
			>
				<div className={css.permitBackground}></div>
				<div className={css.permitBoxContainer}>
					<div className={css.permitBox}>
						<div className={css.permitArea}>
							<img
								className={css.permitImage}
								src="/images/animations/permits/permit_iron.gif"
							></img>
							<Button variant="default" className={css.buyPermit} onClick={handleBuyPermit('iron')}>
								Buy Iron Permit - {PERMIT_RANKS.prices.iron}
							</Button>
						</div>
						<div className={css.permitArea}>
							<img
								className={css.permitImage}
								src="/images/animations/permits/permit_gold.gif"
							></img>
							<Button variant="default" className={css.buyPermit} onClick={handleBuyPermit('gold')}>
								Buy Gold Permit - {PERMIT_RANKS.prices.gold}
							</Button>
						</div>
						<div className={css.permitArea}>
							<img
								className={css.permitImage}
								src="/images/animations/permits/permit_diamond.gif"
							></img>
							<Button
								variant="default"
								className={css.buyPermit}
								onClick={handleBuyPermit('diamond')}
							>
								Buy Diamond Permit - {PERMIT_RANKS.prices.diamond}
							</Button>
						</div>
					</div>
				</div>
				<div className={css.permitOfficeInstructions}>
					<p>
						Welcome to the Permit Office! Your current balance is <b>{credits} diamonds</b>.
					</p>
					<br></br>
					<p>
						Here, you can spend your diamonds you earn in battle on the permits to play new cards.
						You earn more diamonds by winning, and you can also earn more by completing various
						tasks while playing. In the deck builder, diamond permit cards are limited to 1 copy of
						each, but all cards of other permits have no restrictions on how they can be played.
					</p>
					<br></br>
					<Button variant="default" onClick={() => setShowMethods(!showMethods)}>
						Show Tasks
					</Button>
				</div>
			</MenuLayout>
		</>
	)
}
