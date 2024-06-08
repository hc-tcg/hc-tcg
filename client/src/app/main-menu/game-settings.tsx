import React from 'react'
import css from './main-menu.module.scss'
import {useSelector, useDispatch} from 'react-redux'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import MenuLayout from 'components/menu-layout'
import Button from 'components/button'

type Props = {
	setMenuSection: (section: string) => void
}
function GameSettings({setMenuSection}: Props) {
	const dispatch = useDispatch()
	const settings = useSelector(getSettings)

	const handleDialogsChange = () => {
		dispatch(
			setSetting('confirmationDialogs', settings.confirmationDialogs !== 'off' ? 'off' : 'on')
		)
	}
	const handleGameSideToggle = () => {
		const gameSide = settings.gameSide === 'Left' ? 'Right' : 'Left'
		dispatch(setSetting('gameSide', gameSide))
	}
	const getDescriptor = (value?: string) => {
		if (value !== 'off') return 'Enabled'
		return 'Disabled'
	}
	const handleChatChange = () => {
		dispatch(setSetting('disableChat', settings.disableChat !== 'off' ? 'off' : 'on'))
	}
	const handleProfanityChange = () => {
		dispatch(setSetting('profanityFilter', settings.profanityFilter !== 'off' ? 'off' : 'on'))
	}
	const handleMinecraftName = (ev: React.SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const username = ev.currentTarget.minecraftName.value.trim()
		if (username.length > 3) {
			dispatch({
				type: 'UPDATE_MINECRAFT_NAME',
				payload: username,
			})
			dispatch(setSetting('minecraftName', username))
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
