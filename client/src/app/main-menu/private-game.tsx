import Button from 'components/button'
import TcgLogo from 'components/tcg-logo'
import {localMessages, useMessageDispatch} from 'logic/messages'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}
function PrivateGame({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()

	const handleNewPrivateGame = () =>
		dispatch({type: localMessages.MATCHMAKING_PRIVATE_GAME_CREATE})
	const handleJoinPrivateGame = () =>
		dispatch({type: localMessages.MATCHMAKING_PRIVATE_GAME_JOIN})

	return (
		<div className={css.body}>
			<TcgLogo />
			<div className={css.privateGameContent}>
				<div className={css.settings}>
					<Button
						variant="stone"
						id={css.newPrivateGame}
						onClick={handleNewPrivateGame}
					>
						Create Private Game
					</Button>
				</div>
				<div className={css.settings}>
					<Button
						variant="stone"
						id={css.newPrivateGame}
						onClick={handleJoinPrivateGame}
					>
						Join Private Game
					</Button>
				</div>
				<Button
					type="button"
					variant="stone"
					onClick={() => setMenuSection('mainmenu')}
				>
					Cancel
				</Button>
			</div>
		</div>
	)
}

export default PrivateGame
