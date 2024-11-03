import {localMessages, useMessageDispatch} from 'logic/messages'
import {useEffect, useLayoutEffect, useRef, useState} from 'react'
import css from './toast.module.scss'

type Props = {
	title: string
	description: string
	image?: string
	id: number
}

type ContainerProps = {
	children: Array<React.ReactElement>
}

const ToastMessage = ({title, description, image, id}: Props) => {
	const dispatch = useMessageDispatch()
	const maxOpenFor = 19 // 1 unit = 200ms
	const toastRef = useRef<HTMLDivElement>(null)
	const [aliveTime, setAliveTime] = useState<number>(0)
	const [totalMovement, setTotalMovement] = useState<number>(0)
	const [dragging, setDragging] = useState<boolean>(false)

	const slideOut: Keyframe[] = [
		{
			transform: 'translateX(calc(100% + 10px))',
		},
	]

	const testForSlide = (e: MouseEvent) => {
		if (!e.buttons && dragging) mouseUp()
		if (!e.buttons) return
		if (!toastRef || !toastRef.current) return
		if (!dragging) {
			const toastBoundingBox = toastRef.current.getBoundingClientRect()
			if (
				e.pageX < toastBoundingBox.left ||
				e.pageY < toastBoundingBox.top ||
				e.pageY > toastBoundingBox.bottom
			)
				return
		}
		setDragging(true)
		setAliveTime(1)
		if (e.movementX) setTotalMovement(totalMovement + e.movementX)
		toastRef.current.style.transform = `translateX(${Math.max(totalMovement + e.movementX, 0)}px)`
	}

	const mouseUp = () => {
		if (dragging && totalMovement > 0) setAliveTime(maxOpenFor)
		setDragging(false)
		return
	}

	useEffect(() => {
		if (aliveTime === maxOpenFor) {
			dispatch({
				type: localMessages.SOUND_PLAY,
				path: 'sfx/Toast_Out.ogg',
			})
			if (toastRef.current) {
				toastRef.current.animate(slideOut, {
					fill: 'forwards',
					duration: 200,
				})
			}
		}
		if (aliveTime === maxOpenFor + 1) {
			dispatch({type: localMessages.TOAST_CLOSE, id: id})
		}

		const interval = setInterval(() => {
			if (aliveTime === 0) {
				dispatch({
					type: localMessages.SOUND_PLAY,
					path: 'sfx/Toast_In.ogg',
				})
			}
			setAliveTime(aliveTime + 1)
		}, 200)
		return () => {
			clearInterval(interval)
		}
	}, [aliveTime, totalMovement])

	useLayoutEffect(() => {
		window.addEventListener('mousemove', testForSlide)
		window.addEventListener('mouseup', mouseUp)

		return () => {
			window.removeEventListener('mousemove', testForSlide)
			window.removeEventListener('mouseup', mouseUp)
		}
	}, [aliveTime, totalMovement])

	return (
		<div
			className={css.toast}
			ref={toastRef}
			onDoubleClick={() => setAliveTime(maxOpenFor)}
		>
			{image && <img src={image} alt="icon" />}
			<div className={css.content}>
				<div className={css.title}>{title}</div>
				<div className={css.description}>{description}</div>
			</div>
		</div>
	)
}

export const ToastContainer = ({children}: ContainerProps) => {
	return <div className={css.toastContainer}>{...children}</div>
}

export default ToastMessage
