import React from 'react'
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
	const totalGames = Object.values(stats).reduce((a, b) => a + b, 0)

	const handleSoundChange = (ev: React.SyntheticEvent<HTMLInputElement>) => {
		dispatch(setSetting('soundVolume', ev.currentTarget.value))
	}
	const handleMusicChange = (ev: React.SyntheticEvent<HTMLInputElement>) => {
		dispatch(setSetting('musicVolume', ev.currentTarget.value))
	}
	const handleProfanityChange = () => {
		dispatch(setSetting('profanityFilter', settings.profanityFilter !== 'off' ? 'off' : 'on'))
	}
	const handleDialogsChange = () => {
		dispatch(
			setSetting('confirmationDialogs', settings.confirmationDialogs !== 'off' ? 'off' : 'on')
		)
	}
	const handleResetStats = () => {
		dispatch(resetStats())
	}
	const handlePanoramaToggle = () => {
		dispatch(setSetting('panoramaEnabled', !settings.panoramaEnabled))
	}
	const handleGameSideToggle = () => {
		const gameSide = settings.gameSide === 'Left' ? 'Right' : 'Left'
		dispatch(setSetting('gameSide', gameSide))
	}
	const getDescriptor = (value?: string) => {
		if (value !== 'off') return 'Enabled'
		return 'Disabled'
	}
	const getBoolDescriptor = (value?: boolean) => {
		return value ? 'Enabled' : 'Disabled'
	}
	const getPercDescriptor = (value?: string) => {
		if (value !== '0') return `${value}%`
		return 'Disabled'
	}

	return (
		<MenuLayout
			back={() => setMenuSection('mainmenu')}
			title="More"
			returnText="Main Menu"
			className={css.settingsMenu}
		>
			<h2>Settings</h2>
			<div className={css.settings}>
				<Slider value={settings.musicVolume} onInput={handleMusicChange}>
					Music: {getPercDescriptor(settings.musicVolume)}
				</Slider>
				<Slider value={settings.soundVolume} onInput={handleSoundChange}>
					Sounds: {getPercDescriptor(settings.soundVolume)}
				</Slider>
				<Button variant="stone" onClick={handleProfanityChange}>
					Profanity Filter: {getDescriptor(settings.profanityFilter)}
				</Button>
				<Button variant="stone" onClick={handleDialogsChange}>
					Confirmation Dialogs: {getDescriptor(settings.confirmationDialogs)}
				</Button>
				<Button variant="stone" onClick={handlePanoramaToggle}>
					Panorama: {getBoolDescriptor(settings.panoramaEnabled)}
				</Button>
				<Button variant="stone" onClick={handleGameSideToggle}>
					Game Side: {settings.gameSide.toString()}
				</Button>
				<Button variant="stone" onClick={handleResetStats}>
					Reset Stats
				</Button>
			</div>

			<h2>Statistics</h2>
			<div className={css.stats}>
				<div className={css.stat}>
					<span>Games Played</span>
					<span>{totalGames}</span>
				</div>
				<div className={css.stat}>
					<span>Wins</span>
					<span>{stats.w}</span>
				</div>
				<div className={css.stat}>
					<span>Losses</span>
					<span>{stats.l}</span>
				</div>
				<div className={css.stat}>
					<span>Ties</span>
					<span>{stats.t}</span>
				</div>
				<div className={css.stat}>
					<span>Forfeit Wins</span>
					<span>{stats.fw}</span>
				</div>
				<div className={css.stat}>
					<span>Forfeit Losses</span>
					<span>{stats.fl}</span>
				</div>
			</div>
		</MenuLayout>
	)
}

export default Settings
