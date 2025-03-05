import classNames from 'classnames'
import Button from 'components/button'
import Credit from 'components/credit'
import {CreditProps} from 'components/credit/credit'
import DeveloperCredit from 'components/credit/developer-credit'
import Dropdown from 'components/dropdown'
import MenuLayout from 'components/menu-layout'
import {Modal} from 'components/modal'
import {SoundSetting} from 'components/setting/sound-setting'
import {ToggleSetting} from 'components/setting/toggle-setting'
import {CopyIcon} from 'components/svgs'
import Tabs from 'components/tabs/tabs'
import UpdatesModal from 'components/updates'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import css from './settings.module.scss'

const designers: CreditProps[] = [
	{
		name: 'VintageBeef - Game Creator',
		handle: '@VintageBeefLP',
		social: 'twitter',
		link: 'https://twitter.com/VintageBeefLP',
		avatar:
			'https://pbs.twimg.com/profile_images/1382001684151332867/iYD2Xj7c_400x400.jpg',
	},
	{
		name: 'Hoffen - Artist',
		handle: '@_inkGhoul',
		social: 'twitter',
		link: 'https://twitter.com/_InkGhoul',
		avatar:
			'https://pbs.twimg.com/profile_images/1884699879282458624/pAJ13-C3_400x400.jpg',
	},
]

const developers: CreditProps[] = [
	{
		name: 'Minion Harou',
		handle: 'minionharou',
		social: 'discord',
		avatar:
			'https://cdn.discordapp.com/avatars/171689337954500608/c17287ea15fbbbf66f8bfcbcdf6bd705.webp',
	},
	{
		name: 'Benji',
		handle: '東方愛麗絲',
		social: 'github',
		link: 'https://github.com/alicetouhou',
		avatar: 'https://avatars.githubusercontent.com/u/63879236?v=4',
	},
	{
		name: 'Zunda',
		handle: 'ずんだアロー',
		social: 'github',
		link: 'https://github.com/zunda-arrow',
		avatar: 'https://avatars.githubusercontent.com/u/65521138',
	},
	{
		name: 'Screaper91',
		handle: 'Screaper91',
		social: 'github',
		link: 'https://github.com/screaper91',
		avatar: 'https://avatars.githubusercontent.com/u/155844020',
	},
	{
		name: 'ChimeraDev',
		handle: 'chimeradev',
		social: 'discord',
		avatar: 'https://avatars.githubusercontent.com/u/109681545?v=4',
	},

	{
		name: 'Sense_101',
		handle: 'sense101',
		social: 'discord',
		avatar: 'https://avatars.githubusercontent.com/u/67970865?v=4',
	},

	{
		name: 'ImagineFyre',
		handle: 'jmlyman424',
		social: 'github',
		link: 'https://github.com/jmlyman424',
		avatar: 'https://avatars.githubusercontent.com/u/8975572',
	},

	{
		name: 'Niko',
		handle: 'niko.uy',
		social: 'discord',
		avatar: 'https://avatars.githubusercontent.com/u/12455733?v=4',
	},

	{
		name: 'Tyrannicodin',
		handle: 'tyrannicodin',
		social: 'discord',
		avatar:
			'https://cdn.discordapp.com/avatars/547104418131083285/0e6fa62e2f647943f21ecbe2d21a9291.webp',
	},

	{
		name: 'Rvtar',
		handle: 'Rvtar',
		social: 'github',
		link: 'https://github.com/Rvtar',
		avatar: 'https://avatars.githubusercontent.com/u/106639908',
	},

	{
		name: 'blockgolbin31',
		handle: 'blockgolbin31',
		social: 'github',
		link: 'https://github.com/blockgolbin31',
		avatar: 'https://avatars.githubusercontent.com/u/57573828',
	},

	{
		name: 'ijzm',
		handle: 'ijzm',
		social: 'github',
		link: 'https://github.com/ijzm',
		avatar: 'https://avatars.githubusercontent.com/u/4440678',
	},

	{
		name: 'Maescool',
		handle: 'Maescool',
		social: 'github',
		link: 'https://github.com/Maescool',
		avatar: 'https://avatars.githubusercontent.com/u/197110',
	},

	{
		name: 'ProfNinja',
		handle: 'profninja',
		social: 'discord',
		avatar: 'https://avatars.githubusercontent.com/u/671639?v=4',
	},

	{
		name: 'ArsenalTillIDie',
		handle: 'ArsenalTillIDie',
		social: 'github',
		link: 'https://github.com/ArsenalTillIDie',
		avatar: 'https://avatars.githubusercontent.com/u/59069144',
	},

	{
		name: 'Razboy20',
		handle: 'Razboy20',
		social: 'github',
		link: 'https://github.com/Razboy20',
		avatar: 'https://avatars.githubusercontent.com/u/29903962',
	},
	{
		name: 'JoelleJS',
		handle: 'JoelleJS',
		social: 'gitlab',
		link: 'https://gitlab.com/JoelleJS',
		avatar:
			'https://gitlab.com/uploads/-/system/user/avatar/5164556/avatar.png',
	},
	{
		name: 'Czompi',
		handle: 'Czompi',
		social: 'github',
		link: 'https://github.com/Czompi',
		avatar: 'https://avatars.githubusercontent.com/u/26040786',
	},
	{
		name: 'eyduh',
		handle: 'eyduh',
		social: 'github',
		link: 'https://github.com/eyduh',
		avatar: 'https://avatars.githubusercontent.com/u/29815625',
	},
]

function toTitleCase(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

type Props = {
	setMenuSection: (section: string) => void
}

function Settings({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()
	const settings = useSelector(getSettings)

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
				key: 'soundMuted',
				value: !settings.soundMuted,
			},
		})
	}
	const handleMuteMusic = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'musicMuted',
				value: !settings.musicMuted,
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
	const handleGameSettings = () => changeMenuSection('game-settings')

	const handleResetChatWindow = () => {
		dispatch({type: localMessages.SETTINGS_RESET, key: 'chatPosition'})
		dispatch({type: localMessages.SETTINGS_RESET, key: 'chatSize'})
	}

	return (
		<>
			{modal}
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
						Sound: {getBoolDescriptor(!settings.soundMuted)}
					</Button>
					<Button
						variant="default"
						onClick={handleMuteMusic}
						className={css.mainMenuButton}
					>
						Music: {getBoolDescriptor(!settings.musicMuted)}
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
						onClick={handleGameSettings}
						className={css.mainMenuButton}
					>
						Game Settings
					</Button>
				</div>
			</MenuLayout>
		</>
	)
}

export default Settings
