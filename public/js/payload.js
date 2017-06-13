var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var ejs = require('ejs');
var url = require('url');

// The given information (expect this to be a api or query from database)
var payload = {
    "members": [
        {
            "email": "example@gmail.com",
            "name": "Jackie",
            "team": "engineering"
        },
        {
            "email": "kkwokwai22@gmail.com",
            "name": "Rohit",
            "team": "finance"
        },
        {
            "email": "example@hotmail.com",
            "name": "Maria",
            "team": "operations"
        },
        {
            "email": "example@gmail.com",
            "name": "General",
            "team": ""
        },
        {
            "email": "example@gmail.com",
            "name": "Jackie",
            "team": "engineering"
        }
    ],

    "restaurant": {
        "logo": "https://s3-media2.fl.yelpcdn.com/bphoto/F_dgemfinYzY9nrZ_xfeGw/o.jpg",
        "name": "Tony’s Pizza Napoletana",
        "yelp_link": "https://www.yelp.com/biz/tonys-pizza-napoletana-san-francisco?osq=best+pizza"
    }
}


// targeting information for specific team member
var teamDetails =  {
    "operations": {
        'backgroundImage': "http://www.channel4.com/explore/surgerylive/images/team2.jpg",
        'description': 'Operations is the best wow!! '
    },
    "finance": {
        'backgroundImage':'https://www.western.edu/sites/default/files/finance_header2.jpg',
        'description': 'hey finance people thank you for always keeping us safe'
    },
    "engineering": {
        'backgroundImage':'https://engineeringinterviewquestions.com/wp-content/uploads/2016/01/engineering-qa.jpg',
        'description': 'you are in the engineering team please teach me to solve better problem'
    },
    'general': {
        'backgroundImage': 'http://www.kcc.edu/campaigns/PublishingImages/poh.jpg'
    }
}

// ---------------------------------

/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index.ejs', {info: payload})
});


// hitting this route will invoker the sendEmailTemplate function with the given payload
app.get('/sendEmail', function(req, res, next) {

    sendEmailTemplate(payload, function(err) {
        if(err) {
            console.log(err)
        } 
    });
    res.send('Email Send!!')
});

app.get('/voteUserData', function(req, res, next){

    console.log(req.query)

    var userDataScore = req.query.pizzaScore
    var user = req.query.member

    console.log(userDataScore);
    console.log(user); 
});

// The sendEmailTemplate function is use for sending Email base on the given payload
function sendEmailTemplate(informationOfMember, callback) {
    
    // if payload not given function will exit
    if(!informationOfMember) {
        return;
    }

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'prompttesting@gmail.com',
            pass: 'testing111'
        }
    });

    // given the varaible member to shorten object informationOfMember
    var members = informationOfMember.members
    // given the varaible restaurant to shorten object informationOfMember
    var restaurant = informationOfMember.restaurant
    // Loop through the payload and send email
    for(let i = 0; i < members.length; i++) {
        // check the condition of each email recipent and give them a different background to attract them 
        var specificTeam = null
        var member = members[i];
        if(member.team === 'operations') {
            specificTeam = teamDetails.operations.backgroundImage
        } else if (member.team === 'engineering') {
            specificTeam = teamDetails.engineering.backgroundImage
        } else if (member.team === 'finance') {
            specificTeam = teamDetails.finance.backgroundImage 
        } else {
            specificTeam = teamDetails.general.backgroundImage
        }

        // The ejs (data) to send to email 
        ejs.renderFile('./views/index.ejs',
            {
            user: member.name,
            title:'Rating Pizza', 
            restaurantName: restaurant.name, 
            restaurantLogo: restaurant.logo,
            restaurantLink: restaurant.yelp_link,
            backgroundImage: specificTeam,
            team: member.team
            }, 
            // callback (making sure the ejs finish rendering the info and then send down as data)
            function(err, data) {
                if(err) {
                    console.log(err);
                } else {
                    // final set up of email data before sending out
                    let mailOptions = { 
                        from: '"Kevin Wong 👻" <prompttesting@gmail.com>', // sender address
                        to: member.email, // list of receivers
                        subject: 'Thank you for joining us Friday ', // Subject line
                        text: 'Testing with Kevin!', // plain text body
                        html: data// html body
                    };

                    // sending out the email
                    transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message %s sent: %s', info.messageId, info.response);
                });
            }
        })
    }
}



