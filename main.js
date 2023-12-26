
import'./index.css'

import { fetchDataFromUrl } from './model.js';

import { HeaderController } from './headerController';
import{MoviesRenderer} from "./movieView"
// import {Top10MovieRecomendations} from './top10.js'

async function processDataFunction() {
  const finalData = await fetchDataFromUrl("/movieData.json");
  console.log(finalData, "==============>");

 

  const headerController = new HeaderController(finalData);
  headerController.init();

  const movieRender = new MoviesRenderer(finalData);
  movieRender.MoviesinSlider(finalData)
}


processDataFunction();
