import css from './tooltip.module.scss'
import React, {useState} from 'react'
import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	useHover,
	useFocus,
	useDismiss,
	useRole,
	useInteractions,
	FloatingPortal,
} from '@floating-ui/react'

type Props = {
	children: React.ReactElement
	tooltip: React.ReactNode
}

function Tooltip({children, tooltip}: Props) {
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

	return (
		<>
			{React.cloneElement(children, {
				ref: refs.setReference,
				...getReferenceProps(),
			})}
			<FloatingPortal>
				{open && (
					<div
						className={css.tooltip}
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
				)}
			</FloatingPortal>
		</>
	)
}

export default Tooltip
