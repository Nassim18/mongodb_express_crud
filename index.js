require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const userModel = require('./models/users');

app.use(cors());
app.use(bodyparser.json());

// connect database

mongoose.connect(process.env.mongodburl,{useNewUrlParser:true},(err)=>{
    if(err)
    {
        console.log('connection failed ... ',err);
    }
    else
    {
        console.log('db connection success ... ');
    }
        
});


// save or create data

app.post('/', async (req,res)=>{
    console.log(req.body,'Trying to add new data');

    const chkdataexit = await userModel.findOne({$or:[{uemail:req.body.email},{umobile:req.body.mobile}]});
    
    if(chkdataexit)
    {
        if(chkdataexit.uemail == req.body.email)
        {
            res.send({
                msg:"email id already exists"
            })
        }
        else
        {
            res.send({
                msg:"mobile number already exists"
            })
        }
    }
    else
    {
        // save db
        const data = new userModel(
            {
                uname:req.body.name,
                uemail:req.body.email,
                umobile:req.body.mobile
            }
        );
    
        data.save((err,result)=>{
            if(err)
            {
                console.log('create db failed',err);
            }
            else
            {
                res.send({
                    msg:'data created',
                    data:result
                });
    
            }
        });
    }

   
});


// read all data

app.get('/', async (req,res)=>{
    
    console.log('getdata');
    const data = await userModel.find().sort({uname:1});

    if(data)
    {
        res.send({
            msg:"all users data",
            result:data
        });
    }
    else
    {
        res.send({
            msg:"no data"
        });
    }
});

// get data by id 

app.get('/:id', async (req,res)=>{
    
    console.log(req.params.id,'ids');

    if(req.params.id)
    {
        const chkid = mongoose.isValidObjectId(req.params.id);
        if(chkid === true)
        {
            const iddata = await userModel.findById({_id:req.params.id});
            if(iddata == null)
            {
                res.send({
                    msg:'single data not found'
                });
            }
            else
            {
                res.send({
                    msg:'single data',
                    result:iddata
                });
            }
        }
        else
        {
            res.send({
                msg:"invalid user id"
            });
        }

        
    }
 
    
});

// delete data 

app.delete('/:id', async (req,res)=>{

    console.log('trying to remove data of',req.params.id);

        const chkvalidid = mongoose.isValidObjectId(req.params.id);
        if(chkvalidid == true)
        {
            const chkexistingid = await userModel.findById({_id:req.params.id});
            if(chkexistingid == null)
            {
                res.send({
                    msg:"valid id but data not found"
                });
            }
            else
            {
                await userModel.deleteOne({_id:req.params.id});
                res.send({
                    msg:"data found and removed"
                });
            }
        }
        else
        {
            res.send({
                msg:"invalid id please enter a valid id"
            });
        }
   
});

// update single data 

app.put('/:id', async (req,res)=>{
    
    console.log('trying to upadate data of',req.params.id);

        const chkvalidid = mongoose.isValidObjectId(req.params.id);
        if(chkvalidid == true)
        {
            const chkexistingid = await userModel.findById({_id:req.params.id});
            if(chkexistingid == null)
            {
                res.send({
                    msg:"valid id but data not found"
                });
            }
            else
            {
                await userModel.updateOne({_id:req.params.id},{$set:{uemail:req.body.email}});
                res.send({
                    msg:"data found and updated"
                });
            }
        }
        else
        {
            res.send({
                msg:"invalid id please enter a valid id"
            });
        }

});

// run server
const PORT = process.env.PORT | 3000;
app.listen(PORT,()=>{
    console.log(`server running ... ${PORT}`);
});


