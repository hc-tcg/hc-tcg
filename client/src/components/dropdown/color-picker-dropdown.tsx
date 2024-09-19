import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {ReactNode, useState} from 'react'
import css from './dropdown.module.scss'
import {HexColorPicker} from 'react-colorful'

type DropdownOptions = {
	name: string
	key?: string
	icon?: string
}

type Props = {
	button: ReactNode
	action: React.Dispatch<React.SetStateAction<string>>
}

const ColorPickerDropdown = ({button, action}: Props) => {
	const [color, setColor] = useState('#aabbcc')

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
					<DropdownMenu.Label className={css.DropdownMenuLabel}>
						Color Picker
					</DropdownMenu.Label>
					<HexColorPicker
						color={color}
						onChange={(e) => {
							setColor(e)
							action(e)
						}}
					/>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}

export default ColorPickerDropdown
