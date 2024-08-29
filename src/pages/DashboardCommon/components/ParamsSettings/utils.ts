export const SettingsSaveKey = 'recognition-params-settings';

export const getParamsSettings = () => {
  const settings = window.sessionStorage.getItem(SettingsSaveKey);
  if (settings) {
    try {
      const curSettings = JSON.parse(settings);
      if (curSettings && typeof curSettings === 'object') {
        return curSettings;
      }
    } catch (error) {
      console.log('parse error', error, settings);
    }
  }
  return null;
};
