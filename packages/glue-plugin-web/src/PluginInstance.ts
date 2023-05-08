import { join } from "path";
import { removeSpecialChars } from "@gluestack/helpers";

import AppCLI from "@gluestack-v2/framework-cli/build/helpers/lib/app";
import IPlugin from "@gluestack-v2/framework-cli/build/types/plugin/interface/IPlugin";
import IGlueStorePlugin from "@gluestack-v2/framework-cli/build/types/store/interface/IGluePluginStore";
import BaseGluestackPluginInstance from "@gluestack-v2/framework-cli/build/types/BaseGluestackPluginInstance";
import { GLUE_GENERATED_SEAL_SERVICES_PATH } from "@gluestack-v2/framework-cli/build/constants/gluestack.v2";

import writeFile from "./helpers/write-file";
import fileExists from "./helpers/file-exists";
import { reWriteFile } from "./helpers/rewrite-file";

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

  async build() {
    await this.app.write(this._sourcePath, this._destinationPath);
    await this.updateWorkspacePackageJSON();
    await this.sealInit();
    await this.app.updateServices();

    // update next.config.js context for error mapping
    await reWriteFile(join(this._destinationPath, 'next.config.js'), this._sourcePath, 'SOUCEPATH');
    //@ts-ignore
    // delete require.cache(require.resolve(nextConfigPath));

    // const nextConfig = require(nextConfigPath);
    // nextConfig.transpilePackages = [...nextConfig.transpilePackages, this._sourcePath];
    // fs.writeFileSync(nextConfigPath, )

  }


  async watch(callback: any) {
    await this.app.watch(
      this._sourcePath,
      this._destinationPath,
      (events, path) => {
        if (callback) {
          callback(events, path);
        }
      }
    );
  }
}
