import {getNewDossierServiceInstance} from "../service/NewDossierExplorerServiceWallet.js"

const {WebcController} = WebCardinal.controllers;

export default class NewFileController extends WebcController {

    constructor(element, history, ...args) {
        super(element, history, ...args);
        this.model = {}

        setTimeout(this.initEventListeners, 1000);

        this.getDirectoryContent("/").then((result) => {
            this.model.content = result.content;
        });
    }

    selectItem = () => {
        console.log("The tableItem was clicked");
    }

    initEventListeners = () => {
        let tableItems = this.element.querySelectorAll(".table-content");

        debugger

        tableItems.forEach((myDiv) => {
            myDiv.addEventListener("click", function (event) {
                if (event.target.classList.contains("table-item")) {
                    console.log("The table item was clicked");
                    // this should select the element from the table
                }
            });
        });

        tableItems.forEach((myDiv) => {
            myDiv.addEventListener("dblclick", function (event) {
                if (event.target.classList.contains("table-item")) {
                    console.log("The table item was double-clicked!");
                    // if the double clicked element is a file, this should open the view-file-modal
                    // if the double clicked element is a directory/DSU, this should navigate there
                }
            });
        });
    }

    getDirectoryContent = async (path) => {
        this.service = await getNewDossierServiceInstance();
        return await this.service.listDirContentAsync(path);

        // let readDirAsync = $$.promisify(this.service.readDirDetailed, this.service);
        // return await readDirAsync(path);
    }
}
