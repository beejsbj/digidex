import express from "express";
import monsters from "./digidex.json" assert { type: "json" };

const app = express();
const PORT = 1986;
app.listen(PORT, function () {
	console.log("listening to port");
});

// app.view("view engine", "ejs"); WRONG
app.set("view engine", "ejs");
app.use(express.static("styles"));
app.use(express.static("images"));


app.get("/", function (request, response) {
	// response.render('partials/menu'); doesnt work
	response.render("pages/home");
});

app.get("/monsters", function (request, response) {
	response.render("pages/monsters-list/monsters-list", { monsters });
});

app.get("/monsters/:name", function (request, response) {
	let monster = monsters.find(function (monster) {
		return monster.name.toLowerCase() == request.params.name.toLowerCase();
	});
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

function findDigimon(id) {
	return monsters.find(function (monster) {
		return monster.id == id || monster.name.toLowerCase() == id;
	});
}
