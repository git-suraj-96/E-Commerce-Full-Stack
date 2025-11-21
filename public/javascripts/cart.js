const cartDelete = document.querySelectorAll(".delete-cart");
const shoopingBagHeading = document.querySelector(".shopping-bag");
const subTotal = document.querySelector(".sub-total");
const total = document.querySelector(".total");
const checkoutBtn = document.querySelector(".checkout-btn");
const ordersummary = document.querySelector(".order-summary");
const CartItems = document.querySelectorAll(".cart-item");


cartDelete.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    const itemId = btn.dataset.post;

    fetch("/deletecartitem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemId: itemId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.success) {          
          CartItems[i].style.display = "none";
          alert(data.message);
          shoopingBagHeading.innerHTML = `Shopping Bag (${data.cartlength} items)`;
          subTotal.innerHTML = `₹ ${data.totalPrice}`;
          total.innerHTML = `₹ ${data.totalPrice}`;

          if (data.cartlength < 1) {
            ordersummary.style.display = "none";
          } else {
            ordersummary.style.display = "block";
          }
        } else {
          console.log(data.error);
          console.log("I am eror block");
          console.log(data.message)
        }
      })
      .catch((err) => console.log(err));
  });
});

checkoutBtn.addEventListener("click", () => {
  window.location.href = "/checkoutpage";
});
