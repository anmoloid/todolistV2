//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose")
const lodash=require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-anmol:anmol3478@cluster0.76rfaqi.mongodb.net/itemsdb?retryWrites=true&w=majority",{useNewUrlParser:true});

const itemsSchema = new mongoose.Schema({
  name: {
    type: String
  },
  listType:{
    type:String
  }
})

const Item = new mongoose.model("Item",itemsSchema)

const item1=new Item({
  name: "Welcome to my to-do list App!"
})

const item2=new Item({
  name: "Click on + to add a new item"
})

const item3=new Item({
  name: "<--- Click the checkbox to delete an item "
})

const defaultItems=[item1, item2, item3]

const listSchema = new mongoose.Schema( {
  name: String,
  itemList: [itemsSchema]
})

const List=new mongoose.model("List",listSchema)


app.get("/", function(req, res) {

  Item.find({})
  .then(function(items){

    if(items.length === 0)
    {
      Item.insertMany(defaultItems)
      res.redirect("/")
    }
    else {
      const day = date.getDate();
      res.render("list", {listTitle: day, newListItems: items });
    }
  });
  })

  
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const itemNew= new Item({
       name: itemName
  })
  const day = date.getDate();
  if(listName === day){
    Item.create(itemNew)
    res.redirect("/")
  }
  else{
    List.findOne({name:listName}).then(function(results){
      results.itemList.push(itemNew)
      results.save().then(function(results){})
      res.redirect("/"+listName)
    })
   
  }
  
});
app.post("/delete",function(req,res){
  const itemIdForRemoval=req.body.checkbox
  const listName= req.body.listName
  const day = date.getDate();
  if(listName === day){
    Item.findOneAndRemove({_id:itemIdForRemoval}).then(function(results){})
    res.redirect("/")
  }
  else{
    
      List.findOneAndUpdate(
        {name: listName},
// $pull operator removes from an existing array all instances of a value or values that match a specified condition.
        {$pull:{itemList:{_id:itemIdForRemoval}}}
      ).then(function(results){
        res.redirect("/"+listName)
      })
    
  }
 
})

app.get("/:customListName", function(req,res){
  const customListName=lodash.capitalize(req.params.customListName)
  List.findOne({name: customListName}).then(function(results){
    if(results === null)
    {
      const list=new List({
        name: customListName,
        itemList: defaultItems 
      })
      List.create(list)
      res.redirect("/"+customListName)
    }
    else 
    res.render("list", {listTitle: results.name, newListItems: results.itemList });
    
  })
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
