const {define} = WebCardinal.components;
const {setConfig, getConfig, addHook, addControllers} = WebCardinal.preload;
import constants from "./constants.js";
import utils from "./utils/utils.js";

function initializeWebCardinalConfig() {
  const config = getConfig();

  config.identity.avatar = "/assets/images/dossier-explorer.png";
  config.identity.name = "Dossier Explorer";

  return config;
}

let config = initializeWebCardinalConfig();
setConfig(config);

addHook(constants.HOOKS.BEFORE_APP_LOADS, async () => {
  await utils.updateBDNS()
})

