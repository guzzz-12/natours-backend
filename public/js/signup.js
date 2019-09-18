import axios from "axios";
import {showAlert} from "./alerts";

export const signup = (username, email, password, passwordConfirm) => {
  axios({
    method: "POST",
    url: "/api/v1/users/signup",
    data: {
      name: username,
      email: email,
      password: password,
      passwordConfirm: passwordConfirm
    }
  })
  .then(res => {
    if (res.data.status === "success") {
      showAlert("success", "Signed up successfully");
      window.setTimeout(() => {
        location.assign("/me")
      }, 1500)
    }
  })
  .catch(err => {
    showAlert("error", err.response.data.message);
  })
}