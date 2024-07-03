import css from './main-menu.module.scss'
import {useDispatch} from 'react-redux'
import MenuLayout from 'components/menu-layout'
import Button from 'components/button'
import {createPrivateGame} from 'logic/matchmaking/matchmaking-actions'

type Props = {
	setMenuSection: (section: string) => void
}
function CreatePrivate({setMenuSection}: Props) {
	const dispatch = useDispatch()

	const handleNewPrivateGame = () => dispatch(createPrivateGame())
	const handleChallengeBoss = () => setMenuSection('boss-landing')

	return (
		<MenuLayout
			back={() => setMenuSection('mainmenu')}
			title="Create Private Game"
			returnText="Main Menu"
			className={css.settingsMenu}
		>
			<div className={css.settings}>
				<Button variant="stone" id={css.newPrivateGame} onClick={handleNewPrivateGame}>
					Create Invite-Only Game
				</Button>
				<Button variant="stone" id={css.bossLanding} onClick={handleChallengeBoss}>
					Challenge Evil X
				</Button>
			</div>
		</MenuLayout>
	)
}

export default CreatePrivate
