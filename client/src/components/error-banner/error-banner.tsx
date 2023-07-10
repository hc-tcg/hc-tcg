import {HTMLAttributes, ReactNode} from 'react'
import css from './error-banner.module.scss'
import {ErrorIcon} from 'components/svgs'

interface Props extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
	textOnly?: boolean
	attributes?: HTMLDivElement
}

const ErrorBanner = ({children, textOnly, ...attributes}: Props) => {
	return (
		<div
			{...attributes}
			className={`${css.error} ${textOnly && css.text} ${attributes?.className}`}
		>
			<span>{<ErrorIcon />}</span> {children}
		</div>
	)
}

export default ErrorBanner
