var mongoose = require('./dbConnection');

var userSchema = new mongoose.Schema({
    nickName: String,
    password: String,
    email: String
}, {
    collection: 'users'
});

var userModel = mongoose.model('User', userSchema);

function User(user) {
    this.nickName = user.nickName;
    this.password = user.password;
    this.email = user.email;
}

// 储存用户信息
User.prototype.save = function (callback) {
    var user = {
        nickName: this.nickName,
        email: this.email,
        password: this.password
    };

    var newUser = new userModel(user);

    newUser.save(function (err, user) {
        if (err) {
            return callback(err);
        }

        callback(null, user);
    })
};

User.getUserInfo = function (email, callback) {
    userModel.findOne({
        email:email
    }, function (err, user) {
        if(err){
            return callback(err);
        }else{
            callback(null, user);
        }
    })
};

module.exports = User;