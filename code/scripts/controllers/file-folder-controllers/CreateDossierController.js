import {getNewDossierServiceInstance} from "../../service/NewDossierExplorerServiceWallet.js"

const {WebcController} = WebCardinal.controllers;
const {loader} = WebCardinal;

export default class CreateDossierController extends WebcController {

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
        this.onTagClick('create-dossier', () => {
            this.createDossier();
        });
        this.onTagClick('finish', () => {
            this.closeModal();
        });
    }

    async createDossier () {
        loader.hidden = false;
        this.service = await getNewDossierServiceInstance();
        let path = this.model.cwd;
        if (path[path.length-1] !== '/') {
            path += '/';
        }
        this.model.dossierNameComplete = true;

        this.service.createDossier(path, this.model.dossierName, (err) => {
            loader.hidden = true;
            if (err) {
                // display warning for user in UI
            }
            console.log("created dossier"); // display message for user in UI

            this.service.getSSIForMount(path + this.model.dossierName, (err, ssi) => {
                if (err) {
                    // display warning for user in UI
                }
                this.model.keySSI = ssi;
            });
        });
    }

    closeModal () {
        this.element.destroy();
    }
}