import Button from 'components/button'
import MenuLayout from 'components/menu-layout'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import React from 'react'
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
	const handleMinecraftName = (ev: React.SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const username = ev.currentTarget.minecraftName.value.trim()
		if (username.length > 3) {
			dispatch({
				type: localMessages.MINECRAFT_NAME_SET,
				name: username,
			})
			dispatch({
				type: localMessages.SETTINGS_SET,
				setting: {
					key: 'minecraftName',
					value: username,
				},
			})
			localStorage.setItem('minecraftName', username)
		}
	}

	return (
		<MenuLayout
			back={() => setMenuSection('settings')}
			title="Game Settings"
			returnText="More"
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
				<div className={css.minecraftNameArea}>
					<div className={css.left}>
						<img
							className={css.playerHead}
							src={`https://mc-heads.net/head/${settings.minecraftName}/left`}
							alt="player head"
						/>
					</div>
					<div className={css.right}>
						<p>Select in-game player head</p>
						<form className={css.playerHeadForm} onSubmit={handleMinecraftName}>
							<div className={css.customInput}>
								<input
									maxLength={16}
									name="minecraftName"
									placeholder="Minecraft Username"
									id="minecraft-name"
								></input>
							</div>
							<Button variant="stone">Select</Button>
						</form>
					</div>
				</div>
			</div>
		</MenuLayout>
	)
}

export default GameSettings
