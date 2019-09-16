import axios from "axios";
import {showAlert} from "./alerts";

export const bookTour = async (tourId) => {
  const stripe = Stripe("pk_test_UOKLVh6kbRl4QJDri8Cd27iA00WBmWgp06");
  try {
    //Obtener la sesión de stripe generada en el backend
    const session = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session)
  
    // Crear el formulario de pago
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });

  } catch(error) {
    console.log(error);
    showAlert("error", error)
  }
}