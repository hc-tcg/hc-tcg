import Button from 'components/button'
import MenuLayout from 'components/menu-layout'
import {localMessages, useMessageDispatch} from 'logic/messages'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}
function CreatePrivate({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()

	const handleNewPrivateGame = () =>
		dispatch({type: localMessages.MATCHMAKING_PRIVATE_GAME_CREATE})
	const handleChallengeBoss = () => setMenuSection('boss-landing')

	return (
		<MenuLayout
			back={() => setMenuSection('mainmenu')}
			title="Create Private Game"
			returnText="Main Menu"
			className={css.settingsMenu}
		>
			<div className={css.settings}>
				<Button
					variant="stone"
					id={css.newPrivateGame}
					onClick={handleNewPrivateGame}
				>
					Create Invite-Only Game
				</Button>
				<Button
					variant="stone"
					id={css.bossLanding}
					onClick={handleChallengeBoss}
				>
					Challenge Evil X
				</Button>
			</div>
		</MenuLayout>
	)
}

export default CreatePrivate
