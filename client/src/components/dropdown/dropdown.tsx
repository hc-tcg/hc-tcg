import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {ReactNode} from 'react'
import css from './dropdown.module.scss'

type DropdownOptions = {
	name: string
	key?: string
	icon?: string
}

type Props = {
	button: ReactNode
	label: string
	options: Array<DropdownOptions>
	action: (option: string) => void
}

const Dropdown = ({button, label, options, action}: Props) => {
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
						{label}
					</DropdownMenu.Label>
					{options.map((option) => (
						<DropdownMenu.RadioItem
							value={option.name}
							key={option.key || option.name}
							onSelect={() => action(option.name)}
							className={css.DropdownMenuItem}
						>
							{option.icon && (
								<img
									src={option.icon}
									style={{height: '1.5rem', width: '1.5rem'}}
									alt={option.icon}
								/>
							)}
							<span>{option.name}</span>
						</DropdownMenu.RadioItem>
					))}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}

export default Dropdown
