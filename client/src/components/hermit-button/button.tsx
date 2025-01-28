import classNames from 'classnames'
import React from 'react'
import css from './button.module.scss'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	image: string
	title: string
	background: string
	description: string
	onClick?: () => void
}

const HermitButton = ({
	image,
	title,
	description,
	background,
	onClick,
}: ButtonProps) => {
	return (
		<div className={css.buttonContainer} onMouseDown={onClick}>
			<div className={css.backgroundContainer}>
				<img
					src={`images/backgrounds/${background}.png`}
					className={css.backgroundImage}
				></img>
				<div className={css.vingette}></div>
			</div>
			<div className={classNames(css.button)}>
				<img
					src={`images/hermits-nobg/${image}.png`}
					className={css.hermitImage}
				></img>
				<div className={css.text}>
					<h1>{title}</h1>
					<p>{description}</p>
				</div>
			</div>
		</div>
	)
}

export default HermitButton
