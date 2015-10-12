/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');
var User = Promise.promisifyAll(mongoose.model('User'));
var Story = Promise.promisifyAll(mongoose.model('Story'));
var Page = Promise.promisifyAll(mongoose.model('Page'));

User.remove({}, function(err, removed) {
  if (err) console.log(err);
});

Story.remove({}, function(err, removed) {
  if (err) console.log(err);
});

Page.remove({}, function(err, removed) {
  if (err) console.log(err);
});




var concepts = ['Loops', 'If-statements', 'Functions', 'Recursion', 'Async']
var descr = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad.";
var backgrounds= ['images/space.png', 'images/flower-field.png', 'images/underwater.png'];

var seedStories = function(){
    var titles = ['Happy Dance', 'Omri', 'Joe\'s Salt', 'Adventures of Mark'];
    //var images = ['http://www.smashingmagazine.com/images/book-covers/book-covers-18.jpg', 'https://s-media-cache-ak0.pinimg.com/236x/31/b0/7f/31b07f4c094b63a20fba3d7a3143b69c.jpg', 'https://geekybooksnob.files.wordpress.com/2012/11/200px-life_of_pi_cover.png', 'http://www.adweek.com/galleycat/files/2012/08/8-bit-book-cover-The-Two-Towers.jpg']

    var stories = titles.map(function(title){
        return {
            title: title,
            description: descr,
            difficulty: Math.floor(Math.random()*10),
            concepts: [concepts[Math.floor(Math.random()*concepts.length)]],
            cover: 'http://www.smashingmagazine.com/images/book-covers/book-covers-18.jpg'
        };
    });


    stories.push({
        title: 'Mopsy and Moopsy',
        description: "Mopsy and Moopsy are in trouble- can you help them?",
        difficulty: 2,
        concepts: ['Loops', 'If-statements'],
        cover: 'http://www.smashingmagazine.com/images/book-covers/book-covers-18.jpg'

    });
     return Story.createAsync(stories);
};

var seedPages = function(stories){
    var pages = [];
    stories.forEach(function(story){
        if(story.title==='Jerry the Super Giraffe'){
            pages.push({
                story: story._id,
                text:'<p>{{user.character.name}} was sitting at home, enjoying a nice cup of tea, when their super ears perked up- someone was crying for help!  It\'s Moopsy Monkey! </p><p class="promptText"> Can you help {{user.character.name}} find out what\'s wrong?</p>',
                tools: ['ifStatement', 'ask', 'move', 'give'],
                variables: [
                    {text: 'Moopsy Monkey', varType: 'person'},
                    {text: 'What\'s wrong', varType: 'variable'}
                ],
                concepts: ['If-statements'],
                hint: 'Make sure you ask Moopsy what\'s wrong',
                requirements: {Moopsy: {ask:{val: true}}},
                gameboard: [
                    [
                        [],
                        [],
                        [{
                            type: 'Person',
                            name: 'Giraffe2',
                            varName: 'Moopsy_Monkey'
                        }],
                        []
                    ],
                    [
                        [],
                        [],
                        [{
                            type:'Obstacle',
                            name:'Tree1'
                        }],
                        []
                    ],
                    [
                        [],
                        [],
                        [],
                        [{
                            type:'Obstacle',
                            name: 'Tree1'
                        }]
                    ],
                    [
                        [{
                            type: 'Avatar',
                            name:'Giraffe3'
                        }],
                        [],
                        [],
                        []
                    ]
                ],
                pageNumber: 1,
                boardBackground: 'image/flower-field.png'

            },{
                story: story._id,
                text:'<p>"It\'s my brother," said Moopsy. "He\'s crying and I don\'t know what to do!" </p><p>"Don\'t worry Moopsy, I\'ll go see if I can help"</p><p class="promptText">Can you see if Mopsy needs any help?</p>',
                tools: ['ifStatement', 'ask', 'move', 'give'],
                variables: [
                    {text: 'Mopsy Monkey', varType: 'person'},
                    {text: 'Mopsy needs help', varType: 'condition'},
                    {text: 'How can I help?', varType:'variable'}
                ],
                concepts: ['If-statements'],
                hint: 'If Mopsy needs help, ask what you can do!',
                requirements: {Mopsy: {ask:{val: true}}},
                gameboard: [
                    [
                        [],
                        [],
                        [{
                            type: 'Avatar',
                            name: 'Giraffe3'
                        }],
                        []
                    ],
                    [
                        [],
                        [],
                        [{
                            type:'Obstacle',
                            name:'Tree1'
                        }],
                        []
                    ],
                    [
                        [],
                        [],
                        [],
                        [{
                            type:'Obstacle',
                            name: 'Tree1'
                        }]
                    ],
                    [
                        [],
                        [],
                        [],
                        [{
                            type: 'Person',
                            name:'Giraffe2'
                        }]
                    ]
                ],
                pageNumber: 2,
                boardBackground: 'image/flower-field.png'

            },{
                story: story._id,
                text:'<p>"It\'s terrible," sighed Mopsy. "I\'ve dropped my bananas all over the place.  It\'ll take forever to pick them up again!"</p><p>"Not if I can help it!" exclaimed {{user.character.name}}</p><p class="promptText">Can you get all of Mopsy\'s bananas using only 4 tools?</p>',
                tools: ['ifStatement', 'pickUp', 'move', 'forLoop'],
                variables: [
                    {text: 'Banana', varType: 'variable'},
                    {text: 'Apple', varType:'variable'}
                ],
                concepts: ['forLoop'],
                hint: 'You can use a repeat to do an action more than once',
                requirements: {
                    Banana1: {pickUp:{val: true}},
                    Banana2: {pickUp:{val: true}},
                    Banana3: {pickUp:{val: true}}
                },
                gameboard: [
                    [
                        [{
                            type:'Collectible',
                            name:'Crystal1',
                            varName:'Banana3'
                        }],
                        [],
                        [],
                        []
                    ],
                    [
                        [],
                        [{
                            type:'Collectible',
                            name:'Crystal1',
                            varName:'Banana2'
                        }],
                        [{
                            type:'Obstacle',
                            name:'Tree1'
                        }],
                        []
                    ],
                    [
                        [],
                        [],
                        [{
                            type:'Collectible',
                            name:'Crystal1',
                            varName:'Banana1'
                        }],
                        [{
                            type:'Obstacle',
                            name: 'Tree1'
                        }]
                    ],
                    [
                        [],
                        [],
                        [],
                        [{
                            type: 'Avatar',
                            name: 'Giraffe3'
                        }]
                    ]
                ],
                pageNumber: 3,
                boardBackground: 'image/flower-field.png'

            }

            );
        }else{
            for (i=0; i<3; i++){
                pages.push({
                    story: story._id,
                    text: descr,
                    tools: ['move', 'pickUp', 'give', 'ask', 'tell', 'ifStatement', 'forLoop', 'whileLoop'],
                    variables: [{text: 'Omri', varType: 'person'}, {text: 'Zeke', varType: 'person'}, {text: 'Joe', varType: 'person'}, {text: 'Say hi', varType: 'variable'}, {text: 'Green Potion', varType: 'variable'}, {text: 'The potion is green', varType: 'condition'}],
                    concepts: [concepts[Math.floor(Math.random()*concepts.length)]],
                    hint: 'Try harder',
                    requirements: {GreenPotion: {pickUp: {val: false}}},
                    gameboard: [
                        [
                            [{
                                type: 'Avatar',
                                name: 'WizardBoy2'
                            }],
                            [],
                            [{
                                type: 'Obstacle',
                                name: 'Rock1'
                            }],
                            []

                        ],
                        [
                            [],
                            [{
                                type: 'Collectible',
                                name: 'Potion2',
                                varName: 'GreenPotion'
                            }],
                            [],
                            []
                        ],
                        [
                            [],
                            [],
                            [],
                            [],
                        ],
                        [
                            [],
                            [{
                                type: 'Obstacle',
                                name: 'Tree2',
                                varName: 'tree'
                            }],
                            [],
                            []
                        ]
                    ],
                    pageNumber: i,
                    boardBackground: backgrounds[i]
                });
            }
        }
    });
     return Page.createAsync(pages);
};

