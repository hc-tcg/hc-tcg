import Button from 'components/button'
import MenuLayout from 'components/menu-layout'
import Slider from 'components/slider'
import UpdatesModal from 'components/updates'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
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
	const settings = useSelector(getSettings)
	const databaseInfo = useSelector(getLocalDatabaseInfo)

	const stats = databaseInfo.stats

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
	const handleVoiceChange = (ev: React.SyntheticEvent<HTMLInputElement>) => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'voiceVolume',
				value: parseInt(ev.currentTarget.value),
			},
		})
		dispatch({type: localMessages.PLAY_VOICE_TEST})
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
	const changeMenuSection = (section: string) => {
		dispatch({type: localMessages.SOUND_SECTION_CHANGE, section: section})
		setMenuSection(section)
	}
	const handleGameSettings = () => changeMenuSection('game-settings')
	const handleDataSettings = () => changeMenuSection('data-settings')
	const handleHallOfFame = () => changeMenuSection('hall-of-fame')

	const handleCredits = () => changeMenuSection('credits')

	const [updatesOpen, setUpdatesOpen] = useState<boolean>(false)

	const handleUpdates = () => {
		setUpdatesOpen(true)
	}

	const winrate =
		stats !== null &&
		Math.round(
			((stats.wins + stats.forfeitWins) / (stats.gamesPlayed - stats.ties)) *
				10000,
		) / 100

	return (
		<>
			{updatesOpen && (
				<UpdatesModal
					onClose={() => {
						setUpdatesOpen(!updatesOpen)
					}}
				/>
			)}
			<MenuLayout
				back={() => changeMenuSection('mainmenu')}
				title="More"
				returnText="Main Menu"
				className={css.settingsMenu}
			>
				<h2>Settings</h2>
				<div className={css.settingsMultipleRows}>
					<Slider value={settings.musicVolume} onInput={handleMusicChange}>
						Music Volume: {getPercentDescriptor(settings.musicVolume)}
					</Slider>
					<Slider value={settings.soundVolume} onInput={handleSoundChange}>
						Sound Effect Volume: {getPercentDescriptor(settings.soundVolume)}
					</Slider>
					<Slider value={settings.voiceVolume} onInput={handleVoiceChange}>
						Voice Lines Volume: {getPercentDescriptor(settings.voiceVolume)}
					</Slider>
					<Button variant="stone" onClick={handleMuteSound}>
						Sound: {getBoolDescriptor(!settings.muted)}
					</Button>
					<Button variant="stone" onClick={handlePanoramaToggle}>
						Panorama: {getBoolDescriptor(settings.panoramaEnabled)}
					</Button>
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

				<h2>Statistics</h2>
				<div className={css.settingsBig}>
					<div className={css.stats}>
						<div className={css.stat}>
							<span>Games Played</span>
							<span>{stats?.gamesPlayed}</span>
						</div>
						<div className={css.stat}>
							<span>Wins</span>
							<span>{stats?.wins}</span>
						</div>
						<div className={css.stat}>
							<span>Losses</span>
							<span>{stats?.losses}</span>
						</div>
						<div className={css.stat}>
							<span>Ties</span>
							<span>{stats?.ties}</span>
						</div>
						<div className={css.stat}>
							<span>Forfeit Wins</span>
							<span>{stats?.forfeitWins}</span>
						</div>
						<div className={css.stat}>
							<span>Forfeit Losses</span>
							<span>{stats?.forfeitLosses}</span>
						</div>
						<div className={css.stat}>
							<span>Winrate</span>
							<span>
								{stats !== null && stats.gamesPlayed > stats.ties
									? winrate + '%'
									: 'N/A'}
							</span>
						</div>
						<Button
							className={css.hofButton}
							variant="stone"
							onClick={handleHallOfFame}
						>
							Hall of Fame
						</Button>
					</div>
				</div>
			</MenuLayout>
		</>
	)
}

export default Settings
