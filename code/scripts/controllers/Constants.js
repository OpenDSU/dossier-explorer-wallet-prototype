export default class Constants {
    static APPS_FOLDER = "/apps";
    static IMAGE_BASE_PATH = "assets/icons/";
    static DEFAULT_MARKETPLACE = "Default marketplace";
    static MARKETPLACE_SSAPP = "psk-marketplace-ssapp";
    static DOSSIER_EXPLORER_SSAPP = "dossier-explorer-ssapp";
    static EXCLUDED_APPS_FOR_REGISTER = [Constants.MARKETPLACE_SSAPP, Constants.DOSSIER_EXPLORER_SSAPP];
    static AVAILABLE_APPLICATIONS_MARKETPLACE = "/availableApps";
    static MY_INSTALLED_APPLICATIONS = "/my-apps";
    static DELETE_ITEMS_PLACEHOLDER = "[DELETE_ITEMS_PLACEHOLDER]";

    static NAME_PLACEHOLDER = "[NAME]";
    static PATH_PLACEHOLDER = "[PATH]";
    static FROM_PLACEHOLDER = "[FROM]";
    static TO_PLACEHOLDER = "[TO]";

    static ERROR = "error";
    static ERROR_FEEDBACK_TYPE = "alert-danger";

    static WARNING = "warning";
    static WARNING_FEEDBACK_TYPE = "alert-warning";

    static NOTIFICATION = "notification";
    static NOTIFICATION_FEEDBACK_TYPE = "alert-primary";

    static SUCCESS = "success"
    static SUCCESS_FEEDBACK_TYPE = "alert-success";
}