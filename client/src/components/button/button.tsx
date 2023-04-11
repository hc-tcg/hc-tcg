import classNames from 'classnames'
import css from './button.module.scss'
import {ReactNode, forwardRef} from 'react'
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	ref?: any
	variant?: 'default' | 'primary' | 'secondary' | 'error' | 'stone'
	size?: 'small' | 'medium' | 'large'
	emphasis?: boolean
	leftSlot?: ReactNode
	rightSlot?: ReactNode
	children: ReactNode
	attributes?: HTMLButtonElement
	onClick?: () => void
}

const Button = ({
	variant,
	size,
	emphasis,
	leftSlot,
	rightSlot,
	children,
	onClick,
	...props
}: ButtonProps) => {
	return (
		<button
			{...props}
			className={classNames(
				css.button,
				variant && css[variant],
				size && css[size],
				emphasis && css.emphasis,
				props.className
			)}
			onClick={onClick}
		>
			{leftSlot && <span className={css.leftSlot}>{leftSlot}</span>}
			{children}
			{rightSlot && <span className={css.rightSlot}>{rightSlot}</span>}
		</button>
	)
}

const RefButton = forwardRef(function TestButton(
	{
		variant,
		size,
		emphasis,
		leftSlot,
		rightSlot,
		children,
		onClick,
		...props
	}: ButtonProps,
	ref: React.ForwardedRef<any>
) {
	return (
		<button
			{...props}
			ref={ref}
			className={classNames(
				css.button,
				variant && css[variant],
				size && css[size],
				emphasis && css.emphasis,
				props.className
			)}
			onClick={onClick}
		>
			{leftSlot && <span className={css.leftSlot}>{leftSlot}</span>}
			{children}
			{rightSlot && <span className={css.rightSlot}>{rightSlot}</span>}
		</button>
	)
})

interface SplitButtonT extends React.ComponentPropsWithRef<'div'> {
	children: ReactNode
	props?: React.HTMLAttributes<HTMLDivElement>
}

const SplitButton = ({children, ...props}: SplitButtonT) => (
	<div className={css.splitButton} {...props}>
		{children}
	</div>
)

Button.SplitGroup = SplitButton
Button.Ref = RefButton

export default Button
