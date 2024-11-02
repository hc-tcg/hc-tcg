import classNames from 'classnames'
import {localMessages} from 'logic/messages'
import React, {memo, useLayoutEffect, useRef, useState} from 'react'
import {useDispatch} from 'react-redux'
import css from './tooltip.module.scss'

type Props = {
	children: React.ReactElement
	tooltip: React.ReactNode
	showAboveModal?: boolean
}

type CurrentTooltipProps = {
	tooltip: React.ReactNode
	anchor: React.RefObject<HTMLDivElement>
}

const Tooltip = memo(({children, tooltip, showAboveModal}: Props) => {
	const dispatch = useDispatch()
	const childRef = useRef<HTMLDivElement>(null)

	function toggleShow(newShow: boolean) {
		if (newShow && childRef.current) {
			dispatch({
				type: localMessages.SHOW_TOOLTIP,
				tooltip: tooltipDiv,
				ref: childRef,
			})
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

export const CurrentTooltip = ({tooltip, anchor}: CurrentTooltipProps) => {
	if (!tooltip || !anchor.current) return
	const [tooltipRef] = useState<React.RefObject<HTMLDivElement>>(
		useRef<HTMLDivElement>(null),
	)
	const [positionerRef] = useState<React.RefObject<HTMLDivElement>>(
		useRef<HTMLDivElement>(null),
	)
	const [mousePosition, setMousePosition] = useState<{x: number; y: number}>({
		x: 0,
		y: 0,
	})
	const [prevHash, setPrevHash] = useState<number>(
		anchor.current.offsetHeight * anchor.current.offsetLeft,
	)
	const [activeTime, setActiveTime] = useState<number>(0)
	const padding = 10

	type Offsets = {
		above: number
		below: number
		middle: number
		top: number
		bottom: number
		left: number
		right: number
		showBelow: boolean
	}

	const getOffsets = (): Offsets | null => {
		if (
			!tooltipRef ||
			!tooltipRef.current ||
			!tooltipRef.current.children[0] ||
			!anchor.current ||
			!positionerRef ||
			!positionerRef.current
		) {
			return null
		}
		const child = anchor.current?.getBoundingClientRect()
		const box = tooltipRef.current.children[0].getBoundingClientRect()
		const positioner = positionerRef.current?.getBoundingClientRect()
		const height = box.height
		const width = box.width - child.width
		const showBelow = positioner.top < 50
		return {
			above: child.top - height - padding,
			below: child.bottom + padding,
			middle: Math.min(
				Math.max(child.left - width / 2, padding),
				window.innerWidth - box.width - padding,
			),
			top: child.top,
			left: child.left,
			bottom: child.bottom,
			right: child.right,
			showBelow,
		}
	}

	const onMouseMoveWithPosition = (e: MouseEvent) => {
		setMousePosition({x: e.x, y: e.y})
		const offsets = getOffsets()
		setActiveTime(activeTime + 1)

		if (
			!offsets ||
			!anchor.current ||
			!tooltipRef ||
			!tooltipRef.current ||
			!positionerRef ||
			!positionerRef.current
		)
			return

		if (
			mousePosition.x + 15 < offsets.left ||
			mousePosition.x - 15 > offsets.right ||
			mousePosition.y + 15 < offsets.top ||
			mousePosition.y - 15 > offsets.bottom ||
			prevHash !== anchor.current.offsetHeight * anchor.current.offsetLeft
		) {
			setPrevHash(anchor.current.offsetHeight * anchor.current.offsetLeft)
			setActiveTime(0)
			positionerRef.current.style.top = `${offsets.above}px`
			positionerRef.current.style.left = `${offsets.middle}px`
			tooltipRef.current.style.top = '-9999px'
			tooltipRef.current.style.left = '-9999px'
			return
		}

		if (activeTime < 3) {
			positionerRef.current.style.top = `${offsets.above}px`
			positionerRef.current.style.left = `${offsets.middle}px`
			return
		}

		positionerRef.current.style.top = `${offsets.above}px`
		positionerRef.current.style.left = `${offsets.middle}px`
		tooltipRef.current.style.top = `${offsets.showBelow ? offsets.below : offsets.above}px`
		tooltipRef.current.style.left = `${offsets.middle}px`
	}
	const onMouseMove = () => {
		const offsets = getOffsets()

		if (
			!offsets ||
			!anchor.current ||
			!tooltipRef ||
			!tooltipRef.current ||
			!positionerRef ||
			!positionerRef.current
		)
			return

		if (
			mousePosition.x + 5 < offsets.left ||
			mousePosition.x - 5 > offsets.right ||
			mousePosition.y + 5 < offsets.top ||
			mousePosition.y - 5 > offsets.bottom
		) {
			positionerRef.current.style.top = `${offsets.above}px`
			positionerRef.current.style.left = `${offsets.middle}px`
			tooltipRef.current.style.top = '-9999px'
			tooltipRef.current.style.left = '-9999px'
			return
		}

		positionerRef.current.style.top = `${offsets.above}px`
		positionerRef.current.style.left = `${offsets.middle}px`
		tooltipRef.current.style.top = `${offsets.showBelow ? offsets.below : offsets.above}px`
		tooltipRef.current.style.left = `${offsets.middle}px`
	}

	useLayoutEffect(() => {
		window.addEventListener('scroll', onMouseMove, true)
		window.addEventListener('mousemove', onMouseMoveWithPosition)
		return () => {
			window.removeEventListener('scroll', onMouseMove)
			window.removeEventListener('mousemove', onMouseMoveWithPosition)
		}
	})

	return (
		<div className={css.tooltipContainer}>
			<div
				className={css.tooltipBox}
				style={{
					top: -9999,
					left: -9999,
				}}
				ref={positionerRef}
			></div>
			<div
				className={css.tooltipBox}
				style={{
					top: -9999,
					left: -9999,
				}}
				ref={tooltipRef}
			>
				{tooltip}
			</div>
		</div>
	)
}

export default Tooltip
