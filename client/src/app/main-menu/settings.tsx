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
		>
			<Slider
				className={css.menuButton}
				value={settings.musicVolume}
				onInput={handleMusicChange}
			>
				Music: {getPercDescriptor(settings.musicVolume)}
			</Slider>
			<Slider
				className={css.menuButton}
				value={settings.soundVolume}
				onInput={handleSoundChange}
			>
				Sounds: {getPercDescriptor(settings.soundVolume)}
			</Slider>
			<Button
				variant="stone"
				className={css.menuButton}
				onClick={handleProfanityChange}
			>
				Profanity filter: {getDescriptor(settings.profanityFilter)}
			</Button>
			<Button
				variant="stone"
				className={css.menuButton}
				onClick={handleDialogsChange}
			>
				Confirmation Dialogs: {getDescriptor(settings.confirmationDialogs)}
			</Button>

			<Button
				variant="stone"
				className={css.menuButton}
				onClick={() => setMenuSection('mainmenu')}
			>
				Back to menu
			</Button>
			<Button
				variant="stone"
				className={css.menuButton}
				onClick={handleResetStats}
			>
				Reset Stats
			</Button>

			{/* stats */}
			<div className={css.stats}>
				<div className={css.stat}>
					<div className={css.statName}>Wins</div>
					<div className={css.statValue}>{stats.w}</div>
				</div>
				<div className={css.stat}>
					<div className={css.statName}>Losses</div>
					<div className={css.statValue}>{stats.l}</div>
				</div>
				<div className={css.stat}>
					<div className={css.statName}>Ties</div>
					<div className={css.statValue}>{stats.t}</div>
				</div>
				<div className={css.stat}>
					<div className={css.statName}>Forfeit Wins</div>
					<div className={css.statValue}>{stats.fw}</div>
				</div>
				<div className={css.stat}>
					<div className={css.statName}>Forfeit Losses</div>
					<div className={css.statValue}>{stats.fl}</div>
				</div>
			</div>
		</MenuLayout>
	)
}

export default Settings
