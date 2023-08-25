
import'./index.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

import { fetchDataFromUrl } from './model.js';

import { HeaderController } from './headerController';
import{MoviesRenderer} from "./movieView"
// import {Top10MovieRecomendations} from './top10.js'

async function processDataFunction() {
  const finalData = await fetchDataFromUrl(
    "https://imdb-api.projects.thetuhin.com/user/ur82525142/ratings"
  );
  console.log(finalData, "==============>");

 

  const headerController = new HeaderController(finalData);
  headerController.init();

  const movieRender = new MoviesRenderer(finalData);
  movieRender.MoviesinSlider(finalData)
}


processDataFunction();
