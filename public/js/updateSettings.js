import axios from "axios";
import {showAlert} from "./alerts";

export const updateData = (name, email) => {
  axios({
    method: "PATCH",
    url: "http://localhost:3000/api/v1/users/updateMe",
    data: {
      name: name,
      email: email
    }
  })
  .then(res => {
    if (res.data.status === "success") {
      showAlert("success", "User updated successfully");
    }
  })
  .catch(err => {
    showAlert("error", err.response.data.message)
  })
}