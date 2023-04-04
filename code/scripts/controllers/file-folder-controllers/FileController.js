import {getNewDossierServiceInstance} from "../../service/NewDossierExplorerServiceWallet.js"

const {WebcController} = WebCardinal.controllers;
const {loader} = WebCardinal;

export default class FileController extends WebcController {

    constructor(element, history, ...args) {
        loader.hidden = false;
        super(element, history, ...args);
        this.model = {
            isEditable: this.checkIfEditable(),
            editMode: false,
            closingConfirmation: false
        }

        this.textarea = document.getElementById('content');
        this.fileContent = this.textarea.value;

        this.setEventListeners();
        this.displayFile();
    }

    async displayFile() {
        this.service = await getNewDossierServiceInstance();
        this.service.readFile(this.model.title, (err, fileContent) => {
            if (err) {
                // display warning for user in UI
            }
            let x = document.getElementById('content');
            x.value = fileContent.toString();
            // this.element.querySelector("#content").value = fileContent.toString();
            loader.hidden = true;
        });
    }

    async saveFile() {
        this.service = await getNewDossierServiceInstance();
        this.fileContent = this.textarea.value;
        this.service.writeFile(this.model.title, this.fileContent, (err) => {
            if (err) {
                // display warning for user in UI
            }
            console.log("saved"); // display message for user in UI
        });

        // const x = document.getElementById('content');
        // let newContent = x.value;
        // this.service.writeFile(this.model.title, newContent, (err) => {
        //     if (err) {
        //         // display warning for user in UI
        //     }
        //     console.log("saved"); // display message for user in UI
        // });
    }

    setEventListeners() {
        this.onTagClick('close', () => {
            this.close();
        })
        this.onTagClick('save-exit', () => {
            this.saveAndExit();
        });
        this.onTagClick('dismiss-exit', () => {
            this.dismissAndExit();
        });
        this.onTagClick('cancel', () => {
            this.cancel()
        });
        this.onTagClick('save', () => {
            this.save();
        });
        this.onTagClick('edit', () => {
            this.edit();
        });
        this.onTagClick('download', () => {
            this.download();
        });
    }

    close() {
        if (this.model.editMode === true) {
            this.model.closingConfirmation = true;
        }
        else {
            this.element.destroy();
        }
    }
    saveAndExit() {
        this.save();
        this.element.destroy();
    }
    dismissAndExit() {
        this.element.destroy();
    }
    cancel() {
        this.model.editMode = false;
        this.displayFile();
    }
    save() {
        this.model.editMode = false;
        this.saveFile();
        const x = document.getElementById('content');
        x.setAttribute('readonly', 'true');
    }
    edit() {
        this.model.editMode = true;
        const x = document.getElementById('content');
        x.removeAttribute('readonly');
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