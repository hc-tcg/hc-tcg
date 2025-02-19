import Button from 'components/button'
import MenuLayout from 'components/menu-layout'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}
function GameSettings({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()
	const settings = useSelector(getSettings)

	const handleDialogsChange = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'confirmationDialogsEnabled',
				value: !settings.confirmationDialogsEnabled,
			},
		})
	}
	const handleGameSideToggle = () => {
		const gameSide = settings.gameSide === 'Left' ? 'Right' : 'Left'
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'gameSide',
				value: gameSide,
			},
		})
	}
	const getDescriptor = (value: boolean) => {
		return value ? 'Enabled' : 'Disabled'
	}
	const handleChatChange = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'chatEnabled',
				value: !settings.chatEnabled,
			},
		})
	}
	const handleProfanityChange = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'profanityFilterEnabled',
				value: !settings.profanityFilterEnabled,
			},
		})
	}
	const handleSlotHighlightingChange = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'slotHighlightingEnabled',
				value: !settings.slotHighlightingEnabled,
			},
		})
	}
	const handleDeckSortingMethod = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'deckSortingMethod',
				value:
					settings.deckSortingMethod === 'Alphabetical'
						? 'First Tag'
						: 'Alphabetical',
			},
		})
	}

	return (
		<MenuLayout
			back={() => setMenuSection('main-menu')}
			title="Game Settings"
			returnText="Main Menu"
			className={css.settingsMenu}
		>
			<h2>Game Settings</h2>
			<div className={css.settings}>
				<Button variant="stone" onClick={handleGameSideToggle}>
					Game Side: {settings.gameSide.toString()}
				</Button>
				<Button variant="stone" onClick={handleDialogsChange}>
					Confirmation Dialogs:{' '}
					{getDescriptor(settings.confirmationDialogsEnabled)}
				</Button>
				<Button variant="stone" onClick={handleChatChange}>
					In-Game Chat: {getDescriptor(settings.chatEnabled)}
				</Button>
				<Button variant="stone" onClick={handleProfanityChange}>
					Profanity Filter: {getDescriptor(settings.profanityFilterEnabled)}
				</Button>
				<Button variant="stone" onClick={handleSlotHighlightingChange}>
					Card Slot Highlighting:{' '}
					{getDescriptor(settings.slotHighlightingEnabled)}
				</Button>
				<Button variant="stone" onClick={handleDeckSortingMethod}>
					Deck Sorting Method: {settings.deckSortingMethod}
				</Button>
			</div>
		</MenuLayout>
	)
}

export default GameSettings
