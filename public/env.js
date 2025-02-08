var envObj = {};
Object.defineProperty(envObj, "PRIVATE", { value: "", writable: false, configurable: false });
Object.defineProperty(envObj, "API_URL", { value: "", writable: false, configurable: false });
Object.defineProperty(envObj, "DOC_URL", { value: "", writable: false, configurable: false });
Object.defineProperty(window, "_env_host", { value: envObj, writable: true, configurable: false });