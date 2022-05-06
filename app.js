const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const port = process.env.port || 3000;

const fileStorage = multer.diskStorage({ /** File upload storage */
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalnamenew + '-' + new Date().getTime());
    }
  });

const fileFilter = (req, file, cb) => {   /** File mime filter */
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
    next();
})
app.use('/user',require(__dirname + '/routes/auth'));
app.use('/feed',require(__dirname + '/routes/feed'));

app.use((error,req,res,next)=>{
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message:message});

})

const server = app.listen(port,()=>{
    console.log('Server connected at ',server.address().port);
})