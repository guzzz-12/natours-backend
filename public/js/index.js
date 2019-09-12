import "@babel/polyfill";
import {login, logout} from "./login";
import {renderMap} from "./mapbox";
import {updateData} from "./updateSettings";

const mapContainer = document.querySelector("#map");
const loginForm = document.querySelector("#form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");

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
    updateData(name, email);
  })
}