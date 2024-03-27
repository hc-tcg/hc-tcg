import {useDispatch, useSelector} from 'react-redux'
import css from './main-menu.module.scss'
import Button from 'components/button'
import MenuLayout from 'components/menu-layout/menu-layout'
import {PermitRarityT} from 'common/types/permits'
import {rollPermit} from 'logic/permits/permits-actions'
import {PERMIT_RANKS} from 'common/config'
import {getCredits, getRollFail, getRollResult} from 'logic/permits/permits-selectors'
import { CardUnlockModal } from '../game/modals'

type Props = {
	setMenuSection: (section: string) => void
}

export function PermitOffice({setMenuSection}: Props) {
	const dispatch = useDispatch()

	const credits = useSelector(getCredits)
	const rollFail = useSelector(getRollFail)
	const rollResult = useSelector(getRollResult)

	const handleBuyPermit = (permit: PermitRarityT) => {
		return () => {
			dispatch(rollPermit(permit))
		}
	}

	return (
		<>
			{
				rollFail != '' || rollResult ?
				<CardUnlockModal /> : <></>
			}
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
							<Button variant="default" id={css.privateCreate} onClick={handleBuyPermit('iron')}>
								Buy Iron Permit - {PERMIT_RANKS.prices.iron}{' '}
								<img height="25rem" src="images/effects/emerald.png" />
							</Button>
						</div>
						<div className={css.permitArea}>
							<img
								className={css.permitImage}
								src="/images/animations/permits/permit_gold.gif"
							></img>
							<Button variant="default" id={css.privateCreate} onClick={handleBuyPermit('gold')}>
								Buy Gold Permit - {PERMIT_RANKS.prices.gold}{' '}
								<img height="25rem" src="images/effects/emerald.png" />
							</Button>
						</div>
						<div className={css.permitArea}>
							<img
								className={css.permitImage}
								src="/images/animations/permits/permit_diamond.gif"
							></img>
							<Button variant="default" id={css.privateCreate} onClick={handleBuyPermit('diamond')}>
								Buy Diamond Permit - {PERMIT_RANKS.prices.diamond}{' '}
								<img height="25rem" src="images/effects/emerald.png" />
							</Button>
						</div>
					</div>
				</div>
				<div>Permit office - Your balance - {credits} Emeralds</div>
			</MenuLayout>
		</>
	)
}
