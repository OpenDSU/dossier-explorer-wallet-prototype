import {getNewDossierServiceInstance} from "../../service/NewDossierExplorerServiceWallet.js"

const {WebcController} = WebCardinal.controllers;
const {loader} = WebCardinal;

export default class NewFolderController extends WebcController {

    constructor(element, history, ...args) {
        super(element, history, ...args);
        this.model = {
            folderName: ''
        }

        this.setEventListeners();
    }

    setEventListeners() {
        this.onTagClick('cancel', () => {
            this.cancel()
        });
        this.onTagClick('create', () => {
            this.createFolder();
        });
    }

    cancel() {
        this.element.destroy();
    }
    async createFolder() {
        loader.hidden = false;
        this.service = await getNewDossierServiceInstance();
        let folderPath = this.model.cwd;
        if (folderPath[folderPath.length-1] !== '/') {
            folderPath += '/';
        }
        folderPath += this.model.folderName;
        this.service.createFolder(folderPath, (err) => {
            loader.hidden = true;
            if (err) {
                // display warning for user in UI
            }
            console.log("created new folder"); // display message for user in UI
            this.model.setChainValue("refresh", true);
            this.element.destroy();
        });
    }

}