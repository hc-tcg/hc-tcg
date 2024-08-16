import * as Toast from '@radix-ui/react-toast'
import {localMessages, useMessageDispatch} from 'logic/messages'
import css from './toast.module.scss'

type Props = {
	title: string
	description: string
	image?: string
	setOpen: boolean
}

const ToastMessage = ({setOpen, title, description, image}: Props) => {
	const dispatch = useMessageDispatch()

	const handleClose = () => {
		dispatch({
			type: localMessages.SOUND_PLAY,
			path: 'sfx/Toast_Out.ogg',
		})
		setTimeout(() => {
			dispatch({type: localMessages.TOAST_CLOSE})
		}, 250)
	}

	setOpen &&
		dispatch({
			type: localMessages.SOUND_PLAY,
			path: 'sfx/Toast_In.ogg',
		})

	return (
		<>
			<Toast.Root
				open={setOpen}
				onOpenChange={handleClose}
				duration={5000}
				className={css.toast}
			>
				{image && <img src={image} draggable={false} alt="icon" />}
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
