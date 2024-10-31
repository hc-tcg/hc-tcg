import classNames from 'classnames'
import React, {memo, useLayoutEffect, useRef, useState} from 'react'
import css from './tooltip.module.scss'
import {useDispatch} from 'react-redux'
import {localMessages} from 'logic/messages'

type Props = {
	children: React.ReactElement
	tooltip: React.ReactNode
	showAboveModal?: boolean
}

type CurrentTooltipProps = {
	tooltip: React.ReactNode
	showAboveModal?: boolean
}

const Tooltip = memo(({children, tooltip, showAboveModal}: Props) => {
	const dispatch = useDispatch()
	const childRef = useRef<HTMLDivElement>(null)

	function toggleShow(newShow: boolean) {
		if (newShow && childRef.current) {
			childRef.current.id = 'currentTooltipChild'
			dispatch({
				type: localMessages.SHOW_TOOLTIP,
				tooltip: tooltipDiv,
			})
		} else if (childRef.current) {
			childRef.current.id = ''
			// dispatch({
			// 	type: localMessages.HIDE_TOOLTIP,
			// })
		}
	}

	const tooltipDiv = (
		<div
			className={classNames(css.tooltip, showAboveModal && css.showAboveModal)}
			style={{
				visibility: 'visible',
			}}
		>
			{tooltip}
		</div>
	)

	const childrenContainer = (
		<div
			ref={childRef}
			onPointerOver={() => {
				toggleShow(true)
			}}
			onPointerOut={() => {
				toggleShow(false)
			}}
		>
			{children}
		</div>
	)

	return childrenContainer
})

export const CurrentTooltip = (props: CurrentTooltipProps) => {
	const child = document.getElementById('currentTooltipChild')
	const tooltipRef = useRef<HTMLDivElement>(null)
	const positioner = useRef<HTMLDivElement>(null)
	const padding = 10

	const childRect = child ? child.getBoundingClientRect() : null

	const initialTop = childRect ? childRect.top : -9999
	const initialBottom = childRect ? childRect.bottom : 0
	const initialLeft = childRect ? childRect.left : -9999
	const initialRight = childRect ? childRect.right : 0
	const childWidth = childRect ? childRect.width : 0

	const [childPosition, setChildPosition] = useState({
		left: -9999,
		top: -9999,
		right: 0,
		bottom: 0,
	})
	const [bottom, setBottom] = useState<number>(initialBottom)

	type Offsets = {
		top: number
		left: number
		showBelow: boolean
	}

	const getOffsets = (): Offsets | null => {
		if (
			!tooltipRef ||
			!tooltipRef.current ||
			!tooltipRef.current.children[0] ||
			!positioner ||
			!positioner.current
		) {
			return null
		}
		const rect = tooltipRef.current.children[0].getBoundingClientRect()
		const height = rect.height
		const width = rect.width - childWidth
		const showBelow = positioner.current.getBoundingClientRect().top < 50
		return {
			top: -1 * height - padding,
			left: (-1 * width) / 2,
			showBelow: showBelow,
		}
	}

	useLayoutEffect(() => {
		const onMouseMove = () => {
			if (positioner) {
				setChildPosition({
					left: initialLeft,
					top: initialTop,
					bottom: initialBottom,
					right: initialRight,
				})
				setBottom(initialBottom)
			}
		}
		window.addEventListener('scroll', onMouseMove, true)
		window.addEventListener('mousemove', onMouseMove)
		return () => {
			window.removeEventListener('scroll', onMouseMove)
			window.removeEventListener('mousemove', onMouseMove)
		}
	})

	const offsets = getOffsets()

	return (
		<div className={css.bigBox}>
			<div
				ref={positioner}
				className={css.tooltipBox}
				style={{
					top: offsets ? childPosition.top + offsets.top : -1000,
					left: offsets ? childPosition.left + offsets.left : -1000,
				}}
			></div>
			<div
				className={css.tooltipBox}
				style={{
					top: offsets
						? offsets.showBelow
							? bottom + padding
							: childPosition.top + offsets.top
						: -1000,
					left: offsets ? childPosition.left + offsets.left : -1000,
					zIndex: 130,
				}}
				ref={tooltipRef}
			>
				{props.tooltip}
			</div>
		</div>
	)
}

export default Tooltip
