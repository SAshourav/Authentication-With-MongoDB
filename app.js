const express = require('express')
const bcrypt = require('bcrypt')
const app = express()
const userModel = require("./models/user")
const jwt = require('jsonwebtoken')

const path = require('path')
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.render("index")
})

app.post('/create', (req, res) => {
    let {username, email, password, age} = req.body

    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async(err, hash)=>{
            let createUser = await userModel.create({
                username,
                email,
                password: hash,
                age
            })

            let token = jwt.sign({email}, "shhh")
            res.cookie("token", token)

            res.send(createUser)
        })
    })

    
})

app.get("/login", (req, res)=>{
    res.render('login')
})

app.post("/login", async (req, res)=>{
    let user = await userModel.findOne({email: req.body.email})
    if(!user){
        console.log("you can't login")
        res.redirect('/login')
    }else{
        console.log(user.password)
        bcrypt.compare(req.body.password, user.password, function(err, result){
            if(result){
                let token = jwt.sign({email: user.email}, "shhh")
                res.cookie("token", token)
                res.redirect('/')
            }else{
                console.log("you can't login")
                res.redirect('/login')
            }
        })
    }
})

app.get("/logout", (req, res)=>{
    res.cookie("token", "")
    res.redirect('/')
})

app.listen(3000)