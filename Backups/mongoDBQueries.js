var user = require('./models/user.js');
var channel = require('./models/channel.js');
var message = require('./models/message.js');

var userNameCheck = function (data) {
    return new Promise(async (resolve, reject) => {
        try {
            await user.find(data).exec(function (err, result) {
                if (err) {
                    reject(err);
                };
                resolve(result);
            });
        } catch (err) {
            reject(err);
        }
    });
}

var CheckFriends = function (number) {
    return new Promise(async (resolve, reject) => {
        try {
            await user.find({ PhoneNumber: { $ne: number } }).exec(function (err, result) {
                if (err) {
                    reject(err);
                };
                resolve(result);
            });
        } catch (err) {
            reject(err);
        }
    });
}

var GetFriendsChannels = function (from, to) {
    return new Promise(async (resolve, reject) => {
        try {
            await channel.find({
                $and: [
                    { "ChannelUsers.UserName": { $eq: from } },
                    { "ChannelUsers.UserName": { $eq: to } }
                ]
            }, { _id: 1 }).exec(function (err, result) {
                if (err) {
                    reject(err);
                };
                resolve(result);
            });
        } catch (err) {
            reject(err);
        }
    });
}

var channelCheck = function (data) {
    return new Promise(async (resolve, reject) => {
        try {
            await channel.find(data).exec((err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        }
        catch (err) {
            reject(err);
        }
    });
}

var getRegisteredUsers = function (data, projection) {
    return new Promise(async (resolve, reject) => {
        try {
            await user.find(data, projection).exec((err, result) => {
                if (err) {
                    reject(err);
                }
                console.log('result', result);
                resolve(result);
            });
        }
        catch (err) {
            reject(err);
        }
    });
}

var insertUser = function (data) {
    return new Promise(async (resolve, reject) => {
        try {
            await user.create(data, (err, userDoc) => {
                if (err) {
                    reject(err);
                }
                resolve(userDoc);
            });
        } catch (err) {
            reject(err);
        }
    });
}

var insertMessage = function (data) {
    return new Promise(async (resolve, reject) => {
        try {
            await message.create(data, (err, messageDoc) => {
                if (err) {
                    reject(err);
                }
                resolve(messageDoc);
            });
        } catch (err) {
            reject(err);
        }
    });
}

var insertChannel = function (data) {
    return new Promise(async (resolve, reject) => {
        try {
            await channel.create(data, (err, channelDoc) => {
                if (err) {
                    reject(err);
                }
                resolve(channelDoc);
            });
        } catch (err) {
            reject(err);
        }
    });
}


module.exports = {
    userNameCheck,
    channelCheck,
    insertUser,
    insertMessage,
    insertChannel,
    CheckFriends,
    GetFriendsChannels,
    getRegisteredUsers
}