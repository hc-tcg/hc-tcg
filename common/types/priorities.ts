export type PrioritiesT = readonly {readonly stage: string}[]
export type Priority<T extends PrioritiesT> = number & {
	__priority_type_do_not_use_or_program_will_crash: T
}
export type PriorityDict<T extends PrioritiesT> = {
	readonly [stage in T[number]['stage']]: Priority<T>
}
export type PrioritySrc<T> = T extends PriorityDict<infer Priorities>
	? Priorities
	: never

function createPriorityDictionary<T extends PrioritiesT>(
	priorities: Exclude<T, {stage: string}[]>,
): PriorityDict<T> {
	return priorities.reduce(
		(r, {stage}, i) => {
			if (stage in r)
				throw new Error(
					'Priority dictionary should not include duplicate stages',
				)
			r[stage] = i
			return r
		},
		{} as Record<string, number>,
	) as any
}

