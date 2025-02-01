/* eslint-disable */

const hideAlert = () => {
  const el = document.getElementsByClassName('alert')[0];
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, mes) => {
  const markup = `<div class='alert alert--${type}'>${mes}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  window.setTimeout(hideAlert, 5000);
};
