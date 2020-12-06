const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const db = require(path.join(__dirname, "/modules/dbModule"));

const HTTP_PORT = process.env.PORT || 8080;

app.engine(".hbs", exphbs({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
            '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}))

app.set("view engine", ".hbs");

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ 
    extended: true
})); 

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

/* ***** views ***** */
app.get("/", (req,res) => {
    res.render("home");
}); 


app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

app.listen(HTTP_PORT, ()=>{
    console.log("listening on: " + HTTP_PORT);}
);
