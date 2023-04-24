import {getNewDossierServiceInstance} from "../service/NewDossierExplorerServiceWallet.js"

const {WebcController} = WebCardinal.controllers;

export default class NewFileController extends WebcController {

    constructor(element, history, ...args) {
        super(element, history, ...args);
        this.model = {}

        this.getDirectoryContent("/").then((result) => {
            debugger;
            this.model.content = result.content;
        });
    }

    getDirectoryContent = async (path) => {
        this.service = await getNewDossierServiceInstance();
        return await this.service.listDirContentAsync(path);

        // let readDirAsync = $$.promisify(this.service.readDirDetailed, this.service);
        // return await readDirAsync(path);
    }
}
