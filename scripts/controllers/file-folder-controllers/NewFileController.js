import {getNewDossierServiceInstance} from "../../service/NewDossierExplorerServiceWallet.js"

const {WebcController} = WebCardinal.controllers;
const {loader} = WebCardinal;

export default class NewFileController extends WebcController {

    constructor(element, history, ...args) {
        super(element, history, ...args);
        this.model = {
            filename: ''
        }

        this.setEventListeners();
    }

    setEventListeners() {
        this.onTagClick('cancel', () => {
            this.cancel()
        });
        this.onTagClick('create', () => {
            this.createFile();
        });
    }

    cancel() {
        this.element.destroy();
    }
    async createFile() {
        loader.hidden = false;
        this.service = await getNewDossierServiceInstance();
        let fileContent = this.element.querySelector('#file-content-textarea').value;
        let filePath = this.model.cwd;
        if (filePath[filePath.length-1] !== '/') {
            filePath += '/';
        }
        filePath += this.model.filename;
        this.service.writeFile(filePath, fileContent, (err) => {
            loader.hidden = true;
            if (err) {
                // display warning for user in UI
                this.userInteractionService.showError("Error", "Failed to create new file.");
                this.element.destroy();
            }
            console.log("saved"); // display message for user in UI
            this.model.setChainValue("refresh", true);
            this.element.destroy();
        });
    }

}