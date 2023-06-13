class UserInteractionService {
    constructor() {
    }

    showError(title, ...args) {
        let toastAlert = document.createElement("div");
        toastAlert.setAttribute("role", "alert");
        toastAlert.setAttribute("aria-live", "assertive");
        toastAlert.setAttribute("aria-atomic", "true");
        // toastAlert.setAttribute("data-autohide", "false");
        toastAlert.setAttribute("data-delay", "300");
        toastAlert.classList.add("error-toast");

        this.addToastMessage(toastAlert, title, args);

        document.getElementById("toasts").appendChild(toastAlert);
        toastAlert.classList.add("show");
        this.addToastEventListeners(toastAlert);
    }

    showAlert(title, ...args) {
        let toastAlert = document.createElement("div");
        toastAlert.setAttribute("role", "alert");
        toastAlert.setAttribute("aria-live", "assertive");
        toastAlert.setAttribute("aria-atomic", "true");
        // toastAlert.setAttribute("data-autohide", "false");
        toastAlert.setAttribute("data-delay", "300");
        toastAlert.classList.add("alert-toast");

        this.addToastMessage(toastAlert, title, args);

        document.getElementById("toasts").appendChild(toastAlert);
        toastAlert.classList.add("show");
        this.addToastEventListeners(toastAlert);
    }

    showInfo(title, ...args) {
        let toastAlert = document.createElement("div");
        toastAlert.setAttribute("role", "alert");
        toastAlert.setAttribute("aria-live", "assertive");
        toastAlert.setAttribute("aria-atomic", "true");
        // toastAlert.setAttribute("data-autohide", "false");
        toastAlert.setAttribute("data-delay", "300");
        toastAlert.classList.add("info-toast");

        this.addToastMessage(toastAlert, title, args);

        document.getElementById("toasts").appendChild(toastAlert);
        toastAlert.classList.add("show");
        this.addToastEventListeners(toastAlert);
    }

    showConfirm(title, ...args) {
        let toastAlert = document.createElement("div");
        toastAlert.setAttribute("role", "alert");
        toastAlert.setAttribute("aria-live", "assertive");
        toastAlert.setAttribute("aria-atomic", "true");
        // toastAlert.setAttribute("data-autohide", "false");
        toastAlert.setAttribute("data-delay", "300");
        toastAlert.classList.add("confirm-toast");

        this.addToastMessage(toastAlert, title, args);

        document.getElementById("toasts").appendChild(toastAlert);
        toastAlert.classList.add("show");
        this.addToastEventListeners(toastAlert);
    }

    addToastMessage(toast, title, ...args) {
        toast.innerHTML = "  <div class=\"toast-header\">\n" +
            "    <strong class=\"mr-auto\">" + title + "</strong>\n" +
            "    <button type=\"button\" class=\"ml-2 mb-1 close\" data-dismiss=\"toast\" aria-label=\"Close\">\n" +
            "      <span aria-hidden=\"true\">&times;</span>\n" +
            "    </button>\n" +
            "  </div>\n" +
            "  <div class=\"toast-body\">\n" +
            args +
            "  </div>\n"
    }

    addToastEventListeners(toast) {
        toast.querySelector('.close').addEventListener('click', (model, target, event) => {
            if (!event) {
                //this is click event from file type inputs
                event = model;
            }
            toast.classList.remove("show");
            toast.classList.add("hide");
        })
    }
}

let instance = new UserInteractionService();
let getNewUserInteractionServiceInstance = async function () {
    return instance;
}

export {
    getNewUserInteractionServiceInstance
};
