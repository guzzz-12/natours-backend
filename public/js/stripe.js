import axios from "axios";
import {showAlert} from "./alerts";

export const bookTour = async (tourId, userId, event) => {
  const stripe = Stripe("pk_test_UOKLVh6kbRl4QJDri8Cd27iA00WBmWgp06");
  try {
    //Obtener la sesión de stripe generada en el backend
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    //Chaequear si el usuario ya tiene el tour reservado
    const user = await axios(`/api/v1/users/${userId}`);
    const userBookings = user.data.data.data.bookings;
    let toursBookedIds = [];

    if(userBookings.length > 0) {
      userBookings.forEach(el => {
        toursBookedIds.push(el.tour.id);
      })
    }

    if (toursBookedIds.includes(tourId)) {
      showAlert("error", "You already booked this tour");
      event.target.textContent = "Tour already booked";
      event.target.disabled = true;
      return
    }
  
    // Crear el formulario de pago
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });

  } catch(error) {
    showAlert("error", error)
  }
}