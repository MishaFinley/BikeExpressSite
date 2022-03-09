const express = require("express");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session')
const saltRounds = 10;

var url = 'mongodb+srv://ahsim:misha12@cluster0-otacx.mongodb.net/express';
var dbName = 'express';

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connection.on("open", function() {
    console.log("mongoose.conection.open")
});

 
var port = 3000;

const app = express();

app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({extended:true}));
app.use(session({ secret: 'secret', cookie: { maxAge: 60000 }}))


app.get("/", function(req, res){
    var model = {
        username : req.session.username,
        userId : req.session.userId,
        isAdmin : req.session.isAdmin
    }
    res.render("index", model);
    // npm install nodemon -S
    //-g --save
});
app.get("/purchased", function(req, res){

    res.render("purchased");
    // npm install nodemon -S
    //-g --save
});

const Schema = mongoose.Schema;

const FrameSchema = new Schema({
    _id: Number,
    year: Number,
    manufacturer: String,
    model: String,
    price: Number,
    imageUrl: String
});

const GroupSetSchema = new Schema({
    _id: Number,
    manufacturer: String,
    model: String,
    weight: Number,
    price: Number,
    imageUrl: String
});

const ShirtSchema = new Schema({
    _id: Number,
    logo: String,
    manufacturer: String,
    price: Number,
    imageUrl: String
});
const UserSchema = new Schema({
    // _id: Number,
    name: String,
    email: String,
    username: String,
    password: String,
    roles: []
});

const frame = mongoose.model("frame", FrameSchema);
const groupset = mongoose.model("groupset", GroupSetSchema);
const shirt = mongoose.model("shirt", ShirtSchema);
const User = mongoose.model("User", UserSchema);

const collections = []

async function findCollections() {
    collections[0] = await frame.find();
    collections[1] = await groupset.find();
    collections[2] = await shirt.find();
}
findCollections();
app.get("/items", function(req, res){   
    var model = {
            title1: "Frames",
            title2: "Group Sets",
            title3: "Shirts",
            frames: collections[0],
            groupSets: collections[1],
            shirts: collections[2],
            username : req.session.username,
            userId : req.session.userId,
            isAdmin : req.session.isAdmin
    };
        
    res.render("items", model);

    
});
app.get("/new", function(req, res){
    if(req.session.isAdmin){
        var model = {
            title: "New Item",
            title1: "Frame",
            title2: "Group Set",
            title3: "shirt",
            username : req.session.username,
            userId : req.session.userId,
            isAdmin : req.session.isAdmin
        };
        res.render("new", model);
    } else{
        res.redirect("/")
    }
});
app.get("/create/frame", function(req, res){
    doFrame(req.query.year, req.query.manufacturer, req.query.model, req.query.price, req.query.imageUrl);
    var model = {
        frame: collections[0][collections[0].length-1]
    };
    res.render("details", model);

});
app.get("/create/groupset", function(req, res){
    doGroupset(req.query.manufacturer, req.query.model, req.query.weight, req.query.price, req.query.imageUrl);
    var model = {
        groupset: collections[1][collections[1].length-1]
    };
    res.render("details", model);
});
app.get("/create/shirt", function(req, res){
    doShirt(req.query.logo, req.query.manufacturer, req.query.price, req.query.imageUrl);
    var model = {
        shirt: collections[2][collections[2].length-1]
    }
    res.render("details", model);
})


async function doFrame(year, manufacturer, model, price, image){
    await CreateFrame(year, manufacturer, model, price, image);
}
async function doGroupset(manufacturer, model, weight, price, image){
    await CreateGroupset(manufacturer, model, weight, price, image);
}
async function doShirt(logo, manufacturer, price, image){
    await CreateShirt(logo, manufacturer, price, image);
}


async function CreateFrame(year, manufacturer, model, price, image){
    console.log("Creating Frame with year: " + year + ", manufacturer: " + manufacturer + ", model: " + model + ", price: ", + price + ", imageUrl: " + image);

    var newFrame = new frame({_id: collections[0].length + 1, year: year, manufacturer: manufacturer, model: model, price: price, imageUrl: image});

    await newFrame.save();
    collections[0].push(newFrame);
}
async function CreateGroupset(manufacturer, model, weight, price, image){
    console.log("Creating GroupSet with manufacturer: " + manufacturer + ", model: " + model + ", weight:" + weight + ", price: " + price + ", imageUrl: " + image);

    var newGroupset = new groupset({_id: collections[1].length + 1, manufacturer: manufacturer, model: model, weight: weight, price: price, imageUrl: image});

    await newGroupset.save();
    collections[1].push(newGroupset);
}
async function CreateShirt(logo, manufacturer, price, image){
    console.log("Creating Shirt with logo: " + logo + ", manufacturer: " + manufacturer + ", price: " + price + ", image: " + image);

    var newShirt = new shirt({_id: collections[2].length + 1, logo: logo, manufacturer: manufacturer, price: price, imageUrl: image});

    await newShirt.save();
    collections[2].push(newShirt);
}


