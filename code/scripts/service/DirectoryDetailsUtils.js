import { CONSTANTS } from "./constants.js";

function checkForApplications(state) {
    const mounts = state.content.mounts;
    const numberOfMounts = mounts.length;
    if (!numberOfMounts ||
        (numberOfMounts === 1 && mounts[0] === CONSTANTS.CODE)) {
        return state.callback(undefined, state.content);
    }

    let sequence = Promise.resolve();
    mounts.forEach((mount) => {
        sequence = sequence.then(() => {
            return new Promise((resolve) => {
                if (mount !== CONSTANTS.CODE) {
                    return checkForAppFolder(state, mount, resolve);
                }
                resolve();
            })
        })
    });

    sequence.then(() => {
        updateMountsList(state);
    })
}

function updateMountsList(state) {
    const { mounts, applications } = state.content;
    const filteredMountPoints = mounts.filter((mountPoint) => {
        let remove = false;
        applications.forEach((appName) => {
            remove = remove || appName === mountPoint;
        });

        return !remove;
    });

    state.content.mounts = filteredMountPoints;
    state.callback(undefined, state.content);
}

function checkForAppFolder(state, mountPoint, callback) {
    const wDir = `${state.path}/${mountPoint}`;
    state.rawDossier.readDir(wDir, CONSTANTS.WITH_FILE_TYPES, (err, mountPointContent) => {
        if (err) {
            return state.callback(err);
        }

        const { folders, mounts } = mountPointContent;
        if (!folders || !folders.length) {
            return checkForCodeDossier(state, mounts, mountPoint, callback);
        }

        const hasAppFolder = folders.findIndex((fName) => fName === CONSTANTS.APP) !== -1;
        if (!hasAppFolder) {
            return checkForIndexHTML(state, mountPoint, callback);
        }

        state.content.applications.push(mountPoint);

        callback();

    });
}

function checkForCodeDossier(state, mounts, mountPoint, callback) {
    const hasCodeFolder = mounts.findIndex(mPoint => mPoint === CONSTANTS.CODE) !== -1;
    if (hasCodeFolder) {
        return checkForIndexHTML(state, mountPoint, callback);
    }

    callback();
}
function checkForIndexHTML(state, mountPoint, callback) {
    const wDir = `${state.path}/${mountPoint}`;
    state.rawDossier.readDir(`${wDir}/${CONSTANTS.CODE}`, CONSTANTS.WITH_FILE_TYPES, (err, codeContent) => {
        if (err) {
            return state.callback(err);
        }

        const { files, folders } = codeContent;
        if (!files || !files.length) {
            return callback();
        }

        const hasIndexHtml = files.findIndex((fName) => fName === CONSTANTS.INDEX_HTML) !== -1;
        if (!hasIndexHtml) {
            const hasAppFolder = folders.findIndex((fName) => fName === CONSTANTS.APP) !== -1;
            if (hasAppFolder) {
                state.path = wDir;
                return checkForAppFolder(state, CONSTANTS.CODE, callback);
            }

            return checkForCodeDossier(state, mounts, mountPoint, callback);
        }

        state.content.applications.push(mountPoint);

        callback();
    });
}

export {
    checkForApplications
}