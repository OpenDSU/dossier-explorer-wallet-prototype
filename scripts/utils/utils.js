import {getNewDossierServiceInstance} from "../service/NewDossierExplorerServiceWallet.js";
import {getNewUserInteractionServiceInstance} from "../service/UserInteractionService.js";
import constants from "../constants.js";

const openDSU = require("opendsu");
const bdns = openDSU.loadApi("bdns");

async function readFile(file){
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = (err) => reject(err);
    fr.readAsBinaryString(file);
  })
}
async function getDossierFile(filename) {
  let dossierService = await getNewDossierServiceInstance();
  let userInteractionService = await getNewUserInteractionServiceInstance();
  let fileContent;
  try {
    fileContent = await $$.promisify(dossierService.readFile, dossierService)(filename);
  } catch (e) {
    userInteractionService.showError("Error", "Failed to retrieve file.", e);
  }
  return fileContent
}

async function saveDossierFile(filePath, fileContent) {
  let dossierService = await getNewDossierServiceInstance();
  let userInteractionService = await getNewUserInteractionServiceInstance();
  try {
    await $$.promisify(dossierService.writeFile, dossierService)(filePath, fileContent);
  } catch (e) {
    userInteractionService.showError("Error", "Failed to save file.", e);
  }
}

async function updateBDNS(newDlDomains) {
  let defaultDomains = await getCurrentBdns();
  if (!newDlDomains) {
    let dossierService = await getNewDossierServiceInstance();
    try {
      let localBDNSFileContent = await $$.promisify(dossierService.readFile, dossierService)(constants.LOCAL_BDNS_FILEPATH);
      newDlDomains = JSON.parse(localBDNSFileContent);
    } catch (e) {
      newDlDomains = {}//nothing to update
    }
  }
  bdns.setBDNSHosts({...defaultDomains, ...newDlDomains});

}

async function getCurrentBdns() {
  return await $$.promisify(bdns.getRawInfo)();
}

async function getLocalBDNSFile() {
  let dossierService = await getNewDossierServiceInstance();
  try {
    let fileContent = await $$.promisify(dossierService.readFile, dossierService)(constants.LOCAL_BDNS_FILEPATH);
    return fileContent;
  } catch (e) {
    return
  }
}

function getParentDossier(rawDossier, path, callback) {
  if (path === '' || path === '/') {
    return rawDossier.getKeySSIAsString((err, keySSI) => {
      if (err) {
        return callback(err);
      }

      callback(undefined, keySSI, "/");
    });
  }

  let paths = path.split('/');
  let wDir = paths.pop();
  let remainingPath = paths.join('/');

  rawDossier.listMountedDossiers(remainingPath, (err, mountPoints) => {
    if (err) {
      console.error(err);
      return callback(err);
    }

    let dossier = mountPoints.find((dsr) => {
      return dsr.path === wDir || _isSubPath(path, dsr.path);
    });

    if (!dossier) {
      return getParentDossier(rawDossier, remainingPath, callback);
    }

    callback(undefined, dossier.identifier, `${remainingPath}/${wDir}`);
  });
};

const _isSubPath = function (path, subPath) {
  if (path !== '/') {
    path = `${path}/`;
  }

  return path.indexOf(`/${subPath}/`) !== -1;
}

export default {
  readFile,
  getParentDossier,
  getCurrentBdns,
  getDossierFile,
  saveDossierFile,
  getLocalBDNSFile,
  updateBDNS
}
