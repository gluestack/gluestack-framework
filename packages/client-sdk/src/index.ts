import SDK from './helpers/lib/sdk';
import { config } from "@gluestack-v2/core";

const sdk = async () => {
	const app = SDK.getInstance();
	// await app.init();
	const providers = config('providers');
	app.init(config.providers)

	return app;
};

module.exports = sdk;
