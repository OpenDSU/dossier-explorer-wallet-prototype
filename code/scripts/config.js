const {define} = WebCardinal.components;
const {setConfig, getConfig, addHook, addControllers} = WebCardinal.preload;

function initializeWebCardinalConfig() {
  const config = getConfig();

  config.identity.avatar = "/assets/images/dossier-explorer.png";
  config.identity.name = "Dossier Explorer";

  return config;
}

let config = initializeWebCardinalConfig();
setConfig(config);