// Order Form
app.get("/order", function(req,res){
    if(!req.session.username){
        res.redirect("/login");
    }else{
        var model = {
            title1: "Frames",
            title2: "Group Sets",
            title3: "Shirts",
            frames: collections[0],
            groupSets: collections[1],
            shirts: collections[2],
            username : req.session.username,
            userId : req.session.userId,
            isAdmin : req.session.isAdmin
        };
        res.render("order", model);
    }
});
app.get("/order/frame/:frameId", function(req, res){
    var frameId = req.params.frameId;
    console.log(frameId);
    if(!req.session.username){
        res.redirect("/login");
    }else{
        var model = {
            frameId: frameId,
            title1: "Frames",
            title2: "Group Sets",
            title3: "Shirts",
            frames: collections[0],
            groupSets: collections[1],
            shirts: collections[2],
            username : req.session.username,
            userId : req.session.userId,
            isAdmin : req.session.isAdmin
        };
        res.render("order", model);
    }
});
app.get("/order/groupset/:groupsetId", function(req, res){
    var groupsetId = req.params.groupsetId;
    console.log(groupsetId);
    if(!req.session.username){
        res.redirect("/login");
    }else{
        var model = {
            groupsetId: groupsetId,
            title1: "Frames",
            title2: "Group Sets",
            title3: "Shirts",
            frames: collections[0],
            groupSets: collections[1],
            shirts: collections[2],
            username : req.session.username,
            userId : req.session.userId,
            isAdmin : req.session.isAdmin
        };
        res.render("order", model);
    }
});
app.get("/order/shirt/:shirtId", function(req, res){
    var shirtId = req.params.shirtId;
    console.log(shirtId);
    if(!req.session.username){
        res.redirect("/login");
    }else{
        var model = {
            shirtId: shirtId,
            title1: "Frames",
            title2: "Group Sets",
            title3: "Shirts",
            frames: collections[0],
            groupSets: collections[1],
            shirts: collections[2],
            username : req.session.username,
            userId : req.session.userId,
            isAdmin : req.session.isAdmin
        };
        res.render("order", model);
    }
});
// Item Details

app.get("/frame/detail/:frameId", function(req, res){
    var frameId = req.params.frameId;
    var frameDetail;
    for (item of collections[0]){
        console.log(item);
        if(item._id == frameId){
            frameDetail = item;
        }
    }
    var model = {
        frame: frameDetail,
        username : req.session.username,
        userId : req.session.userId,
        isAdmin : req.session.isAdmin
    };
    console.log(frameDetail);
    res.render("details", model);
});
app.get("/groupset/detail/:groupsetId", function(req, res){
    var groupsetId = req.params.groupsetId;
    var groupsetDetail;
    for (item of collections[1]){
        console.log(item);
        if(item._id == groupsetId){
            groupsetDetail = item;
        }
    }
    var model = {
        groupset: groupsetDetail,
        username : req.session.username,
        userId : req.session.userId,
        isAdmin : req.session.isAdmin
    };
    console.log(groupsetDetail);
    res.render("details", model);
});
app.get("/shirt/detail/:shirtId", function(req, res){
    var shirtId = req.params.shirtId;
    var shirtDetail;
    for (item of collections[2]){
        console.log(item);
        if(item._id == shirtId){
            shirtDetail = item;
        }
    }
    var model = {
        shirt: shirtDetail,
        username : req.session.username,
        userId : req.session.userId,
        isAdmin : req.session.isAdmin
    };
    console.log(shirtDetail);
    res.render("details", model);
});

app.get("/register", function(req, res){
    var model = {
        title: "Register a New Account",
        username : req.session.username,
        userId : req.session.userId,
        isAdmin : req.session.isAdmin
    }

    res.render("register", model);
});
app.post("/register", function (req, res) {
    console.log(req)
    var password = req.body.password;
    bcrypt.hash(password, saltRounds, function(err, hash) {
        var newUser = new User(
            {
                // _id: mongoose.Types.ObjectId(),
                name: req.body.name,
                email: req.body.email,
                username: req.body.username,
                password: hash,
                roles: ["User"]
            }
        );
        newUser.save();
    });  
    res.redirect("/login")
});      

app.get("/login", function(req, res){
    var model = {
        title: "Login",
        message: "",
        username : req.session.username,
        userId : req.session.userId,
        isAdmin : req.session.isAdmin
    };
    res.render("login", model);
}); 

app.post("/login",
    async function (req, res) {
        // console.log(req.session)
        var user = await User.findOne({username:req.body.username});
        var valid = false;
        var valid = false;
        if(user){
            valid = await bcrypt.compare(req.body.password, user.password);
        }

        if(user && valid){
            console.log(user);
            req.session.username = user.username;
            req.session.userId = user._id;
            req.session.isAdmin = user.roles.includes("Admin");

            res.redirect("/items");
        }else{
            req.session.username = null;
            req.session.userId = null;
            req.session.isAdmin = null;

            var model = {
                title : "Login",
                message: "Failed login!"
            }

            res.render("login", model);
        }

        // Can't send back two responses.
        // res.render("/");
    }
);
app.get("/Logout",
    function (req, res) {
        // Need to clear our session logout
        req.session.username = null;
        req.session.userid = null;
        req.session.isAdmin = null;

        res.redirect("/");
    }
);
    

app.listen(port, function(){
    console.log("Express Started and listening on port: " + port);
});