import url from 'url'
import {Request} from 'express'

export function requestUrlRoot(req: Request) {
	return url.format({
		protocol: req.protocol,
		host: req.get('host'),
	})
}

export function joinUrl(a: string, b: string) {
	if (a.endsWith('/')) {
		a = a.slice(0, a.length - 1)
	}
	if (b.startsWith('/')) {
		b = b.slice(1, b.length)
	}
	return `${a}/${b}`
}

export function NumberOrNull(a: any | null) {
	if (a !== null && a !== undefined) return Number(a)
	return null
}
