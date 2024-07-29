import {useState} from 'react'
import css from './main-menu.module.scss'
import MenuLayout from 'components/menu-layout'
import Button from 'components/button'
import {resetStats} from 'logic/fbdb/fbdb-actions'
import {useDispatch} from 'react-redux'
import {resetSetting} from 'logic/local-settings/local-settings-actions'
import Modal from 'components/modal/modal'

type Props = {
	setMenuSection: (section: string) => void
}
function DataSettings({setMenuSection}: Props) {
	const dispatch = useDispatch()

	const [modal, setModal] = useState<any>(null)

	const resetChatWindow = () => {
		dispatch(resetSetting('chatPosition'))
		dispatch(resetSetting('chatSize'))
	}

	const handleReset = (prompt: string, whenDonePrompt: string, reset: () => void) => {
		const handleYes = () => {
			reset()
			setModal(
				<Modal title={whenDonePrompt} closeModal={closeModal} centered>
					<div className={css.resetModal}>
						<Button className={css.resetModalButton} variant="stone" onClick={closeModal}>
							Ok
						</Button>
					</div>
				</Modal>
			)
		}

		return () => {
			setModal(
				<Modal title={prompt} closeModal={closeModal} centered>
					<div className={css.resetModal}>
						<Button className={css.resetModalButton} variant="stone" onClick={handleYes}>
							Yes
						</Button>
						<Button className={css.resetModalButton} variant="stone" onClick={() => setModal(null)}>
							No
						</Button>
					</div>
				</Modal>
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
						resetChatWindow
					)}
				>
					Reset Chat Window
				</Button>
				<Button
					variant="stone"
					onClick={handleReset(
						'Are you sure you want to reset your stats?',
						'Your stats have been reset.',
						() => dispatch(resetStats())
					)}
				>
					Reset Stats
				</Button>
			</div>
		</MenuLayout>
	)
}

export default DataSettings
