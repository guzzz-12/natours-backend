import axios from "axios";
import {showAlert} from "./alerts";

export const updateData = async (data, type) => {
  const url = type === "password" ? "http://localhost:3000/api/v1/users/updatePassword" : "http://localhost:3000/api/v1/users/updateMe";

  axios({
    method: "PATCH",
    url: url,
    data: data
  })
  .then(res => {
    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} updated successfully`);
    }
  })
  .catch(err => {
    showAlert("error", err.response.data.message)
  })
}