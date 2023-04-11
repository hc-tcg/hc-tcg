import * as Toast from '@radix-ui/react-toast'
import css from './toast.module.scss'
import {useDispatch, useSelector} from 'react-redux'
import {getSettings} from 'logic/local-settings/local-settings-selectors'

type Props = {
	title: string
	description: string
	image?: string
	setOpen: boolean
}

const ToastMessage = ({setOpen, title, description, image}: Props) => {
	const dispatch = useDispatch()
	const settings = useSelector(getSettings)

	const playSFX = (sound: 'in' | 'out') => {
		let audioFile
		sound === 'in' && (audioFile = 'sfx/Toast_In.ogg')
		sound === 'out' && (audioFile = 'sfx/Toast_Out.ogg')
		const sfx: any = new Audio(audioFile)
		settings.soundOn === 'on' && sfx.play()
	}

	const handleClose = () => {
		playSFX('out')
		setTimeout(() => {
			dispatch({type: 'CLOSE_TOAST'})
		}, 250)
	}

	setOpen && playSFX('in')

	return (
		<>
			<Toast.Root
				open={setOpen}
				onOpenChange={handleClose}
				duration={5000}
				className={css.toast}
			>
				{image && <img src={image} alt="icon" />}
				<div className={css.content}>
					<Toast.Title className={css.title}>{title}</Toast.Title>
					<Toast.Description className={css.description}>
						{description}
					</Toast.Description>
				</div>
			</Toast.Root>
		</>
	)
}

export default ToastMessage
