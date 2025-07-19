import {ReactNode, useEffect, useRef, useState} from 'react'
import {HexColorPicker} from 'react-colorful'
import css from './dropdown.module.scss'
import './color-picker.scss'

type Props = {
	button: ReactNode
	action: React.Dispatch<React.SetStateAction<string>>
}

const ColorPickerDropdown = ({button, action}: Props) => {
	const [color, setColor] = useState('#ff0000')
	const [code, setCode] = useState('#ff0000')
	const [showDropdown, setShowDropdown] = useState<boolean>(false)
	const [di, setDi] = useState<boolean>(false)
	const buttonRef = useRef<HTMLButtonElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const onMouseUp = (e: MouseEvent) => {
		const buttonBounds = buttonRef.current?.getBoundingClientRect()
		const dropdownBounds = dropdownRef.current?.getBoundingClientRect()
		setDi(false)

		if (!dropdownBounds || !buttonBounds || di) return

		if (
			(e.x > buttonBounds.right ||
				e.x < buttonBounds.left ||
				e.y > buttonBounds.bottom ||
				e.y < buttonBounds.top) &&
			(e.x > dropdownBounds.right ||
				e.x < dropdownBounds.left ||
				e.y > dropdownBounds.bottom ||
				e.y < dropdownBounds.top)
		) {
			setShowDropdown(false)
		}
	}

	const onMouseDown = (e: MouseEvent) => {
		const dropdownBounds = dropdownRef.current?.getBoundingClientRect()
		if (!dropdownBounds) return

		if (
			e.x > dropdownBounds.right ||
			e.x < dropdownBounds.left ||
			e.y > dropdownBounds.bottom ||
			e.y < dropdownBounds.top
		) {
			return
		}

		setDi(true)
	}

	useEffect(() => {
		window.addEventListener('mousedown', onMouseDown, false)
		window.addEventListener('mouseup', onMouseUp, false)

		return () => {
			window.removeEventListener('mousedown', onMouseDown, false)
			window.removeEventListener('mouseup', onMouseUp, false)
		}
	})

	return (
		<div>
			<button ref={buttonRef} onMouseUp={() => setShowDropdown(!showDropdown)}>
				{button}
			</button>
			<div>
				{showDropdown && (
					<div className={css.dropdownContainer}>
						<div className={css.dropdownMenu}>
							<div className={css.DropdownMenuArrow} />
							<div>
								<div className={css.DropdownMenuContent} ref={dropdownRef}>
									<div className="colorPicker">
										<HexColorPicker
											color={color}
											onChange={(e) => {
												setColor(e)
												setCode(e)
												action(e)
											}}
										/>
										<input
											placeholder="Hex Code"
											className={css.input}
											value={code}
											onChange={(e) => {
												setColor(e.target.value)
												setCode(e.target.value)
												action(e.target.value)
											}}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default ColorPickerDropdown
