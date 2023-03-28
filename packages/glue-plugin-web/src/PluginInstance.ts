import IApp from '@gluestack-v2/framework-cli/build/types/app/interface/IApp';
import IPlugin from '@gluestack-v2/framework-cli/build/types/plugin/interface/IPlugin';
import IInstance from '@gluestack-v2/framework-cli/build/types/plugin/interface/IInstance';
import ILifeCycle from '@gluestack-v2/framework-cli/build/types/plugin/interface/ILifeCycle';
import IContainerController from '@gluestack-v2/framework-cli/build/types/plugin/interface/IContainerController';
import IHasContainerController from '@gluestack-v2/framework-cli/build/types/plugin/interface/IHasContainerController';
import IGlueStorePlugin from '@gluestack-v2/framework-cli/build/types/store/interface/IGluePluginStore';

import { PluginInstanceContainerController } from './PluginInstanceContainerController';

export class PluginInstance
  implements IInstance, IHasContainerController, ILifeCycle
{
  app: IApp;
  name: string;
  callerPlugin: IPlugin;
  containerController: IContainerController;
  isOfTypeInstance: boolean = false;
  gluePluginStore: IGlueStorePlugin;
  installationPath: string;

  constructor(
    app: IApp,
    callerPlugin: IPlugin,
    name: string,
    gluePluginStore: IGlueStorePlugin,
    installationPath: string
  ) {
    this.app = app;
    this.name = name;
    this.callerPlugin = callerPlugin;
    this.gluePluginStore = gluePluginStore;
    this.installationPath = installationPath;
    // @ts-ignore
    this.containerController = new PluginInstanceContainerController(app, this);
  }

  init() {
    //
  }

  destroy() {
    //
  }

  getName(): string {
    return this.name;
  }

  getCallerPlugin(): IPlugin {
    return this.callerPlugin;
  }

  getInstallationPath(): string {
    return this.installationPath;
  }

  watch(): string[] {
    return [
      'pages',
      'public',
      'styles',
      'components'
    ];
  }

  getContainerController(): IContainerController {
    return this.containerController;
  }
}
