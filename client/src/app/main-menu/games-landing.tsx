import Button from 'components/button'
import MenuLayout from 'components/menu-layout'
import {localMessages, useMessageDispatch} from 'logic/messages'
import css from './games-landing.module.scss'
import HermitButton from 'components/hermit-button'
import {useSelector} from 'react-redux'
import {getSession} from 'logic/session/session-selectors'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {validateDeck} from 'common/utils/validation'

type Props = {
	setMenuSection: (section: string) => void
}

function GameLanding({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()
	const {playerDeck} = useSelector(getSession)
	const databaseInfo = useSelector(getLocalDatabaseInfo)
	const deck = databaseInfo?.decks.find((deck) => deck.code === playerDeck)

	const checkForValidation = (): boolean => {
		if (!playerDeck || !deck) {
			dispatch({
				type: localMessages.TOAST_OPEN,
				open: true,
				title: 'You currently have no active deck selected!',
				description: 'Go to the deck builder to select an active deck.',
				image: '/images/types/type-any.png',
			})
			return false
		}
		const validation = validateDeck(deck.cards.map((card) => card.props))
		if (validation.valid) return true
		dispatch({
			type: localMessages.TOAST_OPEN,
			open: true,
			title: 'Your deck is not valid!',
			description: `The deck "${deck.name}" does not meet validation requirements.`,
			image: `/images/types/type-${deck.icon}.png`,
		})
		return false
	}

	const handeJoinQueue = () => {
		const valid = checkForValidation()
		if (!valid) return
		dispatch({type: localMessages.MATCHMAKING_QUEUE_JOIN})
		dispatch({type: localMessages.EVERY_TOAST_CLOSE})
	}
	const handlePrivateGame = () => {
		const valid = checkForValidation()
		if (!valid) return
		dispatch({type: localMessages.EVERY_TOAST_CLOSE})
		dispatch({type: localMessages.MATCHMAKING_PRIVATE_GAME_LOBBY})
	}
	const handleSoloGame = () => {
		const valid = checkForValidation()
		if (!valid) return
		setMenuSection('boss-landing')
	}

	return (
		<>
			<MenuLayout
				back={() => setMenuSection('mainmenu')}
				title="Play"
				returnText="Main Menu"
				className={css.gamesPage}
			>
				<div className={css.gamesLanding}>
					<div>
						<div className={css.gamesLandingButtons}>
							<HermitButton
								image={'vintagebeef'}
								background={'beef'}
								title={'Public Game'}
								description={'Challenge a random player to a game of HC-TCG!'}
								onClick={handeJoinQueue}
							></HermitButton>
							<HermitButton
								image={'cubfan135'}
								background={'cubfan'}
								title={'Private Game'}
								description={'Play against your friends in a private lobby.'}
								onClick={handlePrivateGame}
							></HermitButton>
							<HermitButton
								image={'evilxisuma'}
								background={'evilx'}
								title={'Boss Battle'}
								description={'Challenge Evil X to a fight. Blah Blah Blah Blah'}
								onClick={handleSoloGame}
							></HermitButton>
						</div>
					</div>
				</div>
				<div className={css.bottomButtons}>
					<Button className={css.bigButton} variant="primary">
						Select a Deck
					</Button>
					<Button className={css.bigButton}>How to Play</Button>
				</div>
			</MenuLayout>
		</>
	)
}

export default GameLanding
