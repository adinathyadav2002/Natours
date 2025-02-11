/* eslint-disable */

import { showAlert } from './alerts';
import axios from 'axios';

// type can be either 'data' or 'password'
export const updateUserEmailName = async (data, type) => {
  try {
    const url =
      type === 'data'
        ? '/api/v1/users/updateMe'
        : '/api/v1/users/updatePassword';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated succesfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
