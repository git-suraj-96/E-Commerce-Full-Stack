const placeOrderBtn = document.querySelector(".place-order");
const fullName = document.querySelector(".full-name");
const mobileNumber = document.querySelector(".mobile-number");
const address = document.querySelector(".address");
const cityName = document.querySelector(".city-name");
const stateName = document.querySelector(".state-name");
const pincode = document.querySelector(".pin-code");
const countryName = document.querySelector(".country-name");
const billingSame = document.querySelector("#billing-same");
const paymentMethod = document.getElementById("payment-method");
const flashMessage = document.querySelector(".flash-message");

placeOrderBtn.addEventListener("click", () => {
  const username = fullName.value;
  const userMobileNo = mobileNumber.value;
  const userAdd = address.value;
  const city = cityName.value;
  const state = stateName.value;
  const Pincode = pincode.value;
  const country = countryName.value;
  const billSame = billingSame.checked;
  const payMethod = paymentMethod.checked;

  if (
    !(
      username &&
      userMobileNo &&
      userAdd &&
      city &&
      state &&
      Pincode &&
      country &&
      payMethod
    )
  ) {
    flashMessage.style.display = "block";
    setTimeout(() => {
      flashMessage.style.display = "none";
    }, 3000);
    return;
  }

  fetch("/confirmOrder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({username, userMobileNo, userAdd, city, state, Pincode, country, payMethod}),
  })
    .then((res) => res.json())
    .then((data) => {
      if(data.success){
        window.location.href = data.redirect
      }else{
        console.log(data.error);
      }
    })
    .catch((err) => console.error(err));
});
