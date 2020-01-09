import axios from "axios";
import {showAlert} from "./alerts";

export const sendForgotPasswordEmail = (email) => {
  axios({
    method: "POST",
    url: "/api/v1/users/forgot-password",
    data: {
      email: email
    }
  })
  .then(res => {
    if (res.data.status === "success") {
      showAlert("success", "Email sent! Check your inbox.");
    }
  })
  .catch(err => {
    showAlert("error", err.response.data.message);
  })
}