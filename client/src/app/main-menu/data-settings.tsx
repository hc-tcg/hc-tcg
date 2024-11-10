import classNames from 'classnames'
import Button from 'components/button'
import MenuLayout from 'components/menu-layout'
import {Modal} from 'components/modal'
import {CopyIcon} from 'components/svgs'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}

function DataSettings({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()
	const databaseInfo = useSelector(getLocalDatabaseInfo)

	const [modal, setModal] = useState<any>(null)

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
				</Modal>,
			)
		}
	}

	return (
		<MenuLayout
			back={() => setMenuSection('settings')}
			title="Data Management"
			returnText="More"
			className={css.settingsMenu}
		>
			<h2> Data Management </h2>
			{modal}
			<div className={css.settings}>
				<Button
					variant="stone"
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
					variant="stone"
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
					<div className={classNames(css.dbItem, css.left)}>Secret</div>
					<Button
						variant="default"
						size="small"
						onClick={() =>
							setModal(
								<Modal setOpen title={'User Secret'} onClose={closeModal}>
									<p className={css.warning}>
										<b>⚠ DO NOT share your secret with anyone.</b>
									</p>
									<p className={css.warning}>
										Only view and copy this when you need to sync your account
										to another device. You do not need to give this data to any
										external applications.
									</p>
									<div className={css.dbInfo}>
										<div className={classNames(css.dbItem, css.left)}>
											{databaseInfo.secret}
										</div>
										<button
											className={css.copy}
											onClick={() => {
												if (databaseInfo.secret)
													navigator.clipboard.writeText(databaseInfo.secret)
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
					variant="stone"
					onClick={setUuidSecretModal((id, secret) => {
						dispatch({
							type: localMessages.SET_ID_AND_SECRET,
							userId: id,
							secret: secret,
						})
						setMenuSection('mainmenu')
						dispatch({
							type: localMessages.LOGOUT,
						})
					})}
				>
					Sync Data
				</Button>
				<Button
					variant="stone"
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
							setMenuSection('mainmenu')
							dispatch({
								type: localMessages.LOGOUT,
							})
						},
					)}
				>
					Reset User Information
				</Button>
			</div>
		</MenuLayout>
	)
}

export default DataSettings
