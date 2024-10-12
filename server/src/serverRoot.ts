import {RootModel} from './root-model'
import {plugins} from './plugins'

// Create root and register plugins

/** The root of the server. */
const root = new RootModel()

// initialize plugins
plugins.forEach((plugin) => {
	const result = plugin.register(root)
	if (result) console.log('plugin registered: ' + plugin.id)
})

export default root
