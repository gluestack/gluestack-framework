const path = require('path');
const getPlugin = require('./getPlugin');
const { attachPluginInstances } = require('./meta/plugin-instances');

const getDependencies = async (app, pluginName) => {
	const dependencies = [];

	const packageJSON = path.join(
		pluginName,
		'package.json'
	);

	const peerDependencies = require(packageJSON).peerDependencies;

	for (const dependency of Object.keys(peerDependencies)) {
		try {
			const plugin = await getPlugin(
				app,
				dependency,
				dependency,
				false
			);

			if (plugin) {
				await attachPluginInstances(app, process.cwd(), [
					{ plugin: plugin },
				]);
				dependencies.push(plugin);
			}
		} catch (err) {
			//
		}
	}

	return dependencies;
};

module.exports = getDependencies;
