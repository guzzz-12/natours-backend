//Ocultar alertas
export const hideAlert = () => {
  const element = document.querySelector(".alert");
  if (element) {
    element.parentElement.removeChild(element)
  }
}

//Mostrar alertas
export const showAlert = (type, message) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${message}</div>`
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
  setTimeout(hideAlert, 3500);
}