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
	action: (option: string) => void
}

const Dropdown = ({
	button,
	label,
	options,
	showNames,
	grid,
	maxHeight,
	action,
}: Props) => {
	const [showDropdown, setShowDropdown] = useState<boolean>(false)
	const buttonRef = useRef<HTMLButtonElement>(null)

	const onMouseUp = (e: MouseEvent) => {
		const boundingBox = buttonRef.current?.getBoundingClientRect()
		if (
			boundingBox &&
			(e.x > boundingBox.right ||
				e.x < boundingBox.left ||
				e.y > boundingBox.bottom ||
				e.y < boundingBox.top)
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
			<button
				ref={buttonRef}
				onMouseUp={() => setShowDropdown(!showDropdown)}
				className={css.dropdownButton}
			>
				{button}
			</button>
			<div>
				{showDropdown && (
					<div className={css.dropdownMenu}>
						<div className={css.DropdownMenuArrow} />
						<div>
							<div className={css.DropdownMenuContent}>
								<div className={css.DropdownMenuLabel}>{label}</div>
								<div
									style={
										grid && maxHeight
											? {
													display: 'grid',
													gridAutoFlow: 'column',
													gridTemplateRows: `repeat(${maxHeight}, 2rem)`,
													gridTemplateColumns: `repeat(${Math.ceil(options.length / maxHeight)}, 2rem)`,
												}
											: {}
									}
								>
									{options.map((option) => (
										<div
											key={option.key || option.name}
											onMouseUp={() => action(option.key || option.name)}
											className={css.DropdownMenuItem}
										>
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
					</div>
				)}
			</div>
		</div>
	)
}

export default Dropdown
