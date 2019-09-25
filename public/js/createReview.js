import axios from "axios";
import {showAlert} from "./alerts";

export const addReview = async (userId, tourId, review, rating) => {
  try {
    //Tomar los reviews del tour
    const checkReview = await axios(`/api/v1/tours/${tourId}/reviews`);
    const reviews = checkReview.data.data.data;
    let reviewsUsersIds = [];
    reviews.forEach(review => {
      if(review.author) {
        reviewsUsersIds.push(review.author.id);
      }
    });
    
    //Chequear si el usuario ya agregó un review al tour
    if (reviewsUsersIds.includes(userId)) {
      showAlert("error", "You can't add multiple reviews to the same tour.");
      setTimeout(() => {
        window.history.back();
      }, 3500)
      return;
    }

    //Crear el review
    await axios({
      method: "POST",
      url: "/api/v1/reviews",
      data: {
        review: review,
        rating: parseInt(rating),
        tour: tourId,
        author: userId
      }
    });

    //Notificar al usuario que el review fue creado y redirigir a la página del tour
    showAlert("success", "Review added successfully! Redirecting...");
    setTimeout(() => {
      location.href = document.referrer;
    }, 3500)

  } catch(error) {
    showAlert("error", error.message);
    return;
  }
}