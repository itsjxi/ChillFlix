import { GenreCounter } from "./controller";
import{GenreBasedDistribution} from "./genreandSearchbasedDistribution";
import{MoviesRenderer} from "./movieView"
import {HeaderRenderer} from './headerRender'

export class HeaderController{
    constructor(data){
        this.data = data;
        this.headerRenderer = new HeaderRenderer(this.data);
        this.headerRenderer.renderHeader();
        this.genreCounter = new GenreCounter(this.data);
        this.genreBasedData = new GenreBasedDistribution(this.data)
        this.header = document.querySelector(".header");
        this.headerContent = document.querySelector(".headerContent")
        this.genreList = document.querySelector(".genre");
        this.listOfGenre = document.querySelector("ul");
        // this.searchButton = this.header.querySelector(".header button");
        // this.movieInput = this.header.querySelector(".header input");
        this.container = document.querySelector(".container")
        this.slider =  document.querySelector(".slider")
        this.movieRender = new MoviesRenderer(this.data);
        this.Top10 = document.querySelector(".Top10");
        this.searchIcon = document.querySelector(".searchIcon");
        this.searchMovie = this.header.querySelector(".search");
        this.burger = document.querySelector(".burger");
        this.hamburger = document.querySelector(".hamburgerMenu")
        this.searchDiv = document.querySelector(".searchDiv")
        
    
        
    }
    init(){
        this.bindGenreToggleEvent();
        this.searchButton = this.header.querySelector(".header button");
        this.movieInput = this.header.querySelector(".header input");
        this.bindEventOnHamburger(this.header,this.headerContent)
        this.bindSearchButtonEvent(this.searchButton, this.movieInput);
        this.top10Movies()
        
    }
    top10Movies(){
       let topRated = this.data.slice();
        topRated.sort((a,b) => b.rating.star - a.rating.star);

        const topRatedMovies = this.data.slice(0,10);
       
        this.topMoviesRendering(topRatedMovies)
      }

      topMoviesRendering(data){
        this.Top10.addEventListener("click",()=>{
            this.container.innerHTML = ""
            this.container.style.display = "grid"
            this.slider.style.display = "none";
            const movieRender = new MoviesRenderer(data);
            movieRender.renderMovies(data); 
            movieRender.bindEventOnIndividualMovies(data);      
        })
      }

    bindGenreToggleEvent() {
        const genreCount = this.genreCounter.getGenreCount();    
        console.log(genreCount)
        console.log(this.genreList.querySelector("span"))
        this.genreList.querySelector("span").addEventListener("click", () => {
          this.toggleGenereSapn(this.genreList, this.listOfGenre, genreCount);
        
        });
      }

      toggleGenereSapn(genreList,listOfGenre,genreCount){
        if (!listOfGenre.hasChildNodes()) {
          genreList.querySelector("i").className = "fa fa-angle-up"
          for (const key in genreCount) {
            listOfGenre.innerHTML += `<li>${key}</li>`;         
          }
          genreList.appendChild(listOfGenre);
        } else {
          genreList.querySelector("i").className = "fa fa-angle-down"
          listOfGenre.innerHTML = "";
        }  
        const genre = listOfGenre.querySelectorAll("li")
         this.genreBasedData.genreListBasedData(genre,this.data)  
    }

    bindSearchButtonEvent(searchButton,movieInput) {
        console.log(this.searchButton)
        searchButton.addEventListener("click", (event) => {
            this.genreBasedData.searchBasedData(searchButton, movieInput);
      
            slider.style.display = "none";
        });
    
        movieInput.addEventListener("keydown", (event)=>{
          if (event.keyCode === 13 || event.key === 'Enter') {
          this.genreBasedData.searchBasedData(searchButton,movieInput);
          this.container.style.display = "grid";
          this.slider.style.display = "none";  
          this.movieRender.bindEventOnIndividualMovies(this.data);
          }
        })
    
      }

      bindEventOnHamburger(header,headerContent) {
        const button = this.searchDiv.querySelector(".searchDiv button")
        const input = this.searchDiv.querySelector(".searchDiv input")
        this.searchIcon.addEventListener("click", (event) => {
            console.log(this.searchButton)
            this.bindSearchButtonEvent(button,input)
          if(this.searchDiv.style.display === "none"){
             
            this.searchDiv.style.display = "block"
           
          } else{
            this.searchDiv.style.display = "none"          }
        });
        
        this.burger.addEventListener("click",()=>{
          if(this.headerContent.style.display === "none"){
            headerContent.style.display = "flex";
          } else{
            headerContent.appendChild(this.searchMovie)
            headerContent.style.display = "none"
          }
        })
    
      }


}