const express = require('express');
const pino = require('express-pino-logger')();

const app = express();
const cors = require('cors');
const fs = require('fs');
app.use(cors());
app.use(require("body-parser").json());
app.use(pino);

app.use(function (req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req,res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(400);
    res.send(JSON.stringify({response:"Bad Request"}))
});

// save a JSON Serialisation
app.post('/serialisation/save', (req,res) => {

   //file name is current date time
    let date = new Date(Date.now());
    let weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    let dateString = weekday[date.getDay()] + ' ' + date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear() + ' ' + date.getHours() + '.' + date.getMinutes() + ' ' + date.getSeconds() + '.'+ date.getMilliseconds();

    let filePath = __dirname.substring(0,__dirname.length-7) + '/public/saves/' + dateString + '.json';
    let content = JSON.stringify(req.body);

    //write json to file
    fs.writeFile(filePath,content,function (error) {

        //return in the response whether saving was successful
        res.setHeader('Content-Type', 'application/json');
        if(!error) {
            console.log("File write successful");
            res.status(200);
            res.send(JSON.stringify({success:true}));
        }else{
            res.status(500);
            res.send(JSON.stringify({success:false}));
        }


    })

});

app.listen(8080, () =>
    console.log('Express server is running on localhost:8080')
);