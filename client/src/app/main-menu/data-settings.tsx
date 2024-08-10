import Button from 'components/button'
import MenuLayout from 'components/menu-layout'
import Modal from 'components/modal/modal'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useState} from 'react'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}
function DataSettings({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()

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
	) => {
		const handleYes = () => {
			reset()
			setModal(
				<Modal title={whenDonePrompt} closeModal={closeModal} centered>
					<div className={css.resetModal}>
						<Button
							className={css.resetModalButton}
							variant="default"
							onClick={closeModal}
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
				<Button
					variant="stone"
					onClick={handleReset(
						'Reset Stats',
						'Are you sure you want to reset your stats?',
						'Your stats have been reset.',
						() => dispatch({type: localMessages.FIREBASE_STATS_RESET}),
					)}
				>
					Reset Stats
				</Button>
			</div>
		</MenuLayout>
	)
}

export default DataSettings
