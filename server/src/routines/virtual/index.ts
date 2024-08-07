import ExBossAI from './exboss-ai'
import {AIClass, VirtualAI} from './virtual-action'

const aiClasses: Array<AIClass> = [ExBossAI]

export const AI_CLASSES: Record<string, VirtualAI> = aiClasses.reduce(
	(result: Record<string, VirtualAI>, aiClass) => {
		let ai = new aiClass()
		result[aiClass.name] = ai
		result[ai.id] = ai
		return result
	},
	{},
)

export {default as virtualPlayerActionSaga} from './virtual-action'
export {AIComponent, type AIEntity} from './ai-component'
