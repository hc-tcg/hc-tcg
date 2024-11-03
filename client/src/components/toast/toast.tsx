import {localMessages, useMessageDispatch} from 'logic/messages'
import {useEffect, useRef, useState} from 'react'
import css from './toast.module.scss'

type Props = {
	title: string
	description: string
	image?: string
}

const ToastMessage = ({title, description, image}: Props) => {
	const dispatch = useMessageDispatch()
	const maxLength = 18 // 1 unit = 200ms
	const toastRef = useRef<HTMLDivElement>(null)
	const [aliveTime, setAliveTime] = useState<number>(0)
	const [totalMovement, setTotalMovement] = useState<number>(0)
	const [dragging, setDragging] = useState<boolean>(false)
	const [closeOnLift, setCloseOnLift] = useState<boolean>(false)

	const slideOut: Keyframe[] = [
		{
			transform: 'translateX(calc(100% + 5px))',
		},
	]

	const testForSlide = (e: MouseEvent) => {
		if (!e.buttons) {
			setDragging(false)
			return
		}
		if (!toastRef || !toastRef.current) return
		const toastBoundingBox = toastRef.current.getBoundingClientRect()
		if (
			!dragging &&
			(e.pageX < toastBoundingBox.left || e.pageY > toastBoundingBox.bottom)
		)
			return
		setDragging(true)
		setAliveTime(1)
		setTotalMovement(Math.max(totalMovement + e.movementX, 0))
		toastRef.current.style.transform = `translateX(${Math.max(totalMovement + e.movementX, 0)}px)`
		if (totalMovement + e.movementX > 0) {
			setCloseOnLift(true)
		} else {
			setCloseOnLift(false)
		}
	}

	useEffect(() => {
		if (closeOnLift) {
			setAliveTime(maxLength)
			setCloseOnLift(false)
		}
		const interval = setInterval(() => {
			if (aliveTime === 0) {
				dispatch({
					type: localMessages.SOUND_PLAY,
					path: 'sfx/Toast_In.ogg',
				})
			}
			if (aliveTime === maxLength) {
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
			if (aliveTime === maxLength + 1) {
				dispatch({type: localMessages.TOAST_CLOSE})
			}
			setAliveTime(aliveTime + 1)
		}, 200)
		window.addEventListener('mousemove', testForSlide)
		return () => {
			clearInterval(interval)
			window.removeEventListener('mousemove', testForSlide)
		}
	}, [aliveTime])

	return (
		<div className={css.toastContainer}>
			<div className={css.toast} data-state="open" ref={toastRef}>
				{image && <img src={image} alt="icon" />}
				<div className={css.content}>
					<div className={css.title}>{title}</div>
					<div className={css.description}>{description}</div>
				</div>
			</div>
		</div>
	)
}

export default ToastMessage
