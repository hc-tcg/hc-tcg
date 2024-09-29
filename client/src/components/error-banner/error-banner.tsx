import {ErrorIcon} from 'components/svgs'
import {HTMLAttributes, ReactNode} from 'react'
import css from './error-banner.module.scss'

interface Props extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
	textOnly?: boolean
	hide?: boolean
	attributes?: HTMLDivElement
}

const ErrorBanner = ({children, textOnly, hide, ...attributes}: Props) => {
	return (
		<div
			{...attributes}
			className={`${css.error} ${textOnly && css.text} ${attributes?.className} ${!hide && css.shake} ${hide && css.hide}`}
		>
			<span>{<ErrorIcon />}</span> {children}
		</div>
	)
}

export default ErrorBanner
