import Button from 'components/button'
import MenuLayout from 'components/menu-layout'
import Slider from 'components/slider'
import UpdatesModal from 'components/updates'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import css from './settings.module.scss'
import classNames from 'classnames'
import Tabs from 'components/tabs/tabs'
import Credit from 'components/credit'
import {CreditProps} from 'components/credit/credit'
import DeveloperCredit from 'components/credit/developer-credit'
import {Modal} from 'components/modal'
import { CopyIcon } from 'components/svgs'
import { getLocalDatabaseInfo } from 'logic/game/database/database-selectors'

type Social = 'discord' | 'github' | 'gitlab' | 'twitter'

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

type Props = {
	setMenuSection: (section: string) => void
}

function Settings({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()
	const settings = useSelector(getSettings)
	const databaseInfo = useSelector(getLocalDatabaseInfo)

	const [tab, setTab] = useState<string>('general')
	const tabs = ['general', 'sound', 'game', 'data']

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

	const handleCredits = () => changeMenuSection('credits')

	const [updatesOpen, setUpdatesOpen] = useState<boolean>(false)

	const handleUpdates = () => {
		setUpdatesOpen(true)
	}

	const handleDialogsChange = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'confirmationDialogsEnabled',
				value: !settings.confirmationDialogsEnabled,
			},
		})
	}
	const handleGameSideToggle = () => {
		const gameSide = settings.gameSide === 'Left' ? 'Right' : 'Left'
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'gameSide',
				value: gameSide,
			},
		})
	}
	const handleChatChange = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'chatEnabled',
				value: !settings.chatEnabled,
			},
		})
	}
	const handleProfanityChange = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'profanityFilterEnabled',
				value: !settings.profanityFilterEnabled,
			},
		})
	}
	const handleSlotHighlightingChange = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'slotHighlightingEnabled',
				value: !settings.slotHighlightingEnabled,
			},
		})
	}
	const handleDeckSortingMethod = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'deckSortingMethod',
				value:
					settings.deckSortingMethod === 'Alphabetical'
						? 'First Tag'
						: 'Alphabetical',
			},
		})
	}

	const resetChatWindow = () => {
		dispatch({type: localMessages.SETTINGS_RESET, key: 'chatPosition'})
		dispatch({type: localMessages.SETTINGS_RESET, key: 'chatSize'})
	}

	const handleReset = (
		title: string,
		prompt: string,
		whenDonePrompt: string,
		reset: () => void,
		afterReset?: () => void,
	) => {
		const handleYes = () => {
			reset()
			setModal(
				<Modal setOpen title={whenDonePrompt} onClose={closeModal}>
					<div className={css.resetModal}>
						<Button
							className={css.resetModalButton}
							variant="default"
							onClick={() => {
								closeModal()
								if (afterReset) afterReset()
							}}
						>
							Ok
						</Button>
					</div>
				</Modal>,
			)
		}

		return () => {
			setModal(
				<Modal setOpen title={title} onClose={closeModal}>
					<p className={css.resetModalDescription}>{prompt}</p>
					<div className={css.resetModal}>
						<Button
							className={css.resetModalButton}
							variant="error"
							onClick={handleYes}
						>
							⚠ Go Ahead
						</Button>
						<Button
							className={css.resetModalButton}
							variant="default"
							onClick={() => setModal(null)}
						>
							Nevermind
						</Button>
					</div>
				</Modal>,
			)
		}
	}

	const [modal, setModal] = useState<any>(null)

	const closeModal = () => {
		setModal(null)
	}

	const setUuidSecretModal = (
		onConfirm: (id: string, secret: string) => void,
	) => {
		return () => {
			setModal(
				<Modal setOpen title={'Sync with another device'} onClose={closeModal}>
					<div className={css.resetModalDescription}>
						<p>
							Sync your devices by entering the UUID and secret of the other
							device you want to sync with. This process is irreversible.
						</p>
					</div>
					<form
						className={css.setUuidSecretForm}
						onSubmit={() => {
							const userId = (
								document.getElementById('userIdElement') as HTMLInputElement
							).value
							const secret = (
								document.getElementById('userSecretElement') as HTMLInputElement
							).value
							if (!userId || !secret) return
							onConfirm(userId, secret)
						}}
					>
						<div className={css.input}>
							<input
								name="id"
								placeholder="UUID"
								id="userIdElement"
								className={css.input}
								maxLength={36}
								minLength={36}
								pattern={'^[-0-9a-f]*$'}
							></input>
						</div>
						<div className={css.input}>
							<input
								name="secret"
								placeholder="Secret"
								id="userSecretElement"
								className={css.input}
								maxLength={36}
								minLength={36}
								pattern={'^[-0-9a-f]*$'}
							></input>
						</div>
						<p className={css.warning}>
							<b>
								⚠ Syncing will remove all your data on this device, including
								decks.
							</b>
						</p>
						<div className={css.resetModal}>
							<Button
								className={css.resetModalButton}
								variant="default"
								type="submit"
							>
								Confirm
							</Button>
							<Button
								className={css.resetModalButton}
								variant="default"
								onClick={() => setModal(null)}
							>
								Cancel
							</Button>
						</div>
					</form>
				</Modal>
			)
		}
	}

	return (
		<>
			{updatesOpen && (
				<UpdatesModal
					onClose={() => {
						setUpdatesOpen(!updatesOpen)
					}}
				/>
			)}
			{modal}
			<MenuLayout
				back={() => changeMenuSection('main-menu')}
				title="Settings"
				returnText="Main Menu"
				className={css.settingsMenu}
			>
				<div className={css.bigHallOfFameArea}>
					<div className={css.mainHallOfFameArea}>
						<div className={css.fullLeftArea}>
							<div className={css.tabContainer}>
								<Tabs
									selected={tab}
									setSelected={setTab}
									tabs={tabs}
									vertical={true}
									verticalDirection="left"
								/>
							</div>
							{tab === 'general' && (
								<div className={css.settingsArea}>
									<Button
										variant="default"
										onClick={handlePanoramaToggle}
										className={css.settingItem}
									>
										Panorama: {getBoolDescriptor(settings.panoramaEnabled)}
									</Button>
									<Button
										variant="default"
										onClick={handleUpdates}
										className={css.settingItem}
									>
										Updates
									</Button>
									<h2 className={css.creditsHeader}>Credits</h2>
									{designers.map((designer) => (
										<Credit props={designer} />
									))}
									<div className={css.developerContainer}>
										{developers.map((developer) => (
											<DeveloperCredit props={developer} />
										))}
									</div>
								</div>
							)}
							{tab === 'sound' && (
								<div className={css.settingsArea}>
									<div className={css.twoSettings}>
										<Slider
											className={css.settingItem}
											value={settings.soundVolume}
											onInput={handleSoundChange}
										>
											Sound Effect Volume:{' '}
											{getPercentDescriptor(settings.soundVolume)}
										</Slider>
										<Button
											className={css.settingItem}
											variant="default"
											onClick={handleMuteSound}
										>
											Sound: {getBoolDescriptor(!settings.soundMuted)}
										</Button>
									</div>
									<div className={css.twoSettings}>
										<Slider
											className={css.settingItem}
											value={settings.musicVolume}
											onInput={handleMusicChange}
										>
											Music Volume: {getPercentDescriptor(settings.musicVolume)}
										</Slider>
										<Button
											className={css.settingItem}
											variant="default"
											onClick={handleMuteMusic}
										>
											Music: {getBoolDescriptor(!settings.musicMuted)}
										</Button>
									</div>
									<div className={css.twoSettings}>
										<Slider
											className={css.settingItem}
											value={settings.voiceVolume}
											onInput={handleVoiceChange}
										>
											Voice Lines Volume:{' '}
											{getPercentDescriptor(settings.voiceVolume)}
										</Slider>
										<div className={css.settingItem}></div>
									</div>
								</div>
							)}
							{tab === 'game' && (
								<div className={css.settingsArea}>
									<Button
										className={css.settingsButton}
										variant="default"
										onClick={handleGameSideToggle}
									>
										Game Side: {settings.gameSide.toString()}
									</Button>
									<Button
										className={css.settingsButton}
										variant="default"
										onClick={handleDialogsChange}
									>
										Confirmation Dialogs:{' '}
										{getBoolDescriptor(settings.confirmationDialogsEnabled)}
									</Button>
									<Button
										className={css.settingsButton}
										variant="default"
										onClick={handleChatChange}
									>
										In-Game Chat: {getBoolDescriptor(settings.chatEnabled)}
									</Button>
									<Button
										className={css.settingsButton}
										variant="default"
										onClick={handleProfanityChange}
									>
										Profanity Filter:{' '}
										{getBoolDescriptor(settings.profanityFilterEnabled)}
									</Button>
									<Button
										className={css.settingsButton}
										variant="default"
										onClick={handleSlotHighlightingChange}
									>
										Card Slot Highlighting:{' '}
										{getBoolDescriptor(settings.slotHighlightingEnabled)}
									</Button>
									<Button
										className={css.settingsButton}
										variant="default"
										onClick={handleDeckSortingMethod}
									>
										Deck Sorting Method: {settings.deckSortingMethod}
									</Button>
								</div>
							)}
							{tab === 'data' && (
								<div className={css.settingsArea}>
									<Button
										className={css.settingsButton}
										variant="default"
										onClick={handleReset(
											'Reset Settings',
											'Are you sure you want to reset your settings to the default values?',
											'Your settings have been reset.',
											() => dispatch({type: localMessages.ALL_SETTINGS_RESET}),
										)}
									>
										Reset Settings
									</Button>
									<Button
										className={css.settingsButton}
										variant="default"
										onClick={handleReset(
											'Reset Chat Window',
											'Are you sure you want to reset the chat window position?',
											'The chat window has been reset.',
											resetChatWindow,
										)}
									>
										Reset Chat Window
									</Button>
									<div className={css.dbInfo}>
										<div className={css.dbItem}>UUID</div>
										<div className={classNames(css.dbItem, css.right)}>
											{databaseInfo.userId}
										</div>
										<button
											className={css.copy}
											onClick={() => {
												if (databaseInfo.userId)
													navigator.clipboard.writeText(databaseInfo.userId)
											}}
										>
											{CopyIcon()}
										</button>
									</div>
									<div className={css.dbInfo}>
										<div className={classNames(css.dbItem, css.left)}>
											Secret
										</div>
										<Button
											className={css.viewSecretButton}
											variant="default"
											onClick={() =>
												setModal(
													<Modal
														setOpen
														title={'User Secret'}
														onClose={closeModal}
													>
														<p className={css.warning}>
															<b>⚠ DO NOT share your secret with anyone.</b>
														</p>
														<p className={css.warning}>
															Only view and copy this when you need to sync your
															account to another device. You do not need to give
															this data to any external applications.
														</p>
														<div className={css.dbInfo}>
															<div className={classNames(css.dbItem, css.left)}>
																{databaseInfo.secret}
															</div>
															<button
																className={css.copy}
																onClick={() => {
																	if (databaseInfo.secret)
																		navigator.clipboard.writeText(
																			databaseInfo.secret,
																		)
																}}
															>
																{CopyIcon()}
															</button>
														</div>
														<div className={css.resetModal}>
															<Button
																className={css.resetModalButton}
																variant="default"
																onClick={closeModal}
															>
																Confirm
															</Button>
														</div>
													</Modal>,
												)
											}
										>
											View Secret
										</Button>
									</div>
									<Button
										className={css.settingsButton}
										variant="default"
										onClick={setUuidSecretModal((id, secret) => {
											dispatch({
												type: localMessages.SET_ID_AND_SECRET,
												userId: id,
												secret: secret,
											})
											setMenuSection('main-menu')
											dispatch({
												type: localMessages.LOGOUT,
											})
										})}
									>
										Sync Data
									</Button>
									<Button
										className={css.settingsButton}
										variant="default"
										onClick={handleReset(
											'Reset User Information',
											'Are you sure you want to reset your user information? It is possible you could lose your information forever if you do not have the same UUID and secret on another device.',
											'User information has been reset.',
											() => {
												dispatch({
													type: localMessages.RESET_ID_AND_SECRET,
												})
												dispatch({
													type: localMessages.SETTINGS_SET,
													setting: {
														key: 'lastSelectedTag',
														value: null,
													},
												})
											},
											() => {
												setMenuSection('main-menu')
												dispatch({
													type: localMessages.LOGOUT,
												})
											},
										)}
									>
										Reset User Information
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>
			</MenuLayout>
		</>
	)
}

export default Settings
