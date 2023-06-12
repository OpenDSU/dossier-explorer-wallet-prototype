import {getNewDossierServiceInstance} from "../../service/NewDossierExplorerServiceWallet.js"

const {WebcController} = WebCardinal.controllers;
const {loader} = WebCardinal;

export default class ReceiveDossierController extends WebcController {

    constructor(element, history, ...args) {
        super(element, history, ...args);
        this.model = {
            dossierName: '',
            dossierNameComplete: false,
            keySSI: ''
        }

        this.setEventListeners();
    }

    setEventListeners() {
        this.onTagClick('cancel', () => {
            this.cancel()
        });
        this.onTagClick('enter-seed', () => {
            this.enterDossierSeed();
        });
        this.onTagClick('finish', () => {
            this.importDossier();
        });
    }

    cancel() {
        this.element.destroy();
    }

    enterDossierSeed () {
        this.model.dossierNameComplete = true;
        this.model.dossierName = this.element.querySelector('#dossier-name-input').value;
    }

    async importDossier () {
        loader.hidden = false;
        this.service = await getNewDossierServiceInstance();
        let path = this.model.cwd;
        if (path[path.length-1] !== '/') {
            path += '/';
        }
        this.model.keySSI = this.element.querySelector('#key-ssi').value;
        this.service.mountDossier(path, this.model.keySSI, this.model.dossierName, (err) => {
            loader.hidden = true;
            if (err) {
                // display warning for user in UI
                this.userInteractionService.showError("Error", "Failed to import DSU.");
                this.element.destroy();
            }
            console.log("imported dossier"); // display message for user in UI
            this.model.setChainValue("refresh", true);
            this.element.destroy();
        });
    }
}