import Background from 'components/background'
import {CurrentDropdown} from 'components/dropdown/dropdown'
import LostConnection from 'components/lost-connection'
import Toast from 'components/toast'
import {ToastContainer} from 'components/toast/toast'
import {CurrentTooltip} from 'components/tooltip/tooltip'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {
	getDropdown,
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
import Cosmetics from './main-menu/cosmetics'
import Credits from './main-menu/credits'
import DataSettings from './main-menu/data-settings'
import GameSettings from './main-menu/game-settings'
import PlaySelect from './main-menu/play-select'
import Settings from './main-menu/settings'
import Statistics from './main-menu/statistics'

function App() {
	const section = useRouter()
	const dispatch = useMessageDispatch()
	const playerName = useSelector(getPlayerName)
	const socketStatus = useSelector(getSocketStatus)
	const connected = useSelector(getSession).connected
	const toastMessage = useSelector(getToast)
	const tooltip = useSelector(getTooltip)
	const dropdown = useSelector(getDropdown)
	const settings = useSelector(getSettings)

	const lastMenuSection = sessionStorage.getItem('menuSection')

	const [menuSection, setMenuSection] = useState<string>(
		lastMenuSection || 'main-menu',
	)
	let enableToast = false

	const menuSectionSet = (section: string) => {
		setMenuSection(section)
		sessionStorage.setItem('menuSection', section)
	}

	useEffect(() => {
		dispatch({
			type: localMessages.SOUND_SECTION_CHANGE,
			section: section,
		})
	}, [section])

	const router = () => {
		if (section === 'game') {
			return <Game />
		} else if (connected && playerName) {
			enableToast = true
			switch (menuSection) {
				case 'deck':
					return <Deck setMenuSection={menuSectionSet} />
				case 'more':
					return <Settings setMenuSection={menuSectionSet} />
				case 'settings':
					return <Settings setMenuSection={menuSectionSet} />
				case 'game-settings':
					return <GameSettings setMenuSection={menuSectionSet} />
				case 'data-settings':
					return <DataSettings setMenuSection={menuSectionSet} />
				case 'statistics':
					return <Statistics setMenuSection={menuSectionSet} />
				case 'achievements':
					return (
						<Cosmetics setMenuSection={menuSectionSet} page={'achievements'} />
					)
				case 'cosmetics':
					return <Cosmetics setMenuSection={menuSectionSet} page={'rewards'} />
				case 'credits':
					return <Credits setMenuSection={menuSectionSet} />
				case 'play-select':
					return <PlaySelect setMenuSection={menuSectionSet} />

				case 'main-menu':
				default:
					return <MainMenu setMenuSection={menuSectionSet} />
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
			{dropdown && (
				<CurrentDropdown
					dropdown={dropdown.dropdown}
					x={dropdown.x}
					y={dropdown.y}
				/>
			)}
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
			{playerName && !socketStatus && <LostConnection />}
		</main>
	)
}

export default App
