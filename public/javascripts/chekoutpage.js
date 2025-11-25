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
emailjs.init("5f4bzSOCuSb1PZNw7");


async function sendMail(custDetail) {
  var templateParams = {
    message : `New Order Received — Customer: ${custDetail.username}, Mobile: ${custDetail.userMobileNo}, Address: ${custDetail.userAdd}, ${custDetail.city}, ${custDetail.state}, ${custDetail.country}, Pincode: ${custDetail.Pincode}`,
  };

  await emailjs.send("service_trmfi9y", "template_tknv4ck", templateParams).then(
    (response) => {
      console.log("SUCCESS!", response.status, response.text);
    },
    (error) => {
      console.log("FAILED...", error);  
    }
  );
}

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
    body: JSON.stringify({
      username,
      userMobileNo,
      userAdd,
      city,
      state,
      Pincode,
      country,
      payMethod,
    }),
  })
    .then((res) => res.json())
    .then  (async (data) => {
      if (data.success) {
        await sendMail(data.customer);
        window.location.href = data.redirect;
      } else {
        console.log(data.error);
      }
    })
    .catch((err) => console.error(err));
});
