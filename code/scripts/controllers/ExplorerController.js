import FileDownloader from "./file-folder-controllers/FileDownloader.js";
import FeedbackController from "./FeedbackController.js";

import rootModel from "../view-models/rootModel.js";

import createDossierViewModel from '../view-models/modals/dossier-modals/createDossierViewModel.js';
import receiveDossierViewModel from '../view-models/modals/dossier-modals/receiveDossierViewModel.js';
import shareDossierViewModel from '../view-models/modals/dossier-modals/shareDossierViewModel.js';

import newFileViewModel from "../view-models/modals/file-folder-modals/newFileViewModel.js";
import newFolderViewModel from "../view-models/modals/file-folder-modals/newFolderViewModel.js";

import deleteViewModel from '../view-models/modals/actions-modals/deleteViewModel.js';
import renameViewModel from '../view-models/modals/actions-modals/renameViewModel.js';
import moveViewModel from '../view-models/modals/actions-modals/moveViewModel.js';

import ExplorerNavigationController from "./ExplorerNavigationController.js";
import Constants from "./Constants.js";
import { getNewDossierServiceInstance } from "../service/NewDossierExplorerServiceWallet.js";

const {loader} = WebCardinal;


const {WebcController} = WebCardinal.controllers;
export default class ExplorerController extends WebcController {
    constructor(element, history) {
        super(element, history);
        this.model = this._getCleanProxyObject(rootModel);
        this._init(element, history);
    }

    async _init(element, history){
        this.dossierService = await getNewDossierServiceInstance();
        this.feedbackController = new FeedbackController(this.model);
        this.explorerNavigator = new ExplorerNavigationController(element, history, this.model);

        this._initListeners();
        this._checkForLandingApp();
    }

