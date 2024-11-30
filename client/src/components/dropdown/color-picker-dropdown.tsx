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
			<button ref={buttonRef} onMouseUp={() => setShowDropdown(!showDropdown)}>
				{button}
			</button>
			<div>
				{showDropdown && (
					<div className={css.dropdownContainer}>
						<div className={css.dropdownMenu}>
							<div className={css.DropdownMenuArrow} />
							<div>
								<div className={css.DropdownMenuContent}>
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
