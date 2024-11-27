const mongoose = require("mongoose");

var mongoURL = 'mongodb+srv://booking:2002@booking.vtm6k.mongodb.net/shiongreen-orders?retryWrites=true&w=majority'


mongoose.connect(mongoURL)

var connection = mongoose.connection

connection.on('error' , ()=>{
    console.log('MongoDB connection failed')
})

connection.on('connected' , ()=>{
    console.log('MongoDB connection successful')
})

module.exports = mongoose