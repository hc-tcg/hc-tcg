import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {ReactNode, useState} from 'react'
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

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>{button}</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					className={css.DropdownMenuContent}
					sideOffset={0}
					align="start"
				>
					<DropdownMenu.Arrow className={css.DropdownMenuArrow} />
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
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}

export default ColorPickerDropdown