var seedUsers = function (stories, pages) {

    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password',
            username: 'Giraffe',
            gender: 'other'
        },
        {
            email: 'obama@gmail.com',
            password: 'potus',
            username: 'Obama',
            gender: 'male',
            isAdmin: true
        },
        {
            email: 'beckylee@gmail.com',
            password: 'becks',
            username: 'Beckylee',
            gender: 'female',
            isAdmin: true
        },
        {
            email: 'austin@gmail.com',
            password: 'austin',
            username: 'Austin',
            gender: 'male',
            isAdmin: true
        },
        {
            email: 'chandra@gmail.com',
            password: 'chandra',
            username: 'Chandra',
            gender: 'female',
            isAdmin: true
        },
        {
            email: 'emily@gmail.com',
            password: 'emily',
            username:'Emily',
            gender:'female',
            isAdmin: true
        }
    ];

    var makeAge = function(min, max){
        return Math.floor(Math.random()*(max-min)) + min;
    };

    var number = 0;

    var randomNumber = function(){
        number = Math.floor(Math.random()*10);
        return number;
    };

    users.forEach(function(user){
        user.age = makeAge(5, 13);
        user.mastery = [];
        concepts.forEach(function(concept){
            user.mastery.push({
                topic: concept,
                pointsEarned: randomNumber() * (Math.floor(Math.random()* 10)/10*50),
                pointsPossible:number*50
            });
        user.completedStories = [stories[Math.floor(Math.random()*stories.length)]._id];
        user.unfinishedPages = [pages[Math.floor(Math.random()*pages.length)]._id];
        });

    });

    return User.createAsync(users);

};

connectToDb.then(function () {
    // User.findAsync({}).then(function (users) {
        // if (users.length === 0) {
        //     return seedUsers();
        // } else {
        //     console.log(chalk.magenta('Seems to already be user data, exiting!'));
        //     process.kill(0);
        // }
    var tempUsers, tempStories, tempPages;
    seedStories()
    .then(function(stories){
        tempStories = stories;
        return seedPages(tempStories);
    }).then(function(pages){
        tempPages = pages;
        return seedUsers(tempStories, tempPages);
    }).then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    }).catch(function (err) {
        console.error(err);
        process.kill(1);
    });
});
