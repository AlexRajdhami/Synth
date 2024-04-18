const header =document.querySelector("header");

window.addEventListener ("scroll", function(){
    header.classList.toggle ("sticky", this.windows.scrolly >0);
})