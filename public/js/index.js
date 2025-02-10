/* eslint-disable */

import '@babel/polyfill';
import { login, logOut } from './login';
import { updateUserEmailName } from './updateUserData';

const loginForm = document.querySelector('.form--login');
const logOutButton = document.querySelector('.nav__el--logout');
const updateDataForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-settings');

// event listener for LOGIN button
if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // values from email
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;

    login(email, password);
  });

// event listener for LOGOUT button
if (logOutButton) {
  logOutButton.addEventListener('click', logOut);
}

// event listener for updating email and name form button
if (updateDataForm) {
  const updateNameEmailButton = updateDataForm.querySelector('.btn');
  updateNameEmailButton.addEventListener('click', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', updateDataForm.querySelector('#name')?.value);
    form.append('email', updateDataForm.querySelector('#email')?.value);
    form.append('photo', updateDataForm.querySelector('#photo')?.files[0]);

    updateUserEmailName(form, 'data');

    // THIS WILL NOT WORK FOR DATA WITH TEXT
    // const email = updateDataForm.querySelector('#email')?.value;
    // const name = updateDataForm.querySelector('#name')?.value;
    // updateUserEmailName({ email, name }, 'data');
  });
}

// event listener for updating password form button
if (updatePasswordForm && updatePasswordForm.querySelector('.btn')) {
  updatePasswordForm
    .querySelector('.btn')
    .addEventListener('click', async (e) => {
      e.preventDefault();

      document.querySelector('.btn--save-password').textContent = 'Updating..';

      // get values from the form
      const passwordCurrent =
        updatePasswordForm.querySelector('#password-current').value;
      const password = updatePasswordForm.querySelector('#password ').value;
      const passwordConfirm =
        updatePasswordForm.querySelector('#password-confirm').value;

      await updateUserEmailName(
        { passwordCurrent, password, passwordConfirm },
        'password',
      );

      // Clear the values after using them
      updatePasswordForm.querySelector('#password-current').value = '';
      updatePasswordForm.querySelector('#password ').value = '';
      updatePasswordForm.querySelector('#password-confirm').value = '';

      // Change the textcontent of button from updating... to save password
      document.querySelector('.btn--save-password').textContent =
        'Save Password';
    });
}
