import Background from 'components/background'
import {CurrentDropdown} from 'components/dropdown/dropdown'
import LostConnection from 'components/lost-connection'
import {Toaster} from 'components/toast/toast'
import {CurrentTooltip} from 'components/tooltip/tooltip'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {
	getDropdown,
	getPlayerName,
	getSession,
	getTooltip,
} from 'logic/session/session-selectors'
import {getSocketStatus} from 'logic/socket/socket-selectors'
import {useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import queryOptions from '../query-params'
import {useRouter} from './app-hooks'
import Deck from './deck'
import Game from './game'
import Login from './login'
import MainMenu from './main-menu'
import Cosmetics from './main-menu/achievements'
import PlaySelect from './main-menu/play-select'
import Settings from './main-menu/settings'
import Statistics from './main-menu/statistics'

function Router() {
	const section = useRouter()
	const dispatch = useMessageDispatch()
	const playerName = useSelector(getPlayerName)
	const connected = useSelector(getSession).connected

	const lastMenuSection = sessionStorage.getItem('menuSection')

	const [menuSection, setMenuSection] = useState<string>(
		lastMenuSection || 'main-menu',
	)

	const menuSectionSet = (section: string) => {
		setMenuSection(section)
		sessionStorage.setItem('menuSection', section)
	}

	useEffect(() => {
		if (queryOptions.spectate) {
			setMenuSection('play-select-spectate')
		}
		if (queryOptions.fight) {
			setMenuSection('play-select-fight')
		}
	})

	useEffect(() => {
		dispatch({
			type: localMessages.SOUND_SECTION_CHANGE,
			section: section,
		})
	}, [section])

	const router = () => {
		if (section === 'game') {
			return <Game setMenuSection={setMenuSection} />
		} else if (connected && playerName) {
			switch (menuSection) {
				case 'deck':
					return <Deck setMenuSection={menuSectionSet} />
				case 'more':
					return <Settings setMenuSection={menuSectionSet} />
				case 'settings':
					return <Settings setMenuSection={menuSectionSet} />
				case 'statistics':
					return <Statistics setMenuSection={menuSectionSet} />
				case 'achievements':
					return (
						<Cosmetics setMenuSection={menuSectionSet} page={'achievements'} />
					)
				case 'cosmetics':
					return <Cosmetics setMenuSection={menuSectionSet} page={'rewards'} />
				case 'play-select':
					return <PlaySelect setMenuSection={menuSectionSet} />
				case 'play-select-spectate':
					const spectateCode = queryOptions.spectate
					queryOptions.spectate = undefined
					return (
						<PlaySelect
							setMenuSection={menuSectionSet}
							defaultSection={'private'}
							firstActiveMenu="privateSpectateGame"
							prefillSpectatorCode={spectateCode}
						/>
					)
				case 'play-select-fight':
					const joinCode = queryOptions.fight
					queryOptions.fight = undefined
					return (
						<PlaySelect
							setMenuSection={menuSectionSet}
							defaultSection={'private'}
							firstActiveMenu="privateJoinGame"
							prefillJoinCode={joinCode}
						/>
					)
				case 'play-again-public':
					return (
						<PlaySelect
							setMenuSection={menuSectionSet}
							defaultSection={'public'}
						/>
					)
				case 'play-again-boss':
					return (
						<PlaySelect
							setMenuSection={menuSectionSet}
							defaultSection={'boss'}
						/>
					)
				case 'rematch':
					return (
						<PlaySelect
							setMenuSection={menuSectionSet}
							defaultSection={'rematch'}
						/>
					)
				case 'main-menu':
				default:
					return <MainMenu setMenuSection={menuSectionSet} />
			}
		}
		return <Login />
	}

	return <main>{router()}</main>
}

function Dropdown() {
	const dropdown = useSelector(getDropdown)
	return (
		dropdown && (
			<CurrentDropdown
				dropdown={dropdown.dropdown}
				x={dropdown.x}
				y={dropdown.y}
				direction={dropdown.direction}
				align={dropdown.align}
			/>
		)
	)
}

function Tooltips() {
	const tooltip = useSelector(getTooltip)
	return (
		tooltip && (
			<CurrentTooltip
				tooltip={tooltip.tooltip}
				anchor={tooltip.anchor}
				tooltipHeight={tooltip.tooltipHeight}
				tooltipWidth={tooltip.tooltipWidth}
			/>
		)
	)
}

function SiteBackground() {
	const settings = useSelector(getSettings)

	const background = useMemo(() => {
		return (
			<Background
				panorama={settings.panorama}
				disabled={!settings.panoramaEnabled}
			/>
		)
	}, [settings.panoramaEnabled])

	return background
}

function SocketStatus() {
	const playerName = useSelector(getPlayerName)
	const socketStatus = useSelector(getSocketStatus)

	return playerName && !socketStatus && <LostConnection />
}

function App() {
	return (
		<>
			<Router />
			<Toaster />
			<Dropdown />
			<Tooltips />
			<SiteBackground />
			<SocketStatus />
		</>
	)
}

export default App
