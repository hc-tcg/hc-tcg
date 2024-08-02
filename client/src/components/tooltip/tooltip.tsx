import {
	FloatingPortal,
	autoUpdate,
	flip,
	offset,
	shift,
	useDismiss,
	useFloating,
	useFocus,
	useHover,
	useInteractions,
	useRole,
} from '@floating-ui/react'
import classNames from 'classnames'
import React, {memo, useState} from 'react'
import css from './tooltip.module.scss'

type Props = {
	children: React.ReactElement
	tooltip: React.ReactNode
	showAboveModal?: boolean
}

const Tooltip = memo(({children, tooltip, showAboveModal}: Props) => {
	const [open, setOpen] = useState(false)

	const {x, y, refs, strategy, context} = useFloating({
		open,
		onOpenChange: setOpen,
		placement: 'top',
		// Make sure the tooltip stays on the screen
		whileElementsMounted: autoUpdate,
		middleware: [
			offset(5),
			flip({
				crossAxis: false,
				fallbackAxisSideDirection: 'start',
			}),
			shift(),
		],
	})

	// Event listeners to change the open state
	const hover = useHover(context, {move: false, restMs: 200})
	const focus = useFocus(context)
	const dismiss = useDismiss(context)
	// Role props for screen readers
	const role = useRole(context, {role: 'tooltip'})

	// Merge all the interactions into prop getters
	const {getReferenceProps, getFloatingProps} = useInteractions([
		hover,
		focus,
		dismiss,
		role,
	])

	let floatingPortal = null

	if (open) {
		floatingPortal = (
			<FloatingPortal>
				<div
					className={classNames(
						css.tooltip,
						showAboveModal && css.showAboveModal,
					)}
					ref={refs.setFloating}
					style={{
						position: strategy,
						top: y ?? 0,
						left: x ?? 0,
					}}
					{...getFloatingProps()}
				>
					{tooltip}
				</div>
			</FloatingPortal>
		)
	}

	return (
		<>
			{React.cloneElement(children, {
				ref: refs.setReference,
				...getReferenceProps(),
			})}
			{floatingPortal}
		</>
	)
})

export default Tooltip
