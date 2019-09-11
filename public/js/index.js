import "@babel/polyfill";
import {login} from "./login";
import {renderMap} from "./mapbox";

const mapContainer = document.querySelector("#map");
const loginForm = document.querySelector(".form");

if (mapContainer) {
  const locations = JSON.parse(mapContainer.dataset.locations);
  renderMap(locations);
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    login(email, password);
  });
}
