import Button from 'components/button'
import MenuLayout from 'components/menu-layout'
import Modal from 'components/modal/modal'
import {localMessages} from 'logic/messages'
import {useState} from 'react'
import {useDispatch} from 'react-redux'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}
function DataSettings({setMenuSection}: Props) {
	const dispatch = useDispatch()

	const [modal, setModal] = useState<any>(null)

	const resetChatWindow = () => {
		dispatch({type: localMessages.SETTINGS_RESET, value: 'chatPosition'})
		dispatch({type: localMessages.SETTINGS_RESET, value: 'chatSize'})
	}

	const handleReset = (
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
							variant="stone"
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
				<Modal title={prompt} closeModal={closeModal} centered>
					<div className={css.resetModal}>
						<Button
							className={css.resetModalButton}
							variant="stone"
							onClick={handleYes}
						>
							Yes
						</Button>
						<Button
							className={css.resetModalButton}
							variant="stone"
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
						'Are you sure you want to reset the chat window positioin?',
						'The chat window has been reset.',
						resetChatWindow,
					)}
				>
					Reset Chat Window
				</Button>
				<Button
					variant="stone"
					onClick={handleReset(
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
