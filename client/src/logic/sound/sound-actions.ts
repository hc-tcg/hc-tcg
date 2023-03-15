export const sectionChange = (payload: string) => ({
	type: '@sound/SECTION_CHANGE',
	payload,
})

export type SectionChangeT = ReturnType<typeof sectionChange>
