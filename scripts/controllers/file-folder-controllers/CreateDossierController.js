import {getNewDossierServiceInstance} from "../../service/NewDossierExplorerServiceWallet.js"
import {getNewUserInteractionServiceInstance} from "../../service/UserInteractionService.js";

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

        this.service.createDossier(path, this.model.dossierName, async (err) => {
            this.userInteractionService = await getNewUserInteractionServiceInstance();
            loader.hidden = true;
            if (err) {
                // display warning for user in UI
                this.userInteractionService.showError("Error", "The creation of a DSU failed (01)");
                this.element.destroy();
            }
            console.log("created dossier"); // display message for user in UI

            this.service.getSSIForMount(path + this.model.dossierName, (err, ssi) => {
                if (err) {
                    // display warning for user in UI
                    this.userInteractionService.showError("Error", "The creation of a DSU failed (02)");
                    this.element.destroy();
                }
                this.model.keySSI = ssi;
                this.model.setChainValue("refresh", true);
            });
        });
    }

    closeModal () {
        this.element.destroy();
    }
}