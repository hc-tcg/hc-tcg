import {useDispatch, useSelector} from 'react-redux'
import {joinQueue, createPrivateGame, joinPrivateGame} from 'logic/matchmaking/matchmaking-actions'
import {logout} from 'logic/session/session-actions'
import {getSession} from 'logic/session/session-selectors'
import css from './main-menu.module.scss'
import TcgLogo from 'components/tcg-logo'
import Beef from 'components/beef'
import Button from 'components/button'
import {VersionLinks} from 'components/link-container'
import {useState} from 'react'
import MenuLayout from 'components/menu-layout/menu-layout'

type Props = {
	setMenuSection: (section: string) => void
}

export function PermitOffice({setMenuSection}: Props) {
	const dispatch = useDispatch()

	const handleBuyIron = () => {}
	const handleBuyGold = () => {}
	const handleBuyDiamond = () => {}

	return (
		<>
			{/* <PackModal setOpen={showPackModal} onClose={() => setShowPackModal(!showPackModal)} /> */}
			<MenuLayout
				back={() => setMenuSection('mainmenu')}
				title="More"
				returnText="Main Menu"
				className={css.permitMenu}
			>
				<div>Permit office - Your balance - 200 Emeralds</div>
				<div className={css.permitBoxContainer}>
					<div className={css.permitBox}>
						<div className={css.permitArea}>
							<img
								className={css.permitImage}
								src="/images/animations/permits/permit_iron.gif"
							></img>
							<Button variant="default" id={css.privateCreate} onClick={handleBuyIron}>
								Buy Iron Permit - 1 <img height="25rem" src="images/effects/emerald.png" />
							</Button>
						</div>
						<div className={css.permitArea}>
							<img
								className={css.permitImage}
								src="/images/animations/permits/permit_gold.gif"
							></img>
							<Button variant="default" id={css.privateCreate} onClick={handleBuyGold}>
								Buy Gold Permit - 2 <img height="25rem" src="images/effects/emerald.png" />
							</Button>
						</div>
						<div className={css.permitArea}>
							<img
								className={css.permitImage}
								src="/images/animations/permits/permit_diamond.gif"
							></img>
							<Button variant="default" id={css.privateCreate} onClick={handleBuyDiamond}>
								Buy Diamond Permit - 3 <img height="25rem" src="images/effects/emerald.png" />
							</Button>
						</div>
					</div>
				</div>
			</MenuLayout>
		</>
	)
}
