import "@babel/polyfill";
import {login, logout} from "./login";
import {renderMap} from "./mapbox";

const mapContainer = document.querySelector("#map");
const loginForm = document.querySelector(".form");
const logOutBtn = document.querySelector(".nav__el--logout");

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