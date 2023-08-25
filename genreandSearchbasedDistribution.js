import{MoviesRenderer} from "./movieView"


export class GenreBasedDistribution{
    constructor(data){
      this.data = data;
      this.container = document.querySelector(".container");
      this.genreList = document.querySelector(".genre");
      this.movieRender = new MoviesRenderer(this.data);
      this.listOfGenre = this.genreList.querySelector("ul");
    }

    genreListBasedData(genre,data){
      genre.forEach((item) =>{ 
        console.log(item)
        const slider =  document.querySelector(".slider")
        item.addEventListener("click" ,()=>{
          slider.style.display = "none";
          console.log(item)
          this.container.style.display = "grid";
          this.genreTypeRendering(item)
          this.movieRender.bindEventOnIndividualMovies(data);
        }) 
      })
    }
  
    genreTypeRendering(item ){
      const clickedGenre = item.innerText;
      console.log(this.data)
      const filteredMoviesData = this.data.filter(function(movie) {
        return movie.genre.includes(clickedGenre);
      });
      
      this.listOfGenre.innerHTML = "";
      console.log(filteredMoviesData)
      this.commonFunction(filteredMoviesData)
    }
  
    commonFunction(data){
        this.container.innerHTML = "";
        this.movieRender.renderMovies(data);
    }
  
    searchBasedData(searchButton,movieInput){
        let searchName = movieInput.value.trim();
        console.log(searchName)
        searchName = searchName[0].toUpperCase() + searchName.slice(1);
        movieInput.value = ""
        console.log(searchName)
        const filteredMoviesData = this.data.filter(function(movie) {
          let movieTitle = movie.title.toUpperCase() 
          return movie.genre.includes(searchName) || movieTitle.includes(searchName.toUpperCase());
        });
        console.log(filteredMoviesData)
        this.commonFunction(filteredMoviesData)
    }
  
  }
  