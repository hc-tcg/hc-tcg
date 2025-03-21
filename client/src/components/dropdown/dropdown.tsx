import classNames from 'classnames'
import {localMessages} from 'logic/messages'
import {getDropdown} from 'logic/session/session-selectors'
import {ReactNode, useEffect, useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import css from './dropdown.module.scss'

type DropdownOptions = {
	name: string
	key?: string
	icon?: string
	color?: string
}

type Props = {
	button: ReactNode
	label: string
	options: Array<DropdownOptions>
	showNames: boolean
	grid?: boolean
	maxHeight?: number
	checkboxes?: boolean
	checked?: Array<string>
	direction?: 'up' | 'down'
	align?: 'left' | 'right'
	action?: (option: string) => void
	checkboxAction?: (option: Array<string>) => void
}

const Dropdown = ({
	label,
	options,
	showNames,
	grid,
	maxHeight,
	checkboxes,
	checked,
	direction,
	align,
	action,
	checkboxAction,
	buttonRef,
}: Props & {buttonRef: React.RefObject<HTMLButtonElement>}) => {
	const dispatch = useDispatch()
	const filterMenuRef = useRef<HTMLDivElement>(null)
	const [newMenu, setNewMenu] = useState<boolean>(true)
	const [newChecked, setChecked] = useState<Array<string>>(checked || [])

	const calculateShow = (x: number, y: number) => {
		const boundingBox = buttonRef.current?.getBoundingClientRect()
		const menuBoundingBox = filterMenuRef.current?.getBoundingClientRect()

		if (newMenu) {
			setNewMenu(false)
			return
		}

		if (!checkboxes) {
			dispatch({
				type: localMessages.HIDE_DROPDOWN,
			})
		}

		if (
			checkboxes &&
			menuBoundingBox &&
			boundingBox &&
			(x > boundingBox.right ||
				x < boundingBox.left ||
				y > boundingBox.bottom ||
				y < boundingBox.top) &&
			(x > menuBoundingBox.right ||
				x < menuBoundingBox.left ||
				y > menuBoundingBox.bottom ||
				y < menuBoundingBox.top)
		)
			dispatch({
				type: localMessages.HIDE_DROPDOWN,
			})
	}

	const onMouseUp = (e: MouseEvent) => {
		calculateShow(e.x, e.y)
	}

	useEffect(() => {
		window.addEventListener('mouseup', onMouseUp, false)

		return () => {
			window.removeEventListener('mouseup', onMouseUp, false)
		}
	})

	const mouseDownAction = (option: {key?: string; name: string}) => {
		if (!checkboxes && action) {
			action(option.key || option.name)
		}
		if (!checkboxes || !option.key) return
		const ch = [...newChecked]
		const updatedChecked =
			option.key === 'any'
				? []
				: ch.includes(option.key)
					? ch.filter((a) => a !== option.key)
					: [option.key, ...ch]

		setChecked(updatedChecked)
		if (checkboxAction) checkboxAction(updatedChecked)
	}

	return (
		<div className={css.dropdownContainer}>
			<div
				className={classNames(
					css.dropdownMenu,
					direction && css[direction],
					css[align ? align : 'left'],
				)}
				ref={filterMenuRef}
			>
				{direction !== 'up' && (
					<div
						className={classNames(
							css.DropdownMenuArrow,
							css[align ? align : 'left'],
						)}
					/>
				)}
				<div>
					<div
						className={classNames(
							css.dropdownMenuContent,
							direction && css[direction],
						)}
					>
						<div className={css.DropdownMenuLabel}>{label}</div>
						<div
							style={
								grid && maxHeight
									? {
											display: 'grid',
											gridAutoFlow: 'row',
											gridTemplateRows: `repeat(${maxHeight}, 2rem)`,
											gridTemplateColumns: `repeat(${Math.ceil(options.length / maxHeight)}, 2rem)`,
										}
									: {}
							}
						>
							{options.map((option, i) => (
								<div
									key={option.key || option.name}
									onMouseDown={() => mouseDownAction(option)}
									className={css.DropdownMenuItem}
								>
									{checkboxes && (
										<div>
											{newChecked &&
											option.key &&
											newChecked.includes(option.key) ? (
												<div
													className={classNames(
														css.checkbox,
														css.checked,
														i === 0 && css.hidden,
													)}
												></div>
											) : (
												<div
													className={classNames(
														css.checkbox,
														i === 0 && css.hidden,
													)}
												>
													{' '}
												</div>
											)}
										</div>
									)}
									{option.icon && (
										<img
											src={option.icon}
											style={{height: '1.5rem', width: '1.5rem'}}
											alt={option.icon}
										/>
									)}
									{option.color && (
										<div
											className={css.color}
											style={{backgroundColor: option.color}}
										></div>
									)}
									{showNames && <span>{option.name}</span>}
								</div>
							))}
						</div>
					</div>
				</div>
				{direction === 'up' && (
					<div
						className={classNames(
							css.DropdownMenuArrowUp,
							css[align ? align : 'left'],
						)}
					/>
				)}
			</div>
		</div>
	)
}

const DropdownButton = ({
	button,
	label,
	options,
	showNames,
	grid,
	maxHeight,
	checkboxes,
	checked,
	direction,
	align,
	action,
	checkboxAction,
}: Props) => {
	const dispatch = useDispatch()
	const buttonRef = useRef<HTMLButtonElement>(null)
	const dropdown = useSelector(getDropdown)

	const dispatchDropdown = () => {
		if (!buttonRef.current) return
		const boundingBox = buttonRef.current.getBoundingClientRect()

		if (dropdown) {
			dispatch({
				type: localMessages.HIDE_DROPDOWN,
			})
			return
		}

		dispatch({
			type: localMessages.SHOW_DROPDOWN,
			dropdown: (
				<Dropdown
					button={button}
					label={label}
					options={options}
					showNames={showNames}
					grid={grid}
					maxHeight={maxHeight}
					checkboxes={checkboxes}
					checked={checked}
					direction={direction}
					align={align}
					action={action}
					checkboxAction={checkboxAction}
					buttonRef={buttonRef}
				/>
			),
			x: boundingBox.x,
			y: boundingBox.y,
			direction: direction || 'down',
			align: align || 'left',
		})
	}

	return (
		<div>
			<button
				ref={buttonRef}
				onMouseUp={dispatchDropdown}
				className={css.dropdownButton}
			>
				{button}
			</button>
		</div>
	)
}

export const CurrentDropdown = ({
	dropdown,
	x,
	y,
	direction,
	align,
}: {
	dropdown: ReactNode
	x: number
	y: number
	direction: 'up' | 'down'
	align: 'left' | 'right'
}) => {
	return (
		<div
			className={css.currentDropdown}
			style={{
				top: direction === 'down' ? `calc(${y}px + 2rem)` : 0,
				left: align === 'left' ? x : 0,
				overflow: 'hidden',
				height:
					direction === 'down'
						? `calc(${window.screen.height - y}px - 2rem)`
						: y,
				width:
					align === 'left' ? window.screen.width - x : `calc(${x}px + 2rem)`,
			}}
		>
			{dropdown}
		</div>
	)
}

export default DropdownButton
