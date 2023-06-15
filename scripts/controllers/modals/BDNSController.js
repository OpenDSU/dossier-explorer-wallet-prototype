import utils from "../../utils/utils.js"
import constants from "../../constants.js";

const {WebcController} = WebCardinal.controllers;
const {loader} = WebCardinal;

export default class BDNSController extends WebcController {

  constructor(element, history, ...args) {
    super(element, history, ...args);
    this.model.showCurrentBDNS = false;
    this.model.BDNSButtonLabel = "Show bdns";
    this.model.currentBdns = {};

    this.setEventListeners();
  }

  setEventListeners() {
    this.onTagClick('cancel', () => {
      this.cancel()
    });
    this.onTagClick('update-bdns', async () => {
      loader.hidden = false;
      await this.updateBDNS();
      loader.hidden = true;
      this.cancel();
    });

    this.onTagClick("toggle-view-bdns", async () => {
      this.model.showCurrentBDNS = !this.model.showCurrentBDNS;
      this.element.querySelector(".current-bdns-preview").classList.toggle("hidden")
      this.model.BDNSButtonLabel = this.model.showCurrentBDNS ? "Hide bdns" : "Show bdns";

      this.model.currentBdns = JSON.stringify(await utils.getCurrentBdns(), null, 4);
    })
    this.onTagClick("upload-file", (model, target, event) => {
      event.stopImmediatePropagation();
      let fileSelect = this.element.querySelector('#upload-bdns-file');
      fileSelect.value = '';
      fileSelect.click();
    })
    this.element.querySelector('#upload-bdns-file').addEventListener('change', this._uploadFileHandler);

  }

  _uploadFileHandler = async (event) => {
    let files = event.target.files;
    if (files.length === 0) {
      return;
    }
    try {
      for (let file of files) {
        this.element.querySelector('#file-content-textarea').value = await utils.readFile(file);
      }
    } catch (e) {
      this.model.userInteractionService.showError("Error", "Failed read file", e);
    }

    loader.hidden = true;
    this.model.refreshUI();
  }

  cancel() {
    this.element.destroy();
  }

  async updateBDNS() {

    let bdnsJSONValue = this.element.querySelector('#file-content-textarea').value;
    let newDlDomains = {};
    try {
      let bdnsValue = JSON.parse(bdnsJSONValue);
      Object.keys(bdnsValue).forEach(key => {
        newDlDomains[key] = {};
        newDlDomains[key].replicas = bdnsValue[key].replicas || [];
        newDlDomains[key].anchoringServices = bdnsValue[key].anchoringServices || [];
        newDlDomains[key].notifications = bdnsValue[key].notifications || [];
        newDlDomains[key].brickStorages = bdnsValue[key].brickStorages || [];
      })
      let localDomains = await this.updateBDNSFile(newDlDomains);
      await utils.updateBDNS(localDomains);
    } catch (e) {
      this.model.userInteractionService.showError("Error", "Failed to parse json, Please check if provided value is a valid json and respects BDNS schema");
    }
  }


  async updateBDNSFile(BDNS) {

    let fileContent = await utils.getLocalBDNSFile();
    if (fileContent) {
      BDNS = {...JSON.parse(fileContent), ...BDNS};
    }
    await utils.saveDossierFile(constants.LOCAL_BDNS_FILEPATH, JSON.stringify(BDNS));
    this.model.refreshUI();
    return BDNS
  }

}
