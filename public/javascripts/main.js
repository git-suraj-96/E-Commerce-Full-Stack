const lists = document.querySelectorAll(".n-a-nav ul li");
const newArrivalsProductImages =
  document.querySelectorAll(".n-a-article-image");
const newArrivalsProducDescription = document.querySelectorAll(".n-a-a-p");
const newArrivalsProductPrice = document.querySelectorAll(".n-a-price");

lists.forEach((list) => {
  list.addEventListener("click", () => {
    lists.forEach((li) => (li.style.textDecoration = "none"));
    list.style.textDecoration = "underline";

    let category = list.innerHTML;
    fetch("/home", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: category,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          data.products.forEach((product, index) => {
            newArrivalsProductImages[
              index
            ].style.backgroundImage = `url("/images/uploads/${product.productImage}")`;
            newArrivalsProducDescription[
              index
            ].innerText = `${product.description}`;
            newArrivalsProductPrice[index].innerText = `₹ ${product.price}`;
          });
        }
      })
      .catch((err) => console.error(err));
  });
});

