import { Workspaces } from "@gluestack/helpers";
import AppCLI from "@gluestack-v2/framework-cli/build/helpers/lib/app";
import {
  error,
  success,
  warning,
} from "@gluestack-v2/framework-cli/build/helpers/print";

import { FOLDER_STRUCTURE } from "../../constants/folder-structure";
import createFoldersFromJson from "../../helpers/create-folders-from-json";
import { GLUE_GENERATED_PACKAGES_PATH } from "../../constants/glue-generated-packages";
import { spawnSync } from "child_process";

function upSealService(serviceName: string, servicePlatform: string) {
  const SEAL_SERVICES_PATH: string = ".glue/__generated__/seal/services/";
  const sealUp = spawnSync("sh", [
    "-c",
    `cd ${SEAL_SERVICES_PATH} && seal service:up -p ${servicePlatform} ${serviceName}`,
  ]);
  if (sealUp.status !== 0) {
    console.error(`Command failed with code ${sealUp.status}`);
  }
  console.log(sealUp.stdout.toString());
  console.error(sealUp.stderr.toString());
}

export default async (app: AppCLI): Promise<void> => {
  // creates folders from FOLDER_STRUCTURE constant
  // await createFoldersFromJson(FOLDER_STRUCTURE, process.cwd());

  // add __generated__/packages into workspaces
  // await Workspaces.append(
  //   `${process.cwd()}/package.json`,
  //   GLUE_GENERATED_PACKAGES_PATH
  // );

  // builds plugins
  for await (const plugin of app.plugins) {
    // if (!plugin.build) {
    //   warning(`${plugin.getName()}`, "contains no build method, skipping...");
    //   continue;
    // }
    let instances = plugin.getInstances();
    for (let instance of instances) {
      // @ts-ignore
      if (plugin.sealInit) {
        success("Seal service plugin found!");
        upSealService(instance.getName(), "local");
        warning(plugin.getName());
      }
    }

    // try {
    //   await plugin.build();
    // } catch (e) {
    //   console.log('>>>>', e);
    //   error(plugin.getName(), "build failed");
    // }
  }
};
