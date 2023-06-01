const getParentDossier = function (rawDossier, path, callback) {
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

export {
    getParentDossier
};

const _isSubPath = function (path, subPath) {
    if (path !== '/') {
        path = `${path}/`;
    }

    return path.indexOf(`/${subPath}/`) !== -1;
}