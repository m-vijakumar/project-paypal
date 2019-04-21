const express = require("express");
const ejs =require("ejs");
const paypal =require("paypal-rest-sdk");
const app =express();
const bodyparser=require("body-parser");

const port = process.env.PORT || 5000;
app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AY_8dJeCVGgyZGtsXas9I-79FHGCd4L3cDRu-zhu640PY5lAUVjnySlZLLEB7fkJd7qlKNi9PwbJoQPq',
    'client_secret': 'EDJDbMiBWrxuM7py3DZ70VKXiUoFL_tb2hlQXNWXdrWHOiXg1ivdUJymoib_OSeogyFikywckSbcwZTG'
  });
  var amount=0;

app.get("/",(req,res)=>{

    res.render("index");
})

app.post("/pay",(req,res)=>{

    const amount1 = req.body.payamount;

     amount = parseInt(amount1);
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": `http://localhost:${port}/success`,
            "cancel_url": `http://localhost:${port}/cancel`
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "donation",
                    "sku": "001",
                    "price": amount,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": amount
            },
            "description": "This is the payment description."
        }]
    };

    paypal.payment.create(create_payment_json,  (error, payment)=> {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            for (var index = 0; index < payment.links.length; index++) {
                //Redirect user to this endpoint for redirect url
                    if (payment.links[index].rel === 'approval_url') {
                        res.redirect(payment.links[index].href);
                    }
                }
        }
    });
})

app.get("/success",(req,res)=>{

    const payerid = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
        "payer_id": payerid,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": amount
            }
        }]
    };


    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.send("Thankyou for helping us...");
        }
    });
})

app.get("/cancel",(req,res)=>{

    res.send("Sorry your transction was not done plz try again...");
})

app.listen(port,console.log(`server is running at ${port}`));