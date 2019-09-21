import axios from "axios";
import {showAlert} from "./alerts";
import bcrypt from "bcryptjs";
const disableConfirmModal = document.querySelector(".disable-account-modal-container");
const cancelBtn = document.querySelector(".disableAccount--cancel");

const confirmDisable = async () => {
  //Deshabilitar la cuenta
  await axios.delete("/api/v1/users/deleteMe");

  //Borrar el cookie de autenticación
  document.cookie = "jwt" + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';

  //Ocultar el modal
  disableConfirmModal.classList.add("disable-account-modal-container--hidden");

  //Mostrar la notificación al deshabilitar la cuenta
  showAlert("success", "Your account was disabled");

  //Redirigir al home
  window.setTimeout(() => {
    location.assign("/")
  }, 3500)
}

cancelBtn.addEventListener("click", () => {
  disableConfirmModal.classList.add("disable-account-modal-container--hidden");
})

export const disableAccount = async (providedPassword, password) => {
  try {
    const checkPassword = await bcrypt.compare(providedPassword, password);
    if(!checkPassword) {
      showAlert("error", "Wrong password");
      return
    }    
    disableConfirmModal.classList.remove("disable-account-modal-container--hidden");

    //Confirmar desactivación de la cuenta
    document.querySelector(".disableAccount").addEventListener("click", confirmDisable);

  } catch(error) {
    showAlert("error", error.message);
    return;
  }
}