import {getNewDossierServiceInstance} from "./../../service/NewDossierExplorerServiceWallet.js"

const {WebcController} = WebCardinal.controllers;
const {loader} = WebCardinal;

export default class FileController extends WebcController {

    constructor(element, history, ...args) {
        loader.hidden = false;
        super(element, history, ...args);
        this.model = {
            isEditable: this.checkIfEditable(),
            isEditing: false,
            closingConfirmation: false
        }
        this.setEventListeners();
        this.displayFile();
    }

    async displayFile(){
        debugger;
        this.service = await getNewDossierServiceInstance();
        this.service.readFile(this.model.title, (err, fileContent) => {
            if (err) {
                // display warning for user in UI
            }
            this.element.querySelector("#content").innerHTML = fileContent.toString();
            loader.hidden = true;
        });
    }

    setEventListeners() {
        this.onTagClick('save-exit', this.saveAndExit);
        this.onTagClick('dismiss-exit', this.dismissAndExit);
        this.onTagClick('cancel', this.cancel);
        this.onTagClick('save', this.save);
        this.onTagClick('edit', this.edit);
        this.onTagClick('download', this.download);
    }

    saveAndExit() {}
    dismissAndExit() {}
    cancel() {}
    save() {}
    edit() {

    }
    download() {}

    checkIfEditable() {
        const filename = this.model.name;
        const editableExtensions = [".json", ".txt", ".js", ".css", ".html", ".csv"];
        for (const extension of editableExtensions) {
            if (filename.includes(extension)) {
                return true;
            }
        }
        return false;
    }
}