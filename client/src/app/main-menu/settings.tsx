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

	const handleSoundChange = (ev: React.SyntheticEvent<HTMLInputElement>) => {
		dispatch(setSetting('soundVolume', ev.currentTarget.value))
	}
	const handleMusicChange = (ev: React.SyntheticEvent<HTMLInputElement>) => {
		dispatch(setSetting('musicVolume', ev.currentTarget.value))
	}
	const handleProfanityChange = () => {
		dispatch(
			setSetting(
				'profanityFilter',
				settings.profanityFilter !== 'off' ? 'off' : 'on'
			)
		)
	}
	const handleDialogsChange = () => {
		dispatch(
			setSetting(
				'confirmationDialogs',
				settings.confirmationDialogs !== 'off' ? 'off' : 'on'
			)
		)
	}
	const handleResetStats = () => {
		dispatch(resetStats())
	}
	const getDescriptor = (value?: string) => {
		if (value !== 'off') return 'Enabled'
		return 'Disabled'
	}
	const getPercDescriptor = (value?: string) => {
		if (value !== '0') return `${value}%`
		return 'Disabled'
	}
	return (
		<MenuLayout
			back={() => setMenuSection('mainmenu')}
			title="Settings"
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
				<Button variant="stone" onClick={handleResetStats}>
					Reset Stats
				</Button>
			</div>

			<h2>Statistics</h2>
			<div className={css.newStats}>
				<div className={css.newStat}>
					<img src="/images/effects/diamond_sword.png" alt="wins" />
					<p>Wins</p>
					<span>{stats.w}</span>
				</div>
				<div className={css.newStat}>
					<img src="/images/effects/tnt.png" alt="wins" />
					<p>Losses</p>
					<span>{stats.l}</span>
				</div>
				<div className={css.newStat}>
					<img src="/images/effects/totem.png" alt="wins" />
					<p>Ties</p>
					<span>{stats.t}</span>
				</div>
				<div className={css.newStat}>
					<img src="/images/effects/splash_potion_of_healing.png" alt="wins" />
					<p>Forfeit Wins</p>
					<span>{stats.fw}</span>
				</div>
				<div className={css.newStat}>
					<img src="/images/effects/potion_of_weakness.png" alt="wins" />
					<p>Forfeit Losses</p>
					<span>{stats.fl}</span>
				</div>
			</div>
		</MenuLayout>
	)
}

export default Settings
