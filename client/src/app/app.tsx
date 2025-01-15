import Background from 'components/background'
import LostConnection from 'components/lost-connection'
import Toast from 'components/toast'
import {ToastContainer} from 'components/toast/toast'
import {CurrentTooltip} from 'components/tooltip/tooltip'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {
	getPlayerName,
	getSession,
	getToast,
	getTooltip,
} from 'logic/session/session-selectors'
import {getSocketStatus} from 'logic/socket/socket-selectors'
import {useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {useRouter} from './app-hooks'
import Deck from './deck'
import Game from './game'
import Login from './login'
import MainMenu from './main-menu'
import BossLanding from './main-menu/boss-landing'
import Credits from './main-menu/credits'
import DataSettings from './main-menu/data-settings'
import GameSettings from './main-menu/game-settings'
import HallOfFame from './main-menu/hall-of-fame'
import Settings from './main-menu/settings'
import MatchMaking from './match-making'

function App() {
	const section = useRouter()
	const dispatch = useMessageDispatch()
	const playerName = useSelector(getPlayerName)
	const socketStatus = useSelector(getSocketStatus)
	const connected = useSelector(getSession).connected
	const toastMessage = useSelector(getToast)
	const tooltip = useSelector(getTooltip)
	const settings = useSelector(getSettings)
	const [menuSection, setMenuSection] = useState<string>('mainmenu')
	let enableToast = false

	useEffect(() => {
		dispatch({
			type: localMessages.SOUND_SECTION_CHANGE,
			section: section,
		})
	}, [section])

	const router = () => {
		if (section === 'game') {
			return <Game />
		} else if (section === 'matchmaking') {
			return <MatchMaking />
		} else if (connected && playerName) {
			enableToast = true
			switch (menuSection) {
				case 'deck':
					return <Deck setMenuSection={setMenuSection} />
				case 'settings':
					return <Settings setMenuSection={setMenuSection} />
				case 'game-settings':
					return <GameSettings setMenuSection={setMenuSection} />
				case 'data-settings':
					return <DataSettings setMenuSection={setMenuSection} />
				case 'hall-of-fame':
					return <HallOfFame setMenuSection={setMenuSection} />

				case 'credits':
					return <Credits setMenuSection={setMenuSection} />
				case 'boss-landing':
					return <BossLanding setMenuSection={setMenuSection} />
				case 'mainmenu':
				default:
					return <MainMenu setMenuSection={setMenuSection} />
			}
		}
		return <Login />
	}

	const background = useMemo(() => {
		return (
			<Background
				panorama={settings.panorama}
				disabled={!settings.panoramaEnabled}
			/>
		)
	}, [settings.panoramaEnabled])

	return (
		<main>
			{background}
			{router()}
			{playerName && !socketStatus && <LostConnection />}
			{tooltip && (
				<CurrentTooltip
					tooltip={tooltip.tooltip}
					anchor={tooltip.anchor}
					tooltipHeight={tooltip.tooltipHeight}
					tooltipWidth={tooltip.tooltipWidth}
				/>
			)}
			{enableToast && (
				<ToastContainer>
					{toastMessage.map((toast, i) => {
						return (
							<Toast
								title={toast.toast.title}
								description={toast.toast.description}
								image={toast.toast.image}
								id={toast.id}
								key={i}
							/>
						)
					})}
				</ToastContainer>
			)}
		</main>
	)
}

export default App
