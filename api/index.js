const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const UserModel = require('./models/User.js');
const Place = require("./models/Place.js");
const Booking = require("./models/Booking.js");

const imageDownloader = require('image-downloader') 

require('dotenv').config()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'kdkfahkdfhk23k3j5kj';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/uploads",express.static(__dirname+"/uploads"));




//-------------------------------------------------------USING CORS MIDDLEWARE TO CONNECT FRONTEND AND BACKEND----------------------
app.use(cors({
    credentials:true,
    origin:'http://localhost:3000',
}));

//-----------------------------------------------------MONGGOOSE CONNECTION----------------------------------------------------------

mongoose.connect(
  process.env.MONGO_URL).then(()=>{console.log("connected")}).catch((err)=>console.log(err));

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

//-------------------------------------------------------CHECKING SERVER RUNNING OR NOT--------------------------------------------
app.get('/test',(req,res) =>{
 res.json("test ok");
})
//----------------------------------------------------------------------USER REGISTERATION-------------------------------------------
app.post('/register',  async(req,res)=>{
    const {name,email,password} = req.body;
    try{
const userDoc = await UserModel.create({
  name,
  email,
  password: bcrypt.hashSync(password, bcryptSalt),
});

res.json(userDoc);
    }catch(err){
        res.status(422).json(err);
    }
})


//---------------------------------------------------------------USER LOGIN-------------------------------------------------------------
app.post("/login",async(req,res)=>{
  mongoose.connect(process.env.MONGO_URL);
  const { email, password } = req.body;
  const userDoc = await UserModel.findOne({ email: email });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password); 
    if (passOk) {
      jwt.sign(
        {
          email: userDoc.email,
          id: userDoc._id,
          name: userDoc.name,
        },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie(  "token",token,
              { sameSite: 'none', secure: true }) .json(userDoc);
        });
    } else {
      res.status(422).json("pass not ok");
    }
  } else {
    res.json("not found email");
  }
});


// --------------------------------------------------------USER PROFILE-----------------------------------------------------------------
app.get("/profile",(req,res)=>{
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userdata) => {
      if (err) throw err;
      const { name, email, _id } = await UserModel.findById(userdata.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
})
//--------------------------------------------------- USER LOGOUT ------------------------------------------------------------------------
app.post('/logout',(req,res)=>{
    res.cookie('token','').json(true);
})

app.post('/upload-by-link', async(req,res)=>{
    const{link} =req.body;
    const newName = "photo"+Date.now()+'.jpg';
   await imageDownloader.image({
        url:link,
        dest: __dirname+'/uploads/'+newName,
    })
    res.json( newName);
})

//---------------------------------------------PLACES -------------------------------------------------------------------------
app.post('/places',(req,res)=>{
    const{token} = req.cookies;
    const {title,address,addedPhotos,description,perks,extraInfo,checkIn,checkOut,maxGuests,price} = req.body;
    try{
         jwt.verify(token, jwtSecret, {}, async (err, userdata) => {
           if (err) throw err;
           const placeDoc = await Place.create({
             owner: userdata.id,
             title,
             address,
             photos : addedPhotos,
             description,
             perks,
             extraInfo,
             checkIn,
             checkOut,
             maxGuests,
             price
           });
         res.json(placeDoc);
         });

    }catch(err){
        console.log(err);
    }
});

//----------------------------------------------------------------------USER PLACES--------------------------------------------------
app.get('/user-places',(req,res)=>{
    const {token} = req.cookies;
    jwt.verify( token , jwtSecret, {}, async (err,userData)=>{
        if(err) throw err;
        const {id} = userData;
        res.json( await Place.find({owner:id}));

    })
    })

//----------------------------------------------------------FINDING PLACES BY ID -------------------------------------------------
app.get('/places/:id', async (req,res)=>{
    const {id} = req.params;
    res.json(await Place.findById(id))
});

//------------------------------------------------------UPDATING PLACES-------------------------------------------------------------
app.put('/places',async(req,res)=>{
   const { token } = req.cookies;
   const {  id,
     title ,  address , addedPhotos,
     description , perks, extraInfo,
     checkIn , checkOut ,   maxGuests,price
   } = req.body;
     jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if(err) throw err;
     const placeDoc = await Place.findById(id);
    //  console.log(userData.id);
    //  console.log(placeDoc.owner.toString());
       if(userData.id === placeDoc.owner.toString()){
        placeDoc.set({
             title,
             address,
             photos : addedPhotos,
             description,
             perks,
             extraInfo,
             checkIn,
             checkOut,
             maxGuests,price,
        })
        await placeDoc.save();
        res.json('ok');
       }
     });
})

//-----------------------------------------------------------PLACES(get)-------------------------------------------------------
app.get('/places', async(req,res)=>{
  res.json(await Place.find());
})

//--------------------------------------------------------ADDING BOOKINGS---------------------------------------------------------
app.post('/bookings',async (req,res)=>{
  const userData = await getUserDataFromReq(req);
  const {place,checkIn,checkOut,numberOfGuests,name,phone,price} = req.body;

  Booking.create({
    name, phone, price, numberOfGuests, checkIn, checkOut, place,
    user:userData.id
  }).then((doc)=>{
    res.json(doc);
  }).catch((err)=>{
  throw err;
  })
})

//------------------------------------------------------DISPLAYING BOOKINGS-----------------------------------------------------------
app.get('/bookings', async(req,res)=>{
  const userData =  await  getUserDataFromReq(req);
  res.json( await Booking.find({user:userData.id}).populate('place'));

})
app.listen(4000);