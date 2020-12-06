// online (heroku) link: https://morning-gorge-15218.herokuapp.com/
// online (heroku) repository: https://git.heroku.com/morning-gorge-15218.git

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

app.get("/employees", (req, res) => {
    if (req.query.department) {
        db.getEmployeesByDepartment(req.query.department)
        .then((data) => {
            if (data.length > 0) {
                res.render("employees", {employees: data});
            } else {
                res.render("employees", {message: "no results"});
            }
        }).catch(() => {
            res.render("employees", {message: "no results"});})
    } else {
        db.getAllEmployees()
        .then((data) => {
            if (data.length > 0) {
                res.render("employees", {employees: data});
            } else {
                res.render("employees", {message: "no results"});
            }}
        ).catch(() => {
            res.render("employees", {message: "no results"});
        })
    }
});

app.get("/employees/add", (req,res)=>{
    db.getDepartments().then((data) => {
        res.render("addEmployee", {departments: data});
    }).catch(() => {
        res.render("addEmployee", {departments: []});
    }) 
}); 

app.post("/employees/add", (req, res)=>{
    db.addEmployee(req.body)
    .then(() => {
        res.redirect("/employees")
    }).catch((err) => {
        res.status(500).send(err);
    })
});

app.get("/employee/:empNum", (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    db.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error
    }).then(db.getDepartments)
    .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"
        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching
        // viewData.departments object
        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
            }
        }
    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
        } else {
            res.render("employee", { viewData: viewData }); // render the "employee" view
        }
    });
});

app.post("/employee/update", (req, res) => {
    db.updateEmployee(req.body)
    .then(() => {res.redirect("/employees");})
    .catch((err) => {
        res.status(500).send(err);
    })
});

app.get("/employees/delete/:empNum", (req, res) => {
    db.deleteEmployeeByNum(req.params.empNum)
    .then(() => {
        res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send(err);
    })
})

app.get("/departments", (req, res) => {
    db.getDepartments()
    .then((data) => {
        if (data.length > 0) {
            res.render("departments", {departments: data});
        } else {
            res.render("departments", {message: "no results"})
    }}).catch(() => {
        res.render("departments", {message: "no results"});
    })
});

app.get("/departments/add", (req,res)=>{
    res.render("addDepartment");
}); 

app.post("/departments/add", (req, res)=>{
    db.addDepartment(req.body)
    .then(() => {
        res.redirect("/departments")
    }).catch((err) => {
        res.status(500).send(err);
    })
});

app.post("/department/update", (req, res) => {
    db.updateDepartment(req.body)
    .then(() => {res.redirect("/departments");})
    .catch((err) => {
        res.status(500).send(err);
    })
});

app.get("/department/:id", (req, res) => {
    db.getDepartmentById(req.params.id)
    .then((data) => {
        if (data) {
            res.render("department", {department: data});
        } else {
            res.status(404).send("Department Not Found");
        }
    }).catch(() => {
        res.render("department", {message: "no result"});
    })
});

app.get("/departments/delete/:id", (req, res) => {
    db.deleteDepartmentById(req.params.id)
    .then(() => {
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send(err);
    })
})

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

db.initialize().then(() => {
    app.listen(HTTP_PORT, ()=>{
        console.log("listening on: " + HTTP_PORT);
    });
}).catch((err) => {
    console.log(err);
})