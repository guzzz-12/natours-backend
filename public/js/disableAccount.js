import axios from "axios";
import {showAlert} from "./alerts";
const disableConfirmModal = document.querySelector(".disable-account-modal-container");
const cancelBtn = document.querySelector(".disableAccount--cancel");

const confirmDisable = (providedPassword) => {
  
  //Deshabilitar la cuenta
  axios({
    method: "POST",
    url: "/api/v1/users/deleteMe",
    data: {
      password: providedPassword
    }
  })
  .then(() => {
    //Borrar el cookie de autenticación
    document.cookie = "jwt" + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  
    //Ocultar el modal
    disableConfirmModal.classList.add("disable-account-modal-container--hidden");
  
    //Mostrar la notificación al deshabilitar la cuenta
    showAlert("success", "Your account was successfully disabled");
  
    //Redirigir al home
    window.setTimeout(() => {
      location.assign("/")
    }, 3500);

  })
  .catch((err) => {
    showAlert("error", err.response.data.message);
    disableConfirmModal.classList.add("disable-account-modal-container--hidden");
  })
}

export const disableAccount = async (providedPassword) => {
  //Mostrar el modal de confirmación
  disableConfirmModal.classList.remove("disable-account-modal-container--hidden");

  //Confirmar desactivación de la cuenta
  document.querySelector(".disableAccount").addEventListener("click", () => {
    confirmDisable(providedPassword)
  });

  //Cancelar la desactivación de la cuenta
  if(cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      disableConfirmModal.classList.add("disable-account-modal-container--hidden");
    })
  }
}