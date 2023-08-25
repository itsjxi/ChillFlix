


export class MoviesRenderer{
    constructor(data){
    this.data = data;
    this.slider = document.querySelector(".slider"); 
    this.container = document.querySelector(".container"); 
   
   
  }
  
  MoviesinSlider(data){  
     
    this.createSliderElements();
    this.bindPointerClickEvent();
    this.renderMovies(data);
  
   } 

  renderMovies(data){ 
    data.forEach((item,index)=>{
    const imageBlock = document.createElement("div");
    imageBlock.classList.add("imageBlock")
    imageBlock.setAttribute("href","/movieInfo"+"_"+item.id)
    imageBlock.style.backgroundImage = `url(${item.image_large})`;
    imageBlock.innerHTML = `<div class = "wishlist">+</div><div class = "details">
                              <div class "nameAndGenre">
                                <h3 class = "movieTitle">${item.title}</h3>
                                <p class = "typeOfMovie">${item.genre.join(",")}</p>
                              </div>
                              <div class = "rating">                                  
                                  <p><i class= "fa fa-star-o" style="font-size:22px"></i>${item.rating.star}/10</p>
                                  <p>  ${Math.floor(item.rating.count/1000)} k</p>
                              </div>
                            </div>`
    this.container.appendChild(imageBlock)
   }
   )
   this.bindEventOnIndividualMovies(this.data);
  }

handelRouter(data){
  window.addEventListener("popstate", this.bindEventOnIndividualMovies);

  const route = window.location.pathname;
    console.log(route);
    data.forEach((item)=>{
      if(route === "/movieInfo"+"_"+item.id){
       this.bindEventOnIndividualMovies()
       }
    });

  document.addEventListener("click", (event) => {
      const target = event.target;
      console.log(event.target)
      console.log(target.tagName)
      if (target.getAttribute("href")) {
          event.preventDefault();
          history.pushState(null, "", target.getAttribute("href"));
          this.bindEventOnIndividualMovies();
      }
  });
}

  bindEventOnIndividualMovies(data){
    const container = document.querySelector(".container")
    const imageBlock =  container.querySelectorAll(".imageBlock");
    console.log(imageBlock)
    imageBlock.forEach((item,index)=>{
      item.addEventListener("click",(event)=>{
         
        
        const movieURL = window.location.pathname
        console.log(movieURL)

        const title = item.querySelector("h3").textContent;
        console.log(title);
         let singleMovieData = data.filter((movie)=>{
           return movie.title === title;
            
        })
        console.log(singleMovieData)
        this.individualMoviesDetails(singleMovieData)
        })
      })
      
  }

  individualMoviesDetails(singleMovieData){
      const indivisualDetails = document.createElement("div");
      let item = singleMovieData[0];
      indivisualDetails.classList.add("indivisualDetails");
      indivisualDetails.innerHTML = `<div class = "movieImage">
                                        <img src=${item.image_large} width="400" height="500">
                                     </div>`;
      indivisualDetails.appendChild(this.detailsOfMovies(item))  
      const container = document.querySelector(".container");
      this.slider.style.display = "none";
      container.innerHTML = "";
      container.style.display = "block";
      container.appendChild(indivisualDetails);                               
  }

  createSliderElements() {
    const slideDiv = document.createElement("div");
    slideDiv.classList.add("slideDiv");
    const crousel = document.createElement("div");
    crousel.classList.add("crousel");
    for (let i = 0; i < 5; i++) {
      crousel.innerHTML += `<div class="movieSlide">${i}</div>`;
      slideDiv.innerHTML += `<div class="pointers"></div>`;
    }
    
    this.sliderMoviesDetails(this.data,crousel);
    this.slider.appendChild(crousel);
    this.slider.appendChild(slideDiv);
  }

  sliderMoviesDetails(data,crousel){
    data.forEach((item, index) => {
      const movieElements = crousel.querySelectorAll(".movieSlide");
      if (movieElements[index]) {
        movieElements[index].style.backgroundImage = `url(${item.image_large})`;
        movieElements[index].appendChild(this.detailsOfMovies(item));
      }
    });
  }

  detailsOfMovies(item){
     const detailsOfMovies = document.createElement("div");
     detailsOfMovies.classList.add("detailsOfMovies");
     detailsOfMovies.innerHTML = `<h2>${item.title}</h2>
                                  <p>${item.plot}</p>
                                  <div class = "additionalDetails">
                                        <div><strong>Genre:</strong>${item.genre.join(" ,")}</div>
                                        <div><strong>Duration:</strong> ${item.runtime}</div>
                                        <div><strong>IMDB:</strong> ${item.rating.star}</div>
                                        <div><strong>Release:</strong> ${item.date.split("-")[0]}</div>
                                  </div>`;
     return detailsOfMovies;                             
  }

  handlePointerClick(index) {
    const crousel = document.querySelector(".crousel");
    crousel.style.animation = "none";
    console.log("Clicked dot with index:", index);
    crousel.style.transform = `translateX(-${index * 20}%)`;
    requestAnimationFrame(() => {
      setTimeout(() => {
        crousel.style.animation = "slideAnimation 15s infinite linear";
      }, 1500); 
    });
  }

  bindPointerClickEvent() {
    const pointer = document.querySelectorAll(".pointers");
    console.log(pointer)
    pointer.forEach((item, index) => {
      console.log(item, index);
      item.addEventListener("click", () => {
        this.handlePointerClick(index);
      });
    });
  }

}