var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var AllTokens = require('./TokenData.json');
const { nextTick } = require('process');

var app = express();
var port = process.env.PORT || 3000;

app.engine('handlebars', exphbs.engine({ defaultLayout: null}))
app.set('view engine', 'handlebars')

app.use(express.static('public'));


app.get('*', function (req, res) { 
  
    if(AllTokens) {
      res.status(200).render('Tokens', {
        AllTokens
      }) //added curly braces because it won't render without it
    }
  
    else{
      res.status(404).end
    }
  
})

app.listen(port, function () {
    console.log("== Server is listening on port", port);
});

