import {getNewDossierServiceInstance} from "../../service/NewDossierExplorerServiceWallet.js"

const {WebcController} = WebCardinal.controllers;
const {loader} = WebCardinal;

const TEXTAREA_ID = 'editor';
const IMG_ID = 'photoViewer';

export default class FileController extends WebcController {

    constructor(element, history, ...args) {
        loader.hidden = false;
        super(element, history, ...args);
        this.model = {
            isEditable: this.checkIfEditable(),
            editMode: false,
            closingConfirmation: false
        }

        this.displayFileContent();

        this.setEventListeners();
    }

    isImage() {
        const filename = this.model.name;
        const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".jfif", ".pjpeg", ".pjp", ".svg", ".webp", ".bmp", ".ico"];
        for (const extension of imageExtensions) {
            if (filename.endsWith(extension)) {
                return true;
            }
        }
        return false;
    }

    async getFile(filename) {
        this.service = await getNewDossierServiceInstance();
        let readFileAsync = $$.promisify(this.service.readFile, this.service);
        return readFileAsync(filename);
    }

    convertToDataURL(data, subtype) {
        return "data:image/" + subtype + ";base64," + btoa(data);
    }

    getMimeSubtype(filename) {
        return filename.split('.').pop();
    }

    async displayFileContent() {
        try {
            let filepath = this.model.filePath;
            let fileContent = await this.getFile(filepath);
            this.contentDiv = document.getElementById('content');
            if (this.isImage()) {
                let image = document.createElement("img");
                image.src = this.convertToDataURL(fileContent, this.getMimeSubtype(this.model.name));
                image.id = IMG_ID;
                this.contentDiv.appendChild(image);
            }
            else {
                let textarea = document.createElement("textarea");
                textarea.value = fileContent;
                textarea.setAttribute('readonly', true);
                textarea.id = TEXTAREA_ID;
                this.contentDiv.appendChild(textarea);
            }
        }
        catch (err) {
            console.error(err);
        }
        loader.hidden = true;
    }

    async saveFile() {
        this.service = await getNewDossierServiceInstance();
        this.fileContent = this.querySelector('#' + TEXTAREA_ID).value;
        this.service.writeFile(this.model.filePath, this.fileContent, (err) => {
            if (err) {
                // display warning for user in UI
            }
            console.log("saved"); // display message for user in UI
        });
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
        let textarea = this.element.querySelector('#' + TEXTAREA_ID);
        textarea.remove();
        this.displayFileContent();
    }
    save() {
        this.model.editMode = false;
        this.saveFile();
        const x = document.getElementById(TEXTAREA_ID);
        x.setAttribute('readonly', 'true');
    }
    edit() {
        this.model.editMode = true;
        const x = document.getElementById(TEXTAREA_ID);
        x.removeAttribute('readonly');
    }
    async download() {
        const fileContent = await this.getFile(this.model.filePath);
        const link = document.createElement('a');

        if (this.isImage()) {
            link.href = this.querySelector("#" + IMG_ID).getAttribute("src");
        }
        else {
            let data = new Blob([fileContent], {type: "application/octet-stream"});
            link.href = URL.createObjectURL(data);
        }

        link.setAttribute('download', this.model.name);
        link.setAttribute('style', 'display:none');
        this.element.appendChild(link);

        link.click();
    }

    checkIfEditable() {
        const filename = this.model.name;
        const editableExtensions = [".json", ".txt", ".js", ".css", ".html", ".csv"];
        for (const extension of editableExtensions) {
            if (filename.endsWith(extension)) {
                return true;
            }
        }
        return false;
    }
}