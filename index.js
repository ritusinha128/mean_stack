/*var express = require('express');
var path = require('path');
var bodyParser = require('body-parser'); 
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect("mongodb://127.0.0.1/research", function(err,client){
  if (!err) {
    var db = client.db('research');
    console.log("Connected to MongoDB");
  
var app = express();
app.use(express.urlencoded())
app.use(express.static('public'));
app.use(bodyParser.json())
const port = 5000;*/

//app.use(express.static(path.join(__dirname, 'public')));

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');var ejs = require('ejs');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const app = express();
const port = 3000;

    app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    /** Serving from the same express Server
    No cors required */
app.use(express.urlencoded());
app.use(express.static('public'));
app.use(bodyParser.json());  

    /*var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/');
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
        }
    });*/
	
//const mongoURI = 'mongodb://172.25.0.2:27017/research';
//const mongoURI = 'mongodb://' + process.env.MONGO_PORT_27017_TCP_ADDR+':'+process.env.MONGO_PORT_27017_TCP_PORT+'/research';
const mongoURI = 'mongodb://database/research';
// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

	

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      /*crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }*/
        //const filename = buf.toString('hex') + path.extname(file.originalname);
		const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads' 
        };
        resolve(fileInfo);
      });
    }
  }
);

    var upload = multer({ //multer settings
                    storage: storage
                }).single('file');


//---------------------------------------------------------------

app.get('/', function(req,res){
  //res.sendFile( __dirname + '/public/index.html');
  console.log(process.env.MONGO_PORT_27017_TCP_ADDR+':'+process.env.MONGO_PORT_27017_TCP_PORT);
  conn.collection ('publication').find().limit(2).toArray(
 		function(err , i){
        if (err) return console.log(err)
		console.log (i);
        res.render('index_new.ejs',{carousel_val: i})  
     })
});

app.get('/login', function(req,res){
  res.sendFile( __dirname + '/public/login.html');
});

app.get('/modify', function(req,res){
  //res.sendFile( __dirname + '/public/modify.html');
   conn.collection('publication').find().toArray(
 		function(err , i){
        if (err) return console.log(err)
		//console.log (i);
        res.render('modification.ejs',{employees: i})  
     })
});

app.get('/modify_update', function(req,res){
  //console.log (req.query.fname);
  res.render('modify_update.ejs', {filename : req.query.fname});
});

app.get('/upload', function(req,res){
  res.sendFile( __dirname + '/public/upload.html');
});

app.post('/modify_update_post', function(req,res){
	console.log (req.body);
	conn.collection ('publication').update( {filename:req.body.filename}, {$set:{
		title:req.body.paperTitle,
		authors:req.body.paperAuthors,
		desc:req.body.paperDesc
	}} ,  (err,result) => {
		if(err) 
					{ 
						console.log(err.message); 
						res.send("Duplicate Employee ID")
					} 
					else
					{
                    console.log('Emplyee Inserted');
					/*Sending the respone back to the angular Client */
					res.end("Employee Inserted-->"+JSON.stringify(req.body));
					}
	})
	
});

app.get('/dashboard', function(req,res){
  //res.sendFile( __dirname + '/public/dashboard.html');
  conn.collection('publication').find().toArray(
 		function(err , i){
        if (err) return console.log(err)
		//console.log (i);
		
        res.render('dashboard.ejs',{employees: i})  
     })
});

app.get('/delete', function(req,res){
	let filename = req.query['fname'];
	conn.collection('publication').remove({filename:filename});
	
	gfs.exist({ filename: filename }, (err, file) => {
      if (err ) {
        res.status(404).send('File Not Found');
        return;
      }
      console.log (file);
      gfs.remove({ filename: filename , "root": "uploads"}, (err, gridStore) => {
        if (err) res.status(500).send(err);
        res.redirect('/modify');
      });
    });
});

app.get('/search', function(req,res){
	var rest = String(req.query.val);
	console.log(rest);
	conn.collection('publication').find({$or:[{title:{$regex : rest}}, {authors:{$regex : rest}}, {desc:{$regex : rest}}]}).toArray(
 		function(err , i){
        if (err) return console.log(err)
		//console.log (i);
        res.render('search_results.ejs',{employees: i})  
     })
});

