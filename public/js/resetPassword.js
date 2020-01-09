import axios from "axios";
import {showAlert} from "./alerts";

export const resetPassword = (password, passwordConfirm, token) => {
  axios({
    method: "PATCH",
    url: `/api/v1/users/reset-password/${token}`,
    data: {
      password,
      passwordConfirm
    }
  })
  .then(res => {
    if (res.data.status === "success") {
      showAlert("success", "Password successfully updated.");
      location.assign("/");
    }
  })
  .catch(err => {
    showAlert("error", err.response.data.message);
  })
}