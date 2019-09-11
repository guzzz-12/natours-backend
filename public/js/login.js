import axios from "axios";

export const login = (email, password) => {
  axios({
    method: "POST",
    url: "http://localhost:3000/api/v1/users/login",
    data: {
      email: email,
      password: password
    }
  })
  .then(res => {
    if (res.data.status === "success") {
      alert("Logged in successfully");
      window.setTimeout(() => {
        location.assign("/")
      }, 1500)
    }
  })
  .catch(err => {
    alert(err.response.data.message);
  })
}