export type ToastT = {
	open: boolean
	title: string
	description: string
	image?: string
}

export type ToastData = {
	id: number
	toast: ToastT
	closed: boolean
}
