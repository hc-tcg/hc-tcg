import React, {SyntheticEvent} from 'react'
import css from './main-menu.module.scss'
import {useSelector, useDispatch} from 'react-redux'
import Slider from 'components/slider'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {getStats} from 'logic/fbdb/fbdb-selectors'
import {resetStats} from 'logic/fbdb/fbdb-actions'
import MenuLayout from 'components/menu-layout'
import Button from 'components/button'

type Props = {
	setMenuSection: (section: string) => void
}
function Settings({setMenuSection}: Props) {
	const dispatch = useDispatch()
	const stats = useSelector(getStats)
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
	const handleMinecraftName = (ev: React.SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const username = ev.currentTarget.minecraftName.value.trim()
		console.log(username)
		if (username.length > 3) {
			dispatch(setSetting('minecraftName', username))
			console.log('dispatching')
			dispatch({
				type: 'UPDATE_MINECRAFT_NAME',
				payload: username,
			})
			localStorage.setItem('minecraftName', username)
		}
	}

	return (
		<MenuLayout
			back={() => setMenuSection('mainmenu')}
			title="More"
			returnText="Main Menu"
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
				<div className={css.minecraftNameArea}>
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
					<img
						className={css.playerHead}
						src={`https://mc-heads.net/head/${settings.minecraftName}/left`}
						alt="player head"
					/>
				</div>
			</div>
		</MenuLayout>
	)
}

export default Settings
