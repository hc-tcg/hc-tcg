import Button from 'components/button'
import MenuLayout from 'components/menu-layout'
import {localMessages, useActionDispatch} from 'logic/messages'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import React from 'react'
import {useSelector} from 'react-redux'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}
function GameSettings({setMenuSection}: Props) {
	const dispatch = useActionDispatch()
	const settings = useSelector(getSettings)

	const handleDialogsChange = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			key: 'confirmationDialogs',
			value: settings.confirmationDialogs !== 'off' ? 'off' : 'on',
		})
	}
	const handleGameSideToggle = () => {
		const gameSide = settings.gameSide === 'Left' ? 'Right' : 'Left'
		dispatch({type: localMessages.SETTINGS_SET, key: 'gameSide', value: gameSide})
	}
	const getDescriptor = (value?: string) => {
		if (value !== 'off') return 'Enabled'
		return 'Disabled'
	}
	const handleChatChange = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			key: 'disableChat',
			value: settings.disableChat !== 'off' ? 'off' : 'on',
		})
	}
	const handleProfanityChange = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			key: 'profanityFilter',
			value: settings.profanityFilter !== 'off' ? 'off' : 'on',
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
				key: 'minecraftName',
				value: username,
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
					Confirmation Dialogs: {getDescriptor(settings.confirmationDialogs)}
				</Button>
				<Button variant="stone" onClick={handleChatChange}>
					Hide Chat: {getDescriptor(settings.disableChat)}
				</Button>
				<Button variant="stone" onClick={handleProfanityChange}>
					Profanity Filter: {getDescriptor(settings.profanityFilter)}
				</Button>
				<div className={css.minecraftNameArea}>
					<div className={css.upper}>
						<h3>Ingame Player head</h3>
						<img
							className={css.playerHead}
							src={`https://mc-heads.net/head/${settings.minecraftName}/left`}
							alt="player head"
						/>
					</div>
					<form className={css.playerHeadForm} onSubmit={handleMinecraftName}>
						<div className={css.customInput}>
							<input
								maxLength={16}
								name="minecraftName"
								placeholder=" "
								autoFocus
								id="minecraft-name"
							></input>
							<label htmlFor="minecraft-name">Minecraft Username</label>
						</div>
						<Button variant="stone">Select</Button>
					</form>
				</div>
			</div>
		</MenuLayout>
	)
}

export default GameSettings
