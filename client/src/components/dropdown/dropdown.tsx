import classNames from 'classnames'
import {ReactNode, useEffect, useRef, useState} from 'react'
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
	action: (option: string) => void
}

const Dropdown = ({
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
}: Props) => {
	const [showDropdown, setShowDropdown] = useState<boolean>(false)
	const buttonRef = useRef<HTMLButtonElement>(null)
	const filterMenuRef = useRef<HTMLDivElement>(null)

	const onMouseUp = (e: MouseEvent) => {
		const boundingBox = buttonRef.current?.getBoundingClientRect()
		const menuBoundingBox = filterMenuRef.current?.getBoundingClientRect()
		if (
			!checkboxes &&
			boundingBox &&
			(e.x > boundingBox.right ||
				e.x < boundingBox.left ||
				e.y > boundingBox.bottom ||
				e.y < boundingBox.top)
		)
			setShowDropdown(false)

		if (
			checkboxes &&
			menuBoundingBox &&
			boundingBox &&
			(e.x > boundingBox.right ||
				e.x < boundingBox.left ||
				e.y > boundingBox.bottom ||
				e.y < boundingBox.top) &&
			(e.x > menuBoundingBox.right ||
				e.x < menuBoundingBox.left ||
				e.y > menuBoundingBox.bottom ||
				e.y < menuBoundingBox.top)
		)
			setShowDropdown(false)
	}

	useEffect(() => {
		window.addEventListener('mouseup', onMouseUp, false)

		return () => {
			window.removeEventListener('mouseup', onMouseUp, false)
		}
	})

	return (
		<div>
			{direction !== 'up' && (
				<button
					ref={buttonRef}
					onMouseUp={() => setShowDropdown(!showDropdown)}
					className={css.dropdownButton}
				>
					{button}
				</button>
			)}
			<div>
				{showDropdown && (
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
												onMouseUp={() => action(option.key || option.name)}
												className={css.DropdownMenuItem}
											>
												{checkboxes && (
													<div>
														{checked &&
														option.key &&
														checked.includes(option.key) ? (
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
				)}
			</div>
			{direction === 'up' && (
				<button
					ref={buttonRef}
					onMouseUp={() => setShowDropdown(!showDropdown)}
					className={css.dropdownButton}
				>
					{button}
				</button>
			)}
		</div>
	)
}

export default Dropdown
