import React, {forwardRef} from 'react'
import css from './slider.module.scss'
import classnames from 'classnames'

type Props = React.HTMLProps<HTMLInputElement> & {
	className?: string
	children?: React.ReactNode
}

const Slider = forwardRef(
	(props: Props, ref: React.ForwardedRef<HTMLInputElement>) => {
		const {children, className, ...otherProps} = props
		return (
			<div className={classnames(css.slider, className)}>
				<div className={css.background} />
				<input
					min="0"
					max="100"
					placeholder={typeof children === 'string' ? children : ''}
					{...otherProps}
					ref={ref}
					type="range"
				/>
				<div className={css.label}>{children}</div>
			</div>
		)
	}
)

Slider.displayName = 'Slider'
export default Slider
