import {Request} from 'express'
import url from 'url'

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
