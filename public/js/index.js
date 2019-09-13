import "@babel/polyfill";
import {login, logout} from "./login";
import {renderMap} from "./mapbox";
import {updateData} from "./updateSettings";

const mapContainer = document.querySelector("#map");
const loginForm = document.querySelector("#form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");

//Mostrar el mapa
if (mapContainer) {
  const locations = JSON.parse(mapContainer.dataset.locations);
  renderMap(locations);
}

//Hacer login
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    login(email, password);
  });
}

//Hacer logout
if (logOutBtn) {
  logOutBtn.addEventListener("click", logout)
}

//Actualizar los datos del usuario
if (userDataForm) {
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    updateData({name, email}, "data");
  })
}

//Actualizar la contraseña del usuario
if (userPasswordForm) {
  userPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentPassword = document.querySelector("#password-current").value;
    const newPassword = document.querySelector("#password").value;
    const passwordConfirm = document.querySelector("#password-confirm").value;
    await updateData({currentPassword, newPassword, passwordConfirm}, "password");

    //Limpiar los campos del formulario luego de procesarlos
    document.querySelector("#password-current").value = "";
    document.querySelector("#password").value = "";
    document.querySelector("#password-confirm").value = "";
  })
}