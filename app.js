import express from "express";
import monsters from "./digidex.json" assert { type: "json" };
import * as prismicH from "@prismicio/helpers";
import { client } from "./config/prismicConfig.js";

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
	next();
});

app.get("/", async function (request, response) {
	const homeData = await client.getByUID("page", "home");
	const data = homeData.data;
	response.render("pages/home", { data });
});

// digimon api
app.get("/monsters/:page", function (request, response) {
	let start = request.params.page * 20
	let end = start + 20;
	response.render("pages/monsters-list/monsters-list", {
		monsters: monsters.slice(start, end),
		page: Number(request.params.page),
	});
});

app.get("/monster/:name", function (request, response) {
	const monster = findDigimon(request.params.name.toLowerCase());
	response.render(
				"pages/monster-detail/monster-detail",
				{ monsters, monster }
			);
});

// prismic data
app.get("/digis", async function (request, response) {
	const digis = await client.getAllByType("monster-card");
	response.render("digis", { monsters: digis });
});

app.get("/digi/:slug", async function (request, response) {
	const monster = await client.getByUID("monster-card", request.params.slug);
	response.render("digi", { monster: monster.data });
});

//page not found
app.use(function (request, response) {
	response.status(404).render("pages/404", { query: request.url });
});

function findDigimon(id) {
	return monsters.find(function (monster) {
		return monster.id == id || monster.name.toLowerCase() == id;
	});
}
