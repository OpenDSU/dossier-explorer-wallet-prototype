import { getParentDossier } from "./commons.js";
import { CONSTANTS } from "./constants.js";
import { checkForApplications } from "./DirectoryDetailsUtils.js";
const keyssiresolver = require("opendsu").loadApi("resolver");


class NewDossierExplorerService {

    constructor(rawDossier) {
        this.rawDossier = rawDossier;
    }

    readDir(path, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {
                withFileTypes: false
            };
        }
        if (this.rawDossier) {
            return this.rawDossier.readDir(path, options, callback);
        }

        callback("Raw Dossier is not available.");
    }

    readDirDetailed(path, callback) {
        if (this.rawDossier) {
            return this.rawDossier.readDir(path, CONSTANTS.WITH_FILE_TYPES, (err, content) => {
                if (err) {
                    callback(err);
                }

                let stateObj = {
                    path: path === '/' ? '' : path,
                    content: {
                        ...content,
                        applications: []
                    },
                    callback: callback,
                    rawDossier: this.rawDossier
                }
                checkForApplications(stateObj);
            });
        }
        callback("Raw Dossier is not available.");
    }

    async listDirContentAsync(path) {
        console.log("LIST DIR CONTENT: ", path);
        if(path[path.length-1]==="/"){
            path = path.substring(0,path.length-1);
        }
        if (this.rawDossier) {

            let stat = $$.promisify(rawDossier.stat);


            let content = await $$.promisify(rawDossier.readDir, rawDossier)(path, CONSTANTS.WITH_FILE_TYPES);
            let stateObj = {
                    path: path === '/' ? '' : path,
                    content: [],
                    rawDossier: this.rawDossier
                }

            for (let element in content.files) {
                let filename = content.files[element];
                let filepath = path === '' ? '/' : path;
                let stats = await stat(filepath + filename); // stats will be used to show 'last modified' in the filesystem table

                stateObj.content.push({
                    name: filename,
                    type: "file",
                    isFile: true,
                    stats
                });
            }
            for (let element in content.folders) {
                stateObj.content.push({
                    name: content.folders[element],
                    type: "directory"
                });
            }
            for (let element in content.mounts) {
                stateObj.content.push({
                    name: content.mounts[element],
                    type: "DSU",
                    isDSU: true
                });
            }
            console.log("PATH AND STATEOBJ: ", path, '\n', JSON.stringify(stateObj));
            return stateObj;
        }
        throw Error("Raw Dossier is not available.");
    }

    getDSUSeedSSI(path, dossierName, callback) {
        if (this.rawDossier) {
            return this.getDSUKeySSI(path, dossierName, callback);
        }

        callback("Raw Dossier is not available.");
    }

    getDSUSReadSSI(path, dsuName, callback) {
        if (!this.rawDossier) {
            callback("Raw Dossier is not available.");
        }

        this.getDSUKeySSI(path, dsuName, (err, keySSI) => {
            if (err) {
                return callback(err);
            }

            keyssiresolver.loadDSU(keySSI, (err, loadedDSU) => {
                if (err) {
                    return callback(err);
                }

                loadedDSU.getKeySSIAsString("sread", (err, sReadSSI) => {
                    if (err) {
                        return callback(err);
                    }

                    callback(undefined, sReadSSI);
                });
            });
        });
    }

    async createDossier(path, dossierName, callback) {

        if (this.rawDossier) {
            this.rawDossier.getKeySSIAsString((err, ssi) => {
                if (err) {
                    return callback(err);
                }

                keyssiresolver.createDSU(ssi, (err, newDossier) => {
                    if (err) {
                        return callback(err);
                    }

                    newDossier.getKeySSIAsString((err, keySSI) => {
                        if (err) {
                            return callback(err);
                        }
                        if (path.endsWith("/")) {
                            path = path.slice(0, -1); // deletes the last '/' character
                        }

                        this.mountDossier(path, keySSI, dossierName, callback);
                    });
                });
            });
        } else {
            callback("Raw Dossier is not available.");
        }
    }

    getSSIForMount(path, callback) {
        return this.rawDossier.getSSIForMount(path, callback);
    }

    importDossier(path, dossierName, SEED, callback) {
        if (this.rawDossier) {
            return keyssiresolver.loadDSU(SEED, (err) => {
                if (err) {
                    console.log(err);
                    return callback(err);
                }

                this.mountDossier(path, SEED, dossierName, callback);
            });
        }
        callback("Raw Dossier is not available.");
    }

    async createFolder(path, callback) {
        this.rawDossier.createFolder(path, callback);
    }

    rename(oldPath, newPath, callback) {
        if (this.rawDossier) {
            this.rawDossier.rename(oldPath, newPath, (err) => {
                if (err) {
                    return callback(err);
                }

                callback(undefined, {
                    success: true,
                    oldPath: oldPath,
                    newPath: newPath
                })
            });
        } else {
            callback("Raw Dossier is not available.");
        }
    }

    deleteFileFolder(path, callback) {
        if (this.rawDossier) {
            return this.rawDossier.delete(path, (err, result) => {
                if (err) {
                    console.log(err);
                    return callback(err);
                }

                callback(undefined, {
                    success: true,
                    path: path,
                    result: result
                });
            });
        }

        callback("Raw Dossier is not available.");
    }

    async unmountDSU(path, name, callback) {
        if (this.rawDossier) {
            return getParentDossier(this.rawDossier, path, (err, parentKeySSI, relativePath) => {
                if (err) {
                    console.log(err);
                    return callback(err);
                }

                keyssiresolver.loadDSU(parentKeySSI, (err, parentDSU) => {
                    if (err) {
                        console.log(err);
                        return callback(err);
                    }

                    const unmountPath = `${path.replace(relativePath, '')}/${name}`;
                    parentDSU.unmount(unmountPath, (err, result) => {
                        if (err) {
                            console.log(err);
                            return callback(err);
                        }
                        callback(undefined, {
                            success: true,
                            path: path,
                            unmountPath: unmountPath,
                            result: result
                        });
                    });
                });
            });
        }

        callback("Raw Dossier is not available.");
    }

    printDossierSeed(path, dossierName, callback) {
        if (this.rawDossier) {
            return this.rawDossier.listMountedDossiers(path, (err, result) => {
                if (err) {
                    return callback(err);
                }

                let dossier = result.find((dsr) => dsr.path === dossierName);
                if (!dossier) {
                    return callback(`Dossier with the name ${dossierName} was not found in the mounted points!`);
                }

                callback(undefined, dossier.identifier);
            });
        }

        callback("Raw Dossier is not available.");
    }

    async mountDossier(path, keySSI, dossierName, callback) {
        getParentDossier(this.rawDossier, path, (err, parentKeySSI, relativePath) => {
            if (err) {
                return callback(err);
            }

            let mountDossierIn = (parentDossier) => {

                let mountPoint = `${path.replace(relativePath, '')}/${dossierName}`;
                if (!mountPoint.startsWith("/")) {
                    mountPoint = "/" + mountPoint;
                }
                parentDossier.mount(mountPoint, keySSI, (err) => {
                    if (err) {
                        return callback(err)
                    }
                    callback(undefined, keySSI);
                });
            }

            //make sure if is the case to work with the current rawDossier instance
            this.rawDossier.getKeySSIAsString((err, keySSI) => {
                if (err) {
                    return callback(err);
                }

                if (parentKeySSI !== keySSI) {
                    return keyssiresolver.loadDSU(parentKeySSI, (err, parentRawDossier) => {
                        if (err) {
                            return callback(err);
                        }
                        mountDossierIn(parentRawDossier);
                    });
                }
                mountDossierIn(rawDossier);
            });
        });
    }

    readFile(path, callback) {
        this.rawDossier.readFile(path, callback);
    }

    async writeFile(path, data, callback) {
        this.rawDossier.writeFile(path, data, callback);
    }
}



let dossierExplorer = undefined;
let getNewDossierServiceInstance = async function () {
    if (dossierExplorer === undefined) {
        const openDSU = require("opendsu");
        const sc = openDSU.loadApi("sc");
        const dsu = await $$.promisify(sc.getMainDSU)();
        dossierExplorer = new NewDossierExplorerService(dsu);
    }
    return dossierExplorer;
};

export {
    getNewDossierServiceInstance
};