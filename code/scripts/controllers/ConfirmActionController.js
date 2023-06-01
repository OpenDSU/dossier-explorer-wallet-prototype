const {WebcController} = WebCardinal.controllers;

export default class ConfirmActionController extends WebcController {
    constructor(element, history) {
        super(element, history);

        this.acceptButtonOnClick();
        this.denyButtonOnClick();
    }

    denyButtonOnClick() {
        this.on('deny-button-on-click', (event) => {
            this._finishProcess(event, {value: false})
        });
    }

    acceptButtonOnClick() {
        this.on('accept-button-on-click', (event) => {
            this._finishProcess(event, {value: true})
        });
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
