import {getNewDossierServiceInstance} from "../../service/NewDossierExplorerServiceWallet.js"

const {WebcController} = WebCardinal.controllers;
const {loader} = WebCardinal;

export default class RenameController extends WebcController {

    constructor(element, history, ...args) {
        super(element, history, ...args);
        this.model = {
            oldPath: (this.model.cwd + this.model.filename)
        }

        this.setEventListeners();
    }

    setEventListeners() {
        this.onTagClick('cancel', () => {
            this.cancel()
        });
        this.onTagClick('save', () => {
            this.rename();
        });
    }

    cancel() {
        this.element.destroy();
    }
    async rename() {
        loader.hidden = false;
        this.service = await getNewDossierServiceInstance();

        let newPath = ("/" + this.model.filename);

        this.service.rename(this.model.oldPath, newPath, (err, res) => {
            loader.hidden = true;
            if (err) {
                console.log(err);
                // display warning for user in the UI
                return;
            }
            console.log("saved"); // display message for user in UI
            this.model.setChainValue("refresh", true);
            this.element.destroy();
        });

        // this.service.writeFile(newPath, fileContent, (err) => {
        //     loader.hidden = true;
        //     if (err) {
        //         // display warning for user in UI
        //     }
        //     console.log("saved"); // display message for user in UI
        //     this.model.setChainValue("refresh", true);
        //     this.element.destroy();
        // });
    }

}