import path from "path";
import fs from "fs";
import writeFile from "./write-file";
import replaceHandlerNames from "./replace-handler-names";
import getFileNameWithoutExtension from "./get-file-name-without-ext";
import moleculerFunctionsServiceTemplateFunc from "./functions-service-template";

function filePathExtension(filePath: string) {
  return filePath.split(".").pop() ?? "";
}

const eventsTemplate = (eventName: any, eventHandler: any) => {
  return `
  "${eventName}": {
    handler: ${eventHandler},
  },
`;
};

function camelCaseArray(arr: any) {
  // Join array elements with a space

  const joinedString = arr.join(" ");

  // Split joinedString by space and capitalize each word except the first
  const words = joinedString.split(" ");
  for (let i = 1; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
  }

  // Concatenate capitalized words
  const camelCaseString = words.join("");

  return camelCaseString;
}

const removeDashAndCamelCase = (str: any) => {
  const words = str.split("-");
  const camelCaseStr = words.reduce((acc: any, word: any, index: any) => {
    if (index === 0) {
      return word;
    }
    const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
    return acc + capitalizedWord;
  }, "");
  return camelCaseStr;
};

function getNestedFilePaths(dirPath: any, fileList: any = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // If the file is a directory, recursively call the function
      // to get nested file paths
      getNestedFilePaths(filePath, fileList);
    } else {
      // If the file is a regular file, add its path to the fileList
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Usage: Pass the directory path as an argument to the function
// Molecular service Actions/import statement
let moleculerActions: any = {};
let moleculerImportPaths = ``;

// Private service Actions/import statement
let privateMoleculerActions: any = {};
let privateMoleculerImportStatements = ``;

let molecularEvents = ``;
let privateMolecularEvents = ``;

let eventsImportPaths = ``;

const writeService = (
  installationPath: string,
  instanceName: string,
  ignoredPaths: string[]
) => {
  const functionsPath = path.join(installationPath, instanceName);
  const files = getNestedFilePaths(functionsPath);

  files.forEach((functionFile: string, _index: number) => {
    const filePath = functionFile;
    if (
      ["json"].includes(filePathExtension(filePath)) ||
      filePath.includes("node_modules")
    ) {
      return;
    }

    // Get Private Actions, events, importd
    if (filePath.includes("/private/")) {
      privateMoleculerActions = {
        ...privateMoleculerActions,
        ...getPrivateActions(installationPath, instanceName, filePath).actions,
      };

      privateMoleculerImportStatements =
        privateMoleculerImportStatements +
        getPrivateActions(installationPath, instanceName, filePath).importPaths;
      if (filePath.includes("/private/events/")) {
        let privateMolecularData = getEvents(
          getPrivatePath(filePath, installationPath)
        );
        privateMolecularEvents = privateMolecularData.events;
      }

      return;
    }

    if (filePath.includes("/events/")) {
      molecularEvents += getEvents(getPaths(filePath, installationPath)).events;
      eventsImportPaths += getEvents(
        getPaths(filePath, installationPath)
      ).importPaths;
      return;
    }
    // Get Actions
    moleculerActions = {
      ...moleculerActions,
      ...getActions(installationPath, instanceName, filePath).actions,
    };
    moleculerImportPaths =
      moleculerImportPaths +
      getActions(installationPath, instanceName, filePath).importPaths;
  });

  // Writing Molecular Actions and events for instance
  createService(
    moleculerActions,
    moleculerFunctionsServiceTemplateFunc(instanceName),
    {
      actionImportPath: moleculerImportPaths,
      eventImportPath: eventsImportPaths,
    },
    path.join(installationPath, "services", `${instanceName}.service.js`),
    molecularEvents
  );

  // Writing Molecular Actions and events for private service
  createService(
    privateMoleculerActions,
    moleculerFunctionsServiceTemplateFunc("private"),
    { actionImportPath: privateMoleculerImportStatements, eventImportPath: "" },
    path.join(installationPath, "services", `private.service.js`),
    privateMolecularEvents
  );

  updateApiGateway(installationPath, instanceName);
};

const getPrivateActions = (
  installationPath: string,
  instanceName: string,
  filePath: string
) => {
  let obj: any = {};
  let privateEvents = ``;
  let functionImportStatement = ``;

  if (fs.existsSync(filePath)) {
    let finalPathArr = getPrivatePath(filePath, installationPath);

    // Create actions object
    let action: any = {};
    action.rest = {
      method: "POST",
      path: finalPathArr.functionPath,
    };

    action.handler = camelCaseArray(finalPathArr.funcPath) + "Handler";
    if (!filePath.includes("/events/"))
      obj[finalPathArr.funcPath.join(".")] = action;
    // if (filePath.includes("/events/")) {
    //   privateEvents = getEvents(filePath, installationPath).events;
    // }
    // Create Import Statement
    functionImportStatement = `const ${camelCaseArray(
      finalPathArr.funcPath.map((str) => removeDashAndCamelCase(str))
    )}Handler = require("..${finalPathArr.functionPath}");`;
    functionImportStatement += "\n";
  }
  return {
    actions: obj,
    importPaths: functionImportStatement,
  };
};

function getActions(
  installationPath: string,
  instanceName: string,
  filePath: string
) {
  let serviceAction: any = {};
  let functionImportStatement = ``;
  if (fs.existsSync(filePath)) {
    let finalPathArr = getPaths(filePath, installationPath);

    // Create actions object
    let action: any = {};
    action.rest = {
      method: "POST",
      path: finalPathArr.functionPath,
    };

    action.handler = camelCaseArray(finalPathArr.funcPath) + "Handler";

    serviceAction[finalPathArr.funcPath.join(".")] = action;

    // Create Import Statement
    functionImportStatement = `const ${camelCaseArray(
      finalPathArr.funcPath
    )}Handler = require("..${finalPathArr.functionPath}");`;
    functionImportStatement += "\n";
  }

  return {
    actions: serviceAction,
    importPaths: functionImportStatement,
    // events: serviceAction
  };
}

function getEvents(filePathData: any) {
  // let eventsPath = funcPath.filter((str) => str !== "events");
  // let res = getPaths(filePath, installationPath);
  let events = ``;
  const eventsIndex = filePathData.funcPath.indexOf("events");
  let eventNameIndex = filePathData.funcPath[1];
  // Check if the separator is present in the array
  if (eventsIndex !== -1) {
    eventNameIndex = filePathData.funcPath[eventsIndex + 1];
  }
  let functionImportStatement = ``;
  functionImportStatement = `const ${camelCaseArray(
    filePathData.funcPath
  )}Handler = require("..${filePathData.functionPath}");`;
  functionImportStatement += "\n";

  events = eventsTemplate(
    eventNameIndex,
    camelCaseArray(
      filePathData.funcPath.map((str: any) => removeDashAndCamelCase(str))
    ) + "Handler"
  );

  return { events, importPaths: functionImportStatement };
}

function updateApiGateway(installationPath: string, instanceName: string) {
  const apiGatewayPath = path.join(
    installationPath,
    "services",
    "api.service.js"
  );
  const whitelistedArr = [`${instanceName}.**`];
  const data = fs.readFileSync(apiGatewayPath, {
    encoding: "utf-8",
  });
  let writeData = ``;
  let whitelist: any = {};
  if (data.includes("// ***Update Whitlisted services here***")) {
    writeData = data.replace(
      "// ***Update Whitlisted services here***",
      `whitelist: ${JSON.stringify(whitelistedArr)},`
    );
    fs.writeFileSync(apiGatewayPath, writeData);
  } else {
    const regex = /whitelist(.*)\n/gm;
    const matches: any = data.match(regex);

    eval(`whitelist = {${matches[0]}}`);
    let whitelistArray = whitelist.whitelist;
    if (!whitelistArray.includes(`${instanceName}.**`)) {
      whitelistArray = [...whitelistArray, ...whitelistedArr];
      writeData = data.replace(matches[0], JSON.stringify(whitelistArray));
      fs.writeFileSync(apiGatewayPath, writeData);
    }
  }
}

function createService(
  moleculerActions: any,
  moleculerFunctionsServiceTemplate: any,
  moleculerImportStatements: any,
  path: string,
  eventsData: string
) {
  let finalString = moleculerFunctionsServiceTemplate.replace(
    "// **---Add Actions Here---**",
    replaceHandlerNames(JSON.stringify(moleculerActions, null, 2))
  );

  finalString = finalString.replace(
    "// **---Add Events Here---**",
    eventsData + "// **---Add Events Here---**"
  );

  finalString = finalString.replace(
    "// **---Add Imports Here---**",
    moleculerImportStatements.actionImportPath +
      moleculerImportStatements.eventImportPath
  );
  writeFile(path, finalString);
}

function getPrivatePath(filePath: string, installationPath: string) {
  let functionPath = ("./" + filePath).replace(installationPath, "");
  functionPath = functionPath.split(".").slice(0, -1).join(".");
  let funcPath = functionPath.split("/");
  funcPath.splice(0, 2);
  funcPath = funcPath.filter((str) => str !== "private");
  return { funcPath, functionPath };
}

function getPaths(filePath: string, installationPath: string) {
  // Dynamic route of a given action
  let functionPath = ("./" + filePath).replace(installationPath, "");
  functionPath = functionPath.split(".").slice(0, -1).join(".");
  // An Array of actions name for nested routes
  const funcPath = functionPath.split("/");
  funcPath.splice(0, 2);
  return { funcPath, functionPath };
}

export default writeService;
