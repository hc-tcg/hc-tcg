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
	tooltipHeight: number
	tooltipWidth: number
	anchor: React.RefObject<HTMLDivElement>
}

const Tooltip = memo(({children, tooltip, showAboveModal}: Props) => {
	const dispatch = useDispatch()
	const childRef = useRef<HTMLDivElement>(null)
	const tooltipRef = useRef<HTMLDivElement>(null)
	const [tooltipSize, setTooltipSize] = useState<{h: number; w: number} | null>(
		null,
	)

	function toggleShow(newShow: boolean) {
		if (newShow && childRef.current && tooltipSize) {
			dispatch({
				type: localMessages.SHOW_TOOLTIP,
				tooltip: tooltipDiv,
				anchor: childRef,
				tooltipHeight: tooltipSize.h,
				tooltipWidth: tooltipSize.w,
			})
		}
	}

	const tooltipDiv = (
		<div
			className={classNames(css.tooltip, showAboveModal && css.showAboveModal)}
			ref={tooltipRef}
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

	if (tooltipSize === null) {
		if (tooltipRef && tooltipRef.current) {
			const box = tooltipRef.current.getBoundingClientRect()
			setTooltipSize({h: box.height, w: box.width})
		}
		return (
			<div>
				{tooltipDiv}
				{childrenContainer}
			</div>
		)
	}

	return childrenContainer
})

export const CurrentTooltip = ({
	tooltip,
	anchor,
	tooltipHeight,
	tooltipWidth,
}: CurrentTooltipProps) => {
	const [tooltipRef] = useState<React.RefObject<HTMLDivElement>>(
		useRef<HTMLDivElement>(null),
	)
	const [mousePosition, setMousePosition] = useState<{x: number; y: number}>({
		x: 0,
		y: 0,
	})
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
		if (!anchor.current) {
			return null
		}
		const child = anchor.current?.getBoundingClientRect()
		const height = tooltipHeight
		const width = tooltipWidth - child.width
		const showBelow = child.top - tooltipHeight - padding < 50
		return {
			above: child.top - height - padding,
			below: child.bottom + padding,
			middle: Math.min(
				Math.max(child.left - width / 2, padding),
				window.innerWidth - tooltipWidth - padding,
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
		onMouseMove(offsets)
	}
	const onMouseMove = (offsets: Offsets | null) => {
		if (!offsets) offsets = getOffsets()

		if (!offsets || !anchor.current || !tooltipRef || !tooltipRef.current)
			return

		if (
			mousePosition.x + 5 < offsets.left ||
			mousePosition.x - 5 > offsets.right ||
			mousePosition.y + 5 < offsets.top ||
			mousePosition.y - 5 > offsets.bottom
		) {
			tooltipRef.current.style.top = '-9999px'
			tooltipRef.current.style.left = '-9999px'
			return
		}

		tooltipRef.current.style.top = `${offsets.showBelow ? offsets.below : offsets.above}px`
		tooltipRef.current.style.left = `${offsets.middle}px`
	}

	useLayoutEffect(() => {
		window.addEventListener('scroll', () => onMouseMove(null), true)
		window.addEventListener('mousemove', onMouseMoveWithPosition)
		return () => {
			window.removeEventListener('scroll', () => onMouseMove(null))
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
				ref={tooltipRef}
			>
				{tooltip}
			</div>
		</div>
	)
}

export default Tooltip
