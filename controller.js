

export class GenreCounter {
    constructor(data) {
      this.data = data;
      this.genreCount = {};
      this.latestMoviesData = {}
      this.initialize();
    }
  
    initialize() {
      try{
      this.data.forEach((item) => {
        item.genre.forEach((genre) => {
          if (this.genreCount[genre]) {
            this.genreCount[genre]++;
          } else {
            this.genreCount[genre] = 1;
          }
        });
      });} catch(error){
        console.error("error");
      }
    }
  
    getGenreCount() {
      return this.genreCount;
    }


  }