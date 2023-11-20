import {RootModel} from 'common/models/root-model'
import {plugins} from './plugins'

// Create root and register plugins

/** The root of the server. */
const root = new RootModel()

// initialize plugins
plugins.forEach((plugin) => {
	plugin.register(root)
	console.log('plugin registered: ' + plugin.id)
})

export default root
