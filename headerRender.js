import { GenreCounter } from "./controller";


export class HeaderRenderer {
    constructor(data) {
      this.data = data;
      this.genreCounter = new GenreCounter(this.data);
      this.header = document.querySelector(".header");
    }
  
    renderHeader() {
        const headerContent = document.createElement("div");
        headerContent.classList.add("headerContent");

        this.renderLogo();
        this.header.appendChild(headerContent);
        this.hamburgerMenue();
        
        this.home(headerContent);
        this.genrerenderinng(headerContent);
        this.top10(headerContent)
        this.renderSearch(headerContent);    
    }

    renderLogo(){
        const logo = document.createElement("div")
        logo.classList.add("logo");
        this.header.appendChild(logo)
        logo.textContent = "ChillFlix"
     }


     home(headerContent){
        const home = document.createElement("div");
        home.innerText = "Home";
        home.classList.add("home")
        headerContent.appendChild(home);
        home.addEventListener("click",()=>{
          history.pushState({}, "Home", "/home");
          window.location.reload();
          console.log("New URL:", window.location.href);
        }
        )
    }

    top10(headerContent){
        const Top10 = document.createElement("div");
        Top10.classList.add("Top10");
        Top10.textContent = "Top10";
        headerContent.appendChild(Top10);

    }
  

    hamburgerMenue(){
        const hamburgerMenu = document.createElement("div");
        hamburgerMenu.classList.add("hamburgerMenu");
        hamburgerMenu.innerHTML = `<div class="searchIcon"><i class="fa fa-search"></i></div>
                                    <div class="burger">☰</div>`;                                  
        this.header.appendChild(hamburgerMenu);
        const searchDiv = document.createElement("div");
        searchDiv.classList.add("searchDiv")
        this.header.appendChild(searchDiv);
        this.renderSearch(searchDiv)
      
    }

    genrerenderinng(headerContent){
        const genreList = document.createElement("div");
        genreList.classList.add("genre");
        genreList.innerHTML = `<span>Genre </span><i class='fa fa-angle-down'></i>`; 
        const listOfGenre = document.createElement("ul");
        genreList.appendChild(listOfGenre);
        headerContent.appendChild(genreList);
      }


    renderSearch(headerContent){
        const search = document.createElement("div");
        search.classList.add("search");
        search.innerHTML = `<div class="searchMovie">
                              <button type="submit"><i class="fa fa-search"></i></button>
                              <input type="text" placeholder="Search.." name="search">                         
                            </div>`;
    
        headerContent.appendChild(search);
      }

  
  
  }