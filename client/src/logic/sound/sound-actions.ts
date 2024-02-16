export const sectionChange = (payload: string) => ({
	type: '@sound/SECTION_CHANGE' as const,
	payload,
})
export type SectionChangeT = ReturnType<typeof sectionChange>

export const playSound = (path: string) => ({
	type: '@sound/PLAY_SOUND' as const,
	payload: path,
})
export type PlaySoundT = ReturnType<typeof playSound>

export const controlVoiceTest = (payload: 'PLAY' | 'STOP') => ({
	type: 'VOICE_TEST' as const,
	payload,
})
export type VoiceTestControlT = ReturnType<typeof controlVoiceTest>
