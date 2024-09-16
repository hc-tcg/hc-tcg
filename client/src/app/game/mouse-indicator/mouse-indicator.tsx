import {useEffect, useRef, useState} from 'react'
import css from './mouse-indicator.module.css'

let globalClientX = -100
let globalClientY = -100
document.addEventListener(
	'mousemove',
	(ev: MouseEvent) => {
		globalClientX = ev.clientX
		globalClientY = ev.clientY
	},
	{passive: true},
)

type Props = {
	message: string
}
function MouseIndicator({message}: Props) {
	const elRef = useRef<HTMLDivElement>(null)
	const [mouseOut, setMouseOut] = useState(false)

	useEffect(() => {
		const moveListener = (ev: MouseEvent) => {
			if (!elRef.current) return
			elRef.current.style.left = ev.clientX + 'px'
			elRef.current.style.top = ev.clientY + 'px'
		}
		const outListener = () => setMouseOut(true)
		const overListener = () => setMouseOut(false)
		document.addEventListener('mousemove', moveListener, {passive: true})
		window.addEventListener('mouseout', outListener, {passive: true})
		window.addEventListener('mouseover', overListener, {passive: true})
		return () => {
			document.removeEventListener('mousemove', moveListener)
			window.addEventListener('mouseout', outListener, {passive: true})
			window.addEventListener('mouseover', overListener, {passive: true})
		}
	}, [])

	return (
		<div
			ref={elRef}
			className={css.mouseIndicator}
			style={{
				display: mouseOut ? 'none' : 'block',
				left: globalClientX + 'px',
				top: globalClientY + 'px',
			}}
		>
			{message}
		</div>
	)
}

export default MouseIndicator
