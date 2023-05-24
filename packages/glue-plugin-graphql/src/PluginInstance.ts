import fs, { unlinkSync } from 'fs';
import AppCLI from '@gluestack-v2/framework-cli/build/helpers/lib/app';

import IPlugin from '@gluestack-v2/framework-cli/build/types/plugin/interface/IPlugin';
import IGlueStorePlugin from '@gluestack-v2/framework-cli/build/types/store/interface/IGluePluginStore';
import BaseGluestackPluginInstance from '@gluestack-v2/framework-cli/build/types/BaseGluestackPluginInstance';
import IInstance from '@gluestack-v2/framework-cli/build/types/plugin/interface/IInstance';
import { join } from 'path';
import fileExists from './helpers/file-exists';
import writeFile from './helpers/write-file';

export class PluginInstance extends BaseGluestackPluginInstance {
  app: AppCLI;
  name: string;
  callerPlugin: IPlugin;
  isOfTypeInstance: boolean = false;
  gluePluginStore: IGlueStorePlugin;
  installationPath: string;

  constructor(
    app: AppCLI,
    callerPlugin: IPlugin,
    name: string,
    gluePluginStore: IGlueStorePlugin,
    installationPath: string
  ) {
    super(app, callerPlugin, name, gluePluginStore, installationPath);

    this.app = app;
    this.name = name;
    this.callerPlugin = callerPlugin;
    this.gluePluginStore = gluePluginStore;
    this.installationPath = installationPath;
  }

  init() {
    //
  }

  destroy() {
    //
  }

  getDockerfile(): string {
    return `${this._sourcePath}/Dockerfile`;
  }

  getSealServicefile(): string {
    return `${this._sourcePath}/seal.service.yaml`;
  }
  getSourcePath(): string {
    return `${process.cwd()}/${this.getPluginEnvironment()}/${this.getName()}`;
  }

  getPluginEnvironment() {
    const cronsPlugin = this.app.getPluginByName(
      '@gluestack-v2/glue-plugin-crons'
    );
    if (!cronsPlugin) {
      return;
    }
    // @ts-ignore
    return cronsPlugin.getPluginEnvironment();
  }

  async build(): Promise<void> {
    // moves the instance into .glue/seal/services/<instance-name>/src/<instance-name>
    await this.app.write(this._sourcePath, this._destinationPath);
    await this.updateWorkspacePackageJSON();
    await this.app.updateServices(this._workspacePath);
    await this.sealInit();
  }

  async watch(): Promise<void> {
    await this.buildBeforeWatch();

    this.app.watch(this._sourcePath, this._destinationPath, () => {
      //
    });
  }
}
