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
function More({setMenuSection}: Props) {
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
	const handleDataSettings = () => changeMenuSection('data-settings')
	const handleStatistics = () => changeMenuSection('statistics')
	const _handleAchievements = () => changeMenuSection('achievements')

	const handleCredits = () => changeMenuSection('credits')

	const [updatesOpen, setUpdatesOpen] = useState<boolean>(false)

	const handleUpdates = () => {
		setUpdatesOpen(true)
	}

	const _winrate =
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
				back={() => changeMenuSection('main-menu')}
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
					<Button
						variant="default"
						onClick={handleMuteSound}
						className={css.mainMenuButton}
					>
						Sound: {getBoolDescriptor(!settings.muted)}
					</Button>
					<Button
						variant="default"
						onClick={handlePanoramaToggle}
						className={css.mainMenuButton}
					>
						Panorama: {getBoolDescriptor(settings.panoramaEnabled)}
					</Button>
					<Button
						variant="default"
						onClick={handleDataSettings}
						className={css.mainMenuButton}
					>
						Data Management
					</Button>
					<Button
						variant="default"
						onClick={handleCredits}
						className={css.mainMenuButton}
					>
						Credits
					</Button>
					<Button
						variant="default"
						onClick={handleUpdates}
						className={css.mainMenuButton}
					>
						Updates
					</Button>
					<Button
						variant="default"
						onClick={handleStatistics}
						className={css.mainMenuButton}
					>
						Statistics
					</Button>
				</div>
			</MenuLayout>
		</>
	)
}

export default More
