import express from "express";
import monsters from "./digidex.json" assert { type: "json" };
import * as prismicH from '@prismicio/helpers';
import { client } from './config/prismicConfig.js';


const app = express();
const PORT = 1986;
app.listen(PORT, function () {
	console.log("listening to port");
});


// app.view("view engine", "ejs"); WRONG
app.set("view engine", "ejs");
app.use(express.static("styles"));
app.use(express.static("images"));

// Add a middleware function that runs on every route. It will inject 
// the prismic context to the locals so that we can access these in 
// our templates.
app.use((request, response, next) => {
  response.locals.get = prismicH;
  next()
})





app.get("/", async function (request, response) {
	const homeData = await client.getByUID('page', 'home')
	const data = homeData.data;
	response.render("pages/home", { data });
});

// digimon api
app.get("/monsters", async function (request, response) {
	const monstersData = await fetch(`https://www.digi-api.com/api/v1/digimon?pageSize=20`)
	let monsters = await monstersData.json();
	monsters = monsters.content;
	response.render("pages/monsters-list/monsters-list", { monsters });
});

app.get("/monsters/:name", async function (request, response) {
	const monsterData = await fetch(`https://www.digi-api.com/api/v1/digimon/${request.params.name}`)
	const monster = await monsterData.json();
	response.render("pages/monster-detail/monster-detail", { monsters, monster });
});

// prismic data
app.get( "/digis", async function( request, response ) {
	const digis = await client.getAllByType('monster-card');
	response.render("digis", { monsters: digis });
})

app.get("/digi/:slug", async function( request, response ){
	const monster = await client.getByUID('monster-card', request.params.slug);
	response.render("digi", { monster: monster.data });

});



//page not found
app.use(function (request, response) {
	response.status(404).render("pages/404", { query: request.url });
});

