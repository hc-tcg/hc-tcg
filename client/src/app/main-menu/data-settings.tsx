import Button from 'components/button'
import MenuLayout from 'components/menu-layout'
import Modal from 'components/modal/modal'
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
				<Modal title={whenDonePrompt} closeModal={closeModal} centered>
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
				<Modal title={title} closeModal={closeModal} centered>
					<p className={css.resetModalDescription}>{prompt}</p>
					<div className={css.resetModal}>
						<Button
							className={css.resetModalButton}
							variant="default"
							onClick={handleYes}
						>
							Yes
						</Button>
						<Button
							className={css.resetModalButton}
							variant="default"
							onClick={() => setModal(null)}
						>
							No
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
				<Modal title={'Set UUID and Secret'} closeModal={closeModal} centered>
					<form
						className={css.something}
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
						<div className={css.customInput}>
							<input
								name="id"
								placeholder="UUID"
								id="userIdElement"
								className={css.input}
							></input>
						</div>
						<div className={css.customInput}>
							<input
								name="tag"
								placeholder="Secret"
								id="userSecretElement"
								className={css.input}
							></input>
						</div>
						<Button
							variant="default"
							size="small"
							type="submit"
							className={css.submitButton}
						>
							Confirm
						</Button>
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
				<div className={css.stats}>
					<span className={css.stat}>UUID</span>
					<span className={css.stat}>{databaseInfo.userId}</span>
				</div>
				<div className={css.stats}>
					<span className={css.stat}>Secret</span>
					<span className={css.stat}>{databaseInfo.secret}</span>
				</div>
				<Button
					variant="stone"
					onClick={setUuidSecretModal((id, secret) =>
						dispatch({
							type: localMessages.SET_ID_AND_SECRET,
							userId: id,
							secret: secret,
						}),
					)}
				>
					Set UUID and Secret
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
