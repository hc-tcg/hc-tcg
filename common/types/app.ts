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

export type RematchData = {
	opponentId: string
	time: number
	playerScore: number
	opponentScore: number
	spectatorCode: string | null
}
