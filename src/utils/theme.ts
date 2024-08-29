const alpha = {
  'alpha-100': 1,
  'alpha-68': 0.68,
  'alpha-50': 0.5,
  'alpha-30': 0.3,
  'alpha-10': 0.1,
};
const theme = {
  theme: 'rgba(58, 65, 92, 1)',

  'theme-color': 'rgba(72,119,255,1)',
  'theme-color-30': `rgba(72,119,255,${alpha['alpha-30']})`,
  'theme-color-10': `rgba(72,119,255,${alpha['alpha-10']})`,

  'theme-68': `rgba(58, 65, 92,${alpha['alpha-68']})`,
  'theme-50': `rgba(58, 65, 92,${alpha['alpha-50']})`,
  'theme-30': `rgba(58, 65, 92,${alpha['alpha-30']})`,

  'theme-blue': 'rgba(72, 119, 255, 1)',
  'theme-blue-30': `rgba(72, 119, 255, ${alpha['alpha-30']})`,
  'theme-blue-10': `rgba(72, 119, 255, ${alpha['alpha-10']})`,
};
const tipColor = {
  'success-color': 'rgba(27, 205, 202, 1)',
  'success-color-30': `rgba(27, 205, 202, ${alpha['alpha-30']})`,
  'success-color-10': `rgba(27, 205, 202, ${alpha['alpha-10']})`,

  'error-color': 'rgba(240, 110, 109, 1)',
  'error-color-30': `rgba(240, 110, 109, ${alpha['alpha-30']})`,
  'error-color-10': `rgba(240, 110, 109, ${alpha['alpha-10']})`,

  'warning-color': 'rgba(250, 173, 20, 1)',
  'warning-color-30': `rgba(250, 173, 20, ${alpha['alpha-30']})`,
  'warning-color-10': `rgba(250, 173, 20, ${alpha['alpha-10']})`,

  'purple-color': 'rgba(72, 119, 255, 1)',
  'purple-color-30': `rgba(72, 119, 255, ${alpha['alpha-30']})`,
  'purple-color-10': `rgba(72, 119, 255, ${alpha['alpha-10']})`,

  'gray-color': 'rgba(204, 204, 204, 1)',
  'gray-color-30': `rgba(204, 204, 204, ${alpha['alpha-30']})`,
  'gray-color-10': `rgba(204, 204, 204, ${alpha['alpha-10']})`,

  'placeholder-color': '#C0C4CC',
};
const datePicker = {
  'picker-basic-cell-hover-color': '#F2F5FA',
  'heading-color': '#030A1A',
};
const textColor = {
  'text-gray-color': '#858C99',
};
const alertColor = {
  'info-color': '@primary-color',
  'success-color': '#14CC9E',
  'warning-color': '#E57A2E',
  'error-color': '#E55245',
  'alert-info-bg-color': '#E9F0FF',
  'alert-info-border-color': '#A3C2FF',
  'alert-info-icon-color': '@primary-color',
  'alert-warning-bg-color': '#FFF0EB',
  'alert-warning-border-color': '#F5C8AA',
  'alert-warning-icon-color': '#E57A2E',
  'alert-error-bg-color': '#FFF0EB',
  'alert-error-border-color': '#F5B9B4',
  'alert-error-icon-color': '#E55245',
  'alert-success-bg-color': '#E8FAF6',
  'alert-success-border-color': '#A1EBD8',
  'alert-success-icon-color': '#14CC9E',
};
const modalVariable = {
  'modal-header-padding-vertical': '13px',
  'modal-header-padding-horizontal': '20px',
  'modal-header-close-size': '48px',
  'modal-body-padding': '30px 20px',
  'modal-footer-padding-vertical': '16px',
  'modal-footer-padding-horizontal': '20px',
  'modal-mask-bg': 'rgba(3, 10, 26, 0.6)',
};
const tableColor = {
  'table-header-bg': '#F2F5FA',
  'table-header-sort-bg': '@table-header-bg',
  'table-header-sort-active-bg': '@table-header-bg',
  'table-padding-vertical': '8px',
  'table-padding-horizontal': '20px',
  'table-header-icon-color': '#858C99',
  'table-border-color': '#DCDFE5',
};
const progress = {
  'processing-color': '@primary-color',
  'progress-remaining-color': '#DCDFE5',
};
const commonVariable = {
  'input-placeholder-color': '@placeholder-color',
  'input-hover-border-color': '@primary-color',
  'btn-border-radius-base': '4px',
  'border-color-split': '#DCDFE5',
  'divider-color': '#DCDFE5',
  'item-hover-bg': '#F2F5FA',
  'hover-blue-color': '#5e93ff',
  'blue-light-color': '#A3C2FF',
  'disabled-color': '#C0C4CC',
  'disabled-bg': '#F2F5FA',
};
export default {
  ...theme,
  ...tipColor,
  ...datePicker,
  ...textColor,
  ...alertColor,
  ...modalVariable,
  ...tableColor,
  ...progress,
  ...commonVariable,
};
