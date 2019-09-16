import "@babel/polyfill";
import {login, logout} from "./login";
import {renderMap} from "./mapbox";
import {updateData} from "./updateSettings";
import {bookTour} from "./stripe";

const mapContainer = document.querySelector("#map");
const loginForm = document.querySelector("#form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");
const bookBtn = document.getElementById("book-tour");

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

    const form = new FormData();
    form.append("name", document.querySelector("#name").value);
    form.append("email", document.querySelector("#email").value);
    form.append("photo", document.getElementById("photo").files[0]);

    updateData(form, "data");
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

if(bookBtn) {
  bookBtn.addEventListener("click", (e) => {
    e.target.textContent = "Processing...";
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  })
}