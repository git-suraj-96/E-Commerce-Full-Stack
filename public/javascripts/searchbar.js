const searchAnchor = document.querySelector(".search-anchor");
const searchBox = document.querySelector(".search-box");

function search(){
    const value = searchBox.value.trim();
    if(!value) return;

    searchAnchor.setAttribute("href", `/search/${value}`);
    searchBox.value = "";
}

searchAnchor.addEventListener("click", ()=> {
    search();
});

searchBox.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
        searchAnchor.click(); 
    }
});
