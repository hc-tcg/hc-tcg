import classNames from 'classnames'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages} from 'logic/messages'
import React, {
	memo,
	useEffect,
	useLayoutEffect,
	useReducer,
	useRef,
	useState,
} from 'react'
import {useDispatch, useSelector} from 'react-redux'
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

	const showAdvancedTooltips = useSelector(getSettings).showAdvancedTooltips

	const [, forceUpdate] = useReducer((x) => x + 1, 0)

	useEffect(() => {
		setTooltipSize(null)
	}, [showAdvancedTooltips, window.innerWidth])

	useEffect(() => {
		if (!tooltipSize) forceUpdate()
	}, [tooltipRef, tooltipSize])

	if (tooltipRef && tooltipRef.current && tooltipSize === null) {
		setTooltipSize({
			h: tooltipRef.current.offsetHeight,
			w: tooltipRef.current.offsetWidth,
		})
	}

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
			style={{
				visibility: tooltipSize ? 'visible' : 'hidden',
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
			onTouchStart={() => {
				toggleShow(true)
			}}
		>
			{children}
		</div>
	)

	if (tooltipSize === null || tooltipRef === null) {
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
	const dispatch = useDispatch()

	const [tooltipRef] = useState<React.RefObject<HTMLDivElement>>(
		useRef<HTMLDivElement>(null),
	)
	const [mousePosition, setMousePosition] = useState<{x: number; y: number}>({
		x: 0,
		y: 0,
	})
	const [inactiveTime, setInactiveTime] = useState<number>(0)
	const [shownByTouch, setShownByTouch] = useState<boolean>(false)
	const [touchTime, setTouchTime] = useState<number>(0)

	if (!anchor.current || inactiveTime > 2) {
		dispatch({
			type: localMessages.HIDE_TOOLTIP,
		})
	}

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

	const onMouseMove = (e: MouseEvent) => {
		if (shownByTouch) setShownByTouch(false)
		setMousePosition({x: e.x, y: e.y})
		const offsets = getOffsets()
		if (!offsets) return
		onMouseAction(offsets)
	}
	const onMouseScroll = () => {
		if (shownByTouch) return
		const offsets = getOffsets()
		if (!offsets) return
		onMouseAction(offsets)
	}
	const onMouseAction = (offsets: Offsets) => {
		if (!anchor.current || !tooltipRef || !tooltipRef.current) return

		if (
			!shownByTouch &&
			(mousePosition.x + 5 < offsets.left ||
				mousePosition.x - 5 > offsets.right ||
				mousePosition.y + 5 < offsets.top ||
				mousePosition.y - 5 > offsets.bottom)
		) {
			tooltipRef.current.style.top = '-9999px'
			tooltipRef.current.style.left = '-9999px'
			setInactiveTime(inactiveTime + 1)
			return
		}

		setInactiveTime(0)
		tooltipRef.current.style.top = `${offsets.showBelow ? offsets.below : offsets.above}px`
		tooltipRef.current.style.left = `${offsets.middle}px`
	}

	const onTouchStart = (e: TouchEvent) => {
		setShownByTouch(true)
		setTouchTime(0)
		const offsets = getOffsets()
		const result = e.touches[0]

		if (
			!offsets ||
			!anchor.current ||
			!tooltipRef ||
			!tooltipRef.current ||
			!result
		)
			return

		tooltipRef.current.style.top = '-9999px'
		tooltipRef.current.style.left = '-9999px'

		if (
			result.clientX < offsets.left ||
			result.clientX > offsets.right ||
			result.clientY < offsets.top ||
			result.clientY > offsets.bottom
		) {
			dispatch({
				type: localMessages.HIDE_TOOLTIP,
			})
		}
	}

	const onTouchEnd = () => {
		if (touchTime <= 5) {
			dispatch({
				type: localMessages.HIDE_TOOLTIP,
			})
		}
		setTouchTime(0)
	}

	const onTouchMove = () => {
		if (touchTime <= 5) {
			setTouchTime(0)
			return
		}
		const offsets = getOffsets()
		if (!offsets) return
		onMouseAction(offsets)
	}

	useLayoutEffect(() => {
		const interval = setInterval(() => {
			if (!shownByTouch || touchTime > 5) {
				const offsets = getOffsets()
				if (!offsets || !tooltipRef?.current) return
				tooltipRef.current.style.top = `${offsets.showBelow ? offsets.below : offsets.above}px`
				tooltipRef.current.style.left = `${offsets.middle}px`
				return
			}
			setTouchTime(touchTime + 1)
		}, 10)

		if (!shownByTouch) clearInterval(interval)

		window.addEventListener('scroll', onMouseScroll, true)
		window.addEventListener('mousemove', onMouseMove)
		window.addEventListener('touchstart', onTouchStart)
		window.addEventListener('touchmove', onTouchMove)
		window.addEventListener('touchend', onTouchEnd)

		return () => {
			window.removeEventListener('scroll', onMouseScroll, true)
			window.removeEventListener('mousemove', onMouseMove)
			window.removeEventListener('touchstart', onTouchStart)
			window.removeEventListener('touchmove', onTouchMove)
			window.removeEventListener('touchend', onTouchEnd)
			clearInterval(interval)
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

/** Tooltip container for testing the visuals for tooltips */
export function TooltipTestContainer({children}: {children: React.ReactNode}) {
	return <div className={css.tooltip}>{children}</div>
}

export default Tooltip