/*app.get ('/download', function (req, res){
	console.log (req.query['name']);
	gfs.exist({filename: req.query['name'],root: 'uploads'}, function (err, file) {
    if (err) return handleError(err);
    if (!file)
        return res.send('Error on the database looking for the file.');
	res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
	
     var readstream = gfs.createReadStream({filename: req.query['name'],root: 'uploads'}).pipe(res);
	readstream.on("error", function(err) { 
        res.end();
    });
    readstream.pipe(res);
});
	
});*/

/*app.get('download', function (req,res){
	let filename = re.query['name'];
	const collection = db.collection('uploads.files');    
    const collectionChunks = db.collection('uploads.chunks');
	collection.find ({filename:filename}).toArray(function(err,docs){
		if(err){        
      return res.render('index', {
       title: 'File error', 
       message: 'Error finding file', 
        error: err.errMsg});      
    }
	if(!docs || docs.length === 0){        
    return res.render('index', {
     title: 'Download Error', 
     message: 'No file found'});      
   }
   else{
	   collectionChunks.find({files_id:docs[0]._id}).sort({n:1}).toArray(function(err, chunks){
		   if(err){            
          return res.render('index', {
           title: 'Download Error', 
           message: 'Error retrieving chunks', 
           error: err.errmsg});          
        }
		  if(!chunks || chunks.length === 0){            
        //No data found            
        return res.render('index', {
           title: 'Download Error', 
           message: 'No data found'});          
      }
	     let fileData = [];          
    for(let i=0; i<chunks.length;i++){            
      //This is in Binary JSON or BSON format, which is stored               
      //in fileData array in base64 endocoded string format               
     
      fileData.push(chunks[i].data.toString('base64'));          
    }
	let finalFile = 'data:' + docs[0].contentType + ';base64,' 
          + fileData.join(''); 
		 res.render('imageView', {
         title: 'Image File', 
         message: 'Image loaded from MongoDB GridFS', 
         imgurl: finalFile});
	   });
   }
   
	});
});



pp.post('/upload', function(req,res){
  console.log(req.body);
  res.setHeader('Content-Type', 'text/html');
  req.body.serverMessage = "NodeJS replying to angular";
  var pT = req.body.paperTitle;
  var pA = req.body.paperAuthors;
  var pD = req.body.paperDesc;
  //console.log("Sent data are (POST): Employee ID :"+req.body.name+" Employee Name="+req.body.age);
  db.collection('papers').insertOne({paperTitle:pT,paperAuthors:pA, paperDesc:pD}, (err, result) => {                       
                    if(err) 
					{ 
						console.log(err.message); 
						res.send("Duplicate Employee ID")
					} 
					else
					{
                    console.log('Publication Inserted');
					/*Sending the respone back to the angular Client 
					res.end("Publication Inserted-->"+JSON.stringify(req.body));
					}
                })    
});*/

app.get ('/download', function(req, res){
	let filename = req.query['name'];
	gfs.exist({ filename: filename }, (err, file) => {
            if (err ) {
                res.status(404).send('File Not Found');
        return
            } 
			
      
      var readstream = gfs.createReadStream({ filename: filename });
	  //console.log(readstream);
      readstream.pipe(res);            
        });
});

app.post('/upload', function(req, res) {
		console.log (req.body);
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
             res.json({error_code:0,err_desc:null});
        });
    });
	
	app.post('/upload_meta', function(req,res){
		conn.collection('publication').insertOne({title:req.body.title,authors:req.body.authors, desc:req.body.desc, filename:req.body.filename}, (err, result) => {                       
                    if(err) 
					{ 
						console.log(err.message); 
						res.send("Duplicate Employee ID")
					} 
					else
					{
                    console.log('Emplyee Inserted');
					/*Sending the respone back to the angular Client */
					res.end("Employee Inserted-->"+JSON.stringify(req.body));
					}
                })     
	});




/*app.listen(port, ()=>{
  console.log("Server started at " + port);
});
      } else {
    console.log("ERROR connecting to MongoDB")
  }
})*/

 app.listen('3000', function(){
        console.log('running on 3000...');
    });
