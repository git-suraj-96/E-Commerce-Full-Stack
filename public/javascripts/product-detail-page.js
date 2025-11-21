const cartBtn = document.querySelector(".add-to-cart");
const cartNumber = document.querySelector(".cart-number");

cartBtn.addEventListener("click", () => {
  const productId = cartBtn.dataset.post;

  fetch("/addtocart", {
    method: "POST", 
    headers: {
      "Content-Type": "application/json", 
    },
    body: JSON.stringify({
        
        productId : productId
      
    }),
  })
    .then((res) => res.json()) 
    .then((data) => {
        if(data.success){
            let cartValue = cartNumber.innerHTML;
            cartNumber.innerHTML = parseInt(cartValue) + 1;
            alert(data.message);
        }
    })
    .catch((err) => console.error(err));
});
