const express = require('express');
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const port = process.env.PORT || 5000;

const app = express();

require('./src/db/conn');

const User = require('./src/models/user');
const auth = require('./src/middlewars/auth');

const static_path = path.join(__dirname, "./public")
const templates_path = path.join(__dirname, "./templates/views")
const partials_path = path.join(__dirname, "./templates/partials")

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(static_path))
app.set('view engine', 'hbs');
app.set('views', templates_path);
hbs.registerPartials(partials_path)


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/secret',auth, (req, res) => {
    //console.log(`Cookie is : ${req.cookies.jwt}`);
    res.render('secret');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/logout',auth, async (req, res) => {
    try {
        //req.user.tokens = req.user.tokens.filter((curElem) => {
        //    return curElem.token !== req.token;
        //})
        req.user.tokens = [];
        res.clearCookie('jwt');
        await req.user.save();
        res.render('login');
    } catch (error) {
        console.log(error);
    }
})

app.post('/register', async (req, res) => {
    const { name, email, password, cpassword } = req.body;
    if (!name || !email || !password || !cpassword) {
        res.status(422).json({ error: 'Fill all the details' });
    }
    try {
        if (password !== cpassword) {
            res.status(422).json({ error: 'Password mismatch' });
        }
        else {
            const newUser = new User({ name, email, password, cpassword });
            const token = await newUser.generateToken();
            const addUser = await newUser.save();
            res.status(201).render('login');

        }
    } catch (error) {
        console.log(error);
    }
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(422).json({ error: 'Fill all details' });
    }
    try {
        const isExist = await User.findOne({ email: email });
        if (isExist) {
            const isMatch = await bcrypt.compare(password, isExist.password);
            if (isMatch) {
                const token = await isExist.generateToken();
                res.cookie('jwt', token, {
                    expires: new Date(Date.now() + 100000),
                    httpOnly: true
                });
                res.status(201).render('index');
            }
            else {
                res.status(422).json({ error: 'Wrong credintionals' });
            }
        }

        else {
            res.status(422).json({ error: 'User does not exist! Try register' });
        }
    } catch (error) {
        console.log(error);
    }
})

app.get('/Login', (req, res) => {
    res.render('login');
});

app.listen(port, () => {
    console.log(`Server has started at ${port}`);
});