const {WebcController} = WebCardinal.controllers;

export default class FileController extends WebcController {

    constructor(element, history) {
        super(element, history);
        this.model = {
            isEditable: false,
            isEditing: false,
            closingConfirmation: false,
            title: "Loading file"
        }


    }

    setEventListeners () {
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
}