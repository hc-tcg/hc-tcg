import Button from 'components/button'
import MenuLayout from 'components/menu-layout'
import Slider from 'components/slider'
import UpdatesModal from 'components/updates'
import {getStats} from 'logic/fbdb/fbdb-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}
function Settings({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()
	const stats = useSelector(getStats)
	const settings = useSelector(getSettings)
	const totalGames = Object.values(stats).reduce((a, b) => a + b, 0)

	const handleSoundChange = (ev: React.SyntheticEvent<HTMLInputElement>) => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'soundVolume',
				value: parseInt(ev.currentTarget.value),
			},
		})
	}
	const handleMusicChange = (ev: React.SyntheticEvent<HTMLInputElement>) => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'musicVolume',
				value: parseInt(ev.currentTarget.value),
			},
		})
	}
	const handleMuteSound = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'muted',
				value: !settings.muted,
			},
		})
	}

	const handlePanoramaToggle = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'panoramaEnabled',
				value: !settings.panoramaEnabled,
			},
		})
	}
	const getBoolDescriptor = (value: boolean) => {
		return value ? 'Enabled' : 'Disabled'
	}
	const getPercentDescriptor = (value: number) => {
		if (value !== 0) return `${value}%`
		return 'Disabled'
	}
	const handleGameSettings = () => setMenuSection('game-settings')
	const handleDataSettings = () => setMenuSection('data-settings')

	const handleCredits = () => setMenuSection('credits')

	const [updatesOpen, setUpdatesOpen] = useState<boolean>(false)
	const handleUpdates = () => {
		setUpdatesOpen(true)
	}

	const totalGamesPlayed = stats.w + stats.fw + stats.l + stats.fl
	const winrate = ((stats.w + stats.fw) / totalGamesPlayed) * 100

	return (
		<>
			{updatesOpen ? (
				<UpdatesModal
					updatesOpen={updatesOpen}
					setUpdatesOpen={setUpdatesOpen}
				/>
			) : (
				<></>
			)}
			<MenuLayout
				back={() => setMenuSection('mainmenu')}
				title="More"
				returnText="Main Menu"
				className={css.settingsMenu}
			>
				<h2>Settings</h2>
				<div className={css.settingsBox}>
					<div className={css.settings}>
						<Slider value={settings.musicVolume} onInput={handleMusicChange}>
							Music Volume: {getPercentDescriptor(settings.musicVolume)}
						</Slider>
						<Slider value={settings.soundVolume} onInput={handleSoundChange}>
							Sound Effect Volume: {getPercentDescriptor(settings.soundVolume)}
						</Slider>
						<Button variant="stone" onClick={handleMuteSound}>
							Sound: {getBoolDescriptor(!settings.muted)}
						</Button>
						<Button variant="stone" onClick={handlePanoramaToggle}>
							Panorama: {getBoolDescriptor(settings.panoramaEnabled)}
						</Button>
					</div>
					<div className={css.settings}>
						<Button variant="stone" onClick={handleGameSettings}>
							Game Settings
						</Button>
						<Button variant="stone" onClick={handleDataSettings}>
							Data Management
						</Button>
						<Button variant="stone" onClick={handleCredits}>
							Credits
						</Button>
						<Button variant="stone" onClick={handleUpdates}>
							Updates
						</Button>
					</div>
				</div>

				<h2>Statistics</h2>
				<div className={css.settings}>
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
						<div className={css.stat}>
							<span>Winrate</span>
							<span>{totalGamesPlayed > 0 ? winrate + '%' : 'N/A'}</span>
						</div>
					</div>
				</div>
			</MenuLayout>
		</>
	)
}

export default Settings