    _initListeners = () => {
        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });

        this.on("switch-layout", this._handleSwitchLayout);
        this.on('open-options-menu', this._handleOptionsMenu);

        let tableItems = this.element.querySelectorAll(".table-content");

        // event listeners for clicking and double-clicking items from the file system:
        tableItems.forEach((myDiv) => {
            myDiv.addEventListener("click", (event) => {
                if (event.target.classList.contains("table-item")) {
                    console.log("The table item was clicked");
                    // this should select the element from the table

                }
            });
        });
        tableItems.forEach((myDiv) => {
            myDiv.addEventListener("dblclick", (event) => {
                if (event.target.classList.contains("table-item")) {
                    console.log("The table item was double-clicked!");
                    this._handleViewFile(event);
                    // if the double clicked element is a file, this should open the view-file-modal
                    // if the double clicked element is a directory/DSU, this should navigate there
                }
            });
        });

        this.onTagClick('context-menu', this.showContextMenu)

        this.onTagClick('view-file', this._handleViewFile);
        // this.on('view-file', this._handleViewFile);
        this.onTagClick('rename', this._renameHandler);

        this.on('export-dossier', this._handleDownload);

        this.on('share-dossier', this._shareDossierHandler);
        this.on('delete', this._deleteHandler);
        this.on('move', this._moveHandler);
        this.on('close', this._closeHandler)
        this.on('run-app', this._handleRunApplication);

        this.onTagClick('create-file', this._addNewFileHandler);
        this.onTagClick('create-folder', this._addNewFolderHandler);

        this.element.querySelector('#upload-file').addEventListener('change', this._uploadFileHandler);
        this.onTagClick('upload-file', this._triggerFileSelect);
        this.element.querySelector('#upload-folder').addEventListener('change', this._uploadFileHandler);
        this.onTagClick('upload-folder', this._triggerFolderSelect);

        this.onTagClick('create-dossier', this._createDossierHandler);
        this.onTagClick('receive-dossier', this._receiveDossierHandler);

        this.onTagClick('add-menu', this.toggleAddMenu);
        this.element.querySelector('#add-menu-options').addEventListener('click', this.toggleAddMenu);
    };

    refreshUI = () => {
        this.explorerNavigator.listDossierContent();
    }

    _handleOptionsMenu = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        const selectedItem = event.data;
        // let triggeredButton = event.path[0];
        // let elementRect = triggeredButton.getBoundingClientRect();
        let itemActionsBtn = this.element.querySelector("#wallet-content-container").shadowRoot.querySelector("#item-actions");

        // let containerHeight = selectedItem.optionsContainerHeight;
        // let topCorrection = containerHeight / 2 - 15;
        // if (window.innerHeight < elementRect.top + containerHeight / 2) {
        //     topCorrection = topCorrection + (elementRect.top + containerHeight / 2 - window.innerHeight);
        // }
        // itemActionsBtn.querySelector("psk-grid").style.top = elementRect.top - topCorrection + "px";
        // itemActionsBtn.querySelector("psk-grid").style.left = elementRect.left - 220 + "px";

        // if (!selectedItem) {
        //     return console.error(`No item selected!`);
        // }

        itemActionsBtn.setAttribute("opened", "");
        this.model.optionsMenu.isApplication = selectedItem.isApplication;
        this.model.optionsMenu.icon = selectedItem.icon;
        this.model.optionsMenu.name = selectedItem.name;
        this.model.optionsMenu.dataType = selectedItem.dataType;
    };

    _closeHandler(){
        let itemActionsBtn = this.element.querySelector("#wallet-content-container").shadowRoot.querySelector("#item-actions");
        itemActionsBtn.removeAttribute("opened");
    }

    _checkForLandingApp() {
        /*this.DSUStorage.getObject("apps/.landingApp", (err, landingApp) => {
            if (!err && landingApp && landingApp.name) {
                this.showModal("runApp", { name: landingApp.name });
                this.dossierService.deleteFileFolder("apps/.landingApp", (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        })*/

    }

    _handleRunApplication = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        let applicationName = event.data;
        let fullPath = this.explorerNavigator.getFullPath();

        this.dossierService.printDossierSeed(fullPath, applicationName, (err, keySSI) => {
            if (err) {
                return console.error(err);
            }

            this.showModal("runAppModal", {
                name: applicationName,
                keySSI: keySSI
            }, () => {
                //TODO: what should happen when user closes the app?
            })
        })
    };

    _handleSwitchLayout = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        this.model.isGridLayout = !this.model.isGridLayout;
    };

    _createDossierHandler = (model, target, event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        let cwd = this.model.currentPath || '/';

        createDossierViewModel.currentPath = cwd;

        this.model.modalState = { cwd };
        let modalOptions = {
            controller : "file-folder-controllers/CreateDossierController",
            model: this.model.modalState,
            disableFooter: true,
            modalTitle: "Create Dossier"
        };

        this.model.onChange('modalState.refresh', this.refreshUI);
        this.showModalFromTemplate('create-dossier-modal', this.refreshUI, this.refreshUI, modalOptions);
    };

    _receiveDossierHandler = (model, target, event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        let cwd = this.model.currentPath || '/';

        receiveDossierViewModel.currentPath = cwd;
        this.model.modalState = { cwd };
        let modalOptions = {
            controller : "file-folder-controllers/ReceiveDossierController",
            model: this.model.modalState,
            disableFooter: true,
            modalTitle: "Receive Dossier"
        };

        this.model.onChange('modalState.refresh', this.refreshUI);
        this.showModalFromTemplate('receive-dossier-modal', this.refreshUI, this.refreshUI, modalOptions);
    };

    _deleteHandler = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const {
            currentPath,
            selectedItem
        } = this._getSelectedItemAndWorkingDir(event.data);

        const name = selectedItem.name;
        if (name === 'manifest') {
            return this.feedbackEmitter(this.model.error.labels.manifestManipulationError, null, Constants.ERROR_FEEDBACK_TYPE);
        }

        deleteViewModel.path = currentPath;
        deleteViewModel.selectedItemName = selectedItem.name;
        deleteViewModel.selectedItemType = selectedItem.type;

        this.showModal('deleteModal', deleteViewModel, (err, response) => {
            if (err) {
                return this.feedbackEmitter(err, null, Constants.ERROR_FEEDBACK_TYPE);
            }

            const successMessage = this.model[Constants.SUCCESS].delete
                .replace(Constants.NAME_PLACEHOLDER, response.name);
            this.feedbackEmitter(successMessage, null, Constants.SUCCESS_FEEDBACK_TYPE);
            this.explorerNavigator.listDossierContent();
        });
    };

    _renameHandler = (model, target, event) => {
        // event.preventDefault();
        event.stopImmediatePropagation();

        let cwd = this.model.currentPath || '/';
        let filename = event.target.parentElement.parentElement.querySelector('.item-name').textContent;

        renameViewModel.currentPath = cwd;

        this.model.modalState = { cwd, filename };
        let modalOptions = {
            controller : "file-folder-controllers/RenameController",
            model: this.model.modalState,
            disableFooter: true,
            modalTitle: "Rename"
        };

        this.model.onChange('modalState.refresh', this.refreshUI);
        this.showModalFromTemplate('rename-modal', this.refreshUI, this.refreshUI, modalOptions);

        // const {
        //     currentPath,
        //     selectedItem
        // } = this._getSelectedItemAndWorkingDir(event.data);
        //
        // const name = selectedItem.name;
        // if (name === 'manifest') {
        //     return this.feedbackEmitter(this.model.error.labels.manifestManipulationError, null, Constants.ERROR_FEEDBACK_TYPE);
        // }
        //
        // renameViewModel.fileNameInput.value = name;
        // renameViewModel.oldFileName = name;
        // renameViewModel.fileType = selectedItem.type;
        // renameViewModel.currentPath = currentPath;
        //
        // this.showModal('renameModal', renameViewModel, (err, response) => {
        //     if (err) {
        //         return this.feedbackEmitter(err, null, Constants.ERROR_FEEDBACK_TYPE);
        //     }
        //
        //     if (!response.cancel) {
        //         const successMessage = this.model[Constants.SUCCESS].rename
        //             .replace(Constants.FROM_PLACEHOLDER, response.from)
        //             .replace(Constants.TO_PLACEHOLDER, response.to);
        //         this.feedbackEmitter(successMessage, null, Constants.SUCCESS_FEEDBACK_TYPE);
        //         this.explorerNavigator.listDossierContent();
        //     }
        // });
    };

    _moveHandler = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const {
            currentPath,
            selectedItem
        } = this._getSelectedItemAndWorkingDir(event.data);

        if (selectedItem.name === 'manifest') {
            return this.feedbackEmitter(this.model.error.labels.manifestManipulationError, null, Constants.ERROR_FEEDBACK_TYPE);
        }

        moveViewModel.selectedEntryName = selectedItem.name;
        moveViewModel.selectedEntryType = selectedItem.type;
        moveViewModel.currentWorkingDirectory = currentPath;
        moveViewModel.dateFormatOptions = this._getCleanProxyObject(this.model.dateFormatOptions);
        moveViewModel.contentLabels = {
            ...this.model.contentLabels,
            ...moveViewModel.contentLabels,
        };

        this.showModal('moveModal', moveViewModel, (err, response) => {
            if (err) {
                return this.feedbackEmitter(err, null, Constants.ERROR_FEEDBACK_TYPE);
            }

            if (!response.cancel) {
                const successMessage = this.model[Constants.SUCCESS].move
                    .replace(Constants.NAME_PLACEHOLDER, response.name)
                    .replace(Constants.FROM_PLACEHOLDER, response.from)
                    .replace(Constants.TO_PLACEHOLDER, response.to);
                this.feedbackEmitter(successMessage, null, Constants.SUCCESS_FEEDBACK_TYPE);
                this.explorerNavigator.listDossierContent();
            }
        });
    };

    _shareDossierHandler = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const {
            currentPath,
            selectedItem
        } = this._getSelectedItemAndWorkingDir(event.data);

        shareDossierViewModel.currentPath = currentPath;
        shareDossierViewModel.selectedFile = selectedItem.name;

        this.showModal('shareDossierModal', shareDossierViewModel, (err) => {
            if (err) {
                this.feedbackEmitter(err, null, Constants.ERROR_FEEDBACK_TYPE);
            }
        });
    };

    _addNewFileHandler = (model, target, event) => {
        event.stopImmediatePropagation();

        let cwd = this.model.currentPath || '/';

        newFileViewModel.currentPath = cwd;

        this.model.modalState = { cwd };
        let modalOptions = {
            controller : "file-folder-controllers/NewFileController",
            model: this.model.modalState,
            disableFooter: true,
            modalTitle: "Create new file"
        };

        this.model.onChange('modalState.refresh', this.refreshUI);
        this.showModalFromTemplate('new-file-modal', this.refreshUI, this.refreshUI, modalOptions);
    };

    _addNewFolderHandler = (model, target, event) => {
        event.stopImmediatePropagation();

        let cwd = this.model.currentPath || '/';

        newFolderViewModel.currentPath = cwd;

        this.model.modalState = { cwd };
        let modalOptions = {
            controller : "file-folder-controllers/NewFolderController",
            model: this.model.modalState,
            disableFooter: true,
            modalTitle: "Create new folder"
        };

        this.model.onChange('modalState.refresh', this.refreshUI);
        this.showModalFromTemplate('new-folder-modal', this.refreshUI, this.refreshUI, modalOptions);
    };

    _triggerFileSelect = (model, target, event) => {
        event.stopImmediatePropagation();
        let fileSelect = this.element.querySelector('#upload-file');
        fileSelect.value = '';
        fileSelect.click();
    }

    reader = (file) => {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.onerror = (err) => reject(err);
            fr.readAsBinaryString(file);
        })
    }

    _uploadFileHandler = async (event) => {
        let cwd = this.model.currentPath || '/';

        newFolderViewModel.currentPath = cwd;

        let files = event.target.files;
        if (files.length === 0) {
            return;
        }

        let filePath = cwd;
        if (filePath[filePath.length-1] !== '/') {
            filePath += '/';
        }

        // create file:
        loader.hidden = false;
        this.service = await getNewDossierServiceInstance();

        this.service.beginBatch();
        for (let file of files) {
            let fileName = file.webkitRelativePath || file.name;
            let writeFileAsync = $$.promisify(this.service.writeFile, this.service);
            try {
                let fileContent = await this.reader(file);
                await writeFileAsync(filePath + fileName, fileContent);
            }
            catch (err) {
                if (err) {
                    // display warning for user in UI
                }
            }
        }
        await this.service.commitBatchAsync();

        loader.hidden = true;
        console.log("saved"); // display message for user in UI
        this.refreshUI();
    }

    _triggerFolderSelect = (model, target, event) => {
        event.stopImmediatePropagation();
        let folderSelect = this.element.querySelector('#upload-folder');
        folderSelect.value = '';
        folderSelect.click();
    }

        _handleDownload = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const selectedItem = this._getSelectedItem(event.data);
        if (!selectedItem) {
            console.error(`No item selected to be downloaded!`);
            return;
        }

        const itemViewModel = this._getCleanProxyObject(selectedItem);
        if (itemViewModel.type === 'file') {
            this._handleDownloadFile(this.model.currentPath, itemViewModel.name);
        }
    };

    _handleDownloadFile(path, fileName) {
        let fileDownloader = new FileDownloader(path, fileName);
        fileDownloader.downloadFile();
    }

    showContextMenu = (model, target, event) => {
        console.log('clicked on context menu');
        if(!event){
            //this is click event from file type inputs
            event = model;
            if(event.target.type === "file"){
                return;
            }
        }
        if (model.type !== "file") {
            let fileOption = this.element.querySelector(`button[data-type="${model.type}"]`);
            fileOption.classList.add("hidden");
        }

        let contextMenu = this.element.querySelector(`div[name="${model.name}"]`);
        contextMenu.classList.toggle("hidden");
    }

    _handleViewFile = (model, target, event) => {
        let selectedItemName;
        if (!event) {   // if the _handleViewFile function is triggered by double-clicking the file
            event = model;
            event.preventDefault();
            event.stopImmediatePropagation();
            selectedItemName = event.target.querySelector('.item-name').textContent;
        }
        else {          // if the _handleViewFile function is triggered by the context menu "View file" button
            selectedItemName = event.target.parentElement.parentElement.querySelector('.item-name').textContent;
        }

        const { currentPath, selectedItem } = this._getSelectedItemAndWorkingDir(selectedItemName);
        if (!selectedItem) {
            console.error(`No item selected to be downloaded!`);
            return;
        }

        const itemViewModel = this._getCleanProxyObject(selectedItem);
        if (itemViewModel.type !== 'file') {
            console.error(`Only files support this funtionality!`);
            return;
        }

        itemViewModel.currentPath = currentPath;
        this.explorerNavigator.openViewFileModal(itemViewModel);
    };

    _getSelectedItemAndWorkingDir = (name) => {
        if (!this.model.content.length) {
            throw console.error('No content available');
        }

        const selectedItem = this._getSelectedItem(name);
        if (!selectedItem) {
            throw console.error('No item selected!');
        }

        return {
            currentPath: this.model.currentPath,
            selectedItem: this._getCleanProxyObject(selectedItem)
        };
    };

    _getSelectedItem = (name) => {
        return this.model.content.find((el) => el.name === name);
    };

    _getCleanProxyObject = (obj) => {
        return obj ? JSON.parse(JSON.stringify(obj)) : null;
    }

    toggleAddMenu = (model, target, event) => {
        if(!event){
            //this is click event from file type inputs
            event = model;
            if(event.target.type === "file"){
                return;
            }
        }
        let options = this.element.querySelector('#add-menu-options');
        options.classList.toggle("hidden");
    }
}
