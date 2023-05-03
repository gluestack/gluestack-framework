import fs, { unlinkSync } from "fs";
import AppCLI from "@gluestack-v2/framework-cli/build/helpers/lib/app";

import IPlugin from "@gluestack-v2/framework-cli/build/types/plugin/interface/IPlugin";
import IGlueStorePlugin from "@gluestack-v2/framework-cli/build/types/store/interface/IGluePluginStore";
import BaseGluestackPluginInstance from "@gluestack-v2/framework-cli/build/types/BaseGluestackPluginInstance";
import IInstance from "@gluestack-v2/framework-cli/build/types/plugin/interface/IInstance";
import { join } from "path";
import fileExists from "./helpers/file-exists";
import writeFile from "./helpers/write-file";

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
    return `${this._destinationPath}/Dockerfile`;
  }

  getSealServicefile(): string {
    return `${this._destinationPath}/seal.service.yaml`;
  }



  getGatewayInstanceInfo() {
    const plugin: IPlugin | null = this.app.getPluginByName(
      "@gluestack-v2/glue-plugin-service-gateway"
    );

    if (!plugin) {
      console.error(`Plugin "@gluestack-v2/glue-plugin-service-gateway" not found.`);
      return "";
    }

    const instances: Array<IInstance> | undefined = plugin.instances;
    if (!instances || instances.length <= 0) {
      console.error(`No instance with "@gluestack-v2/glue-plugin-service-gateway" found.`);
      return "";
    }

    return instances[0].getName();
  }

  generateQueuesInServiceGateway() {
    const plugin = this.app.getPluginByName(
      "@gluestack-v2/glue-plugin-service-gateway"
    ) as IPlugin;


    if (!plugin) {
      return;
    }

    // @ts-ignore
    plugin.generateQueuesService(this.getName());

  }

  async build(): Promise<void> {

    this.generateQueuesInServiceGateway();

  }

}