var mongodb = require('./db');

function User(user) {
	this.username = user.username;
	this.password = user.password;
	this.email = user.email;
}

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
	//要存入数据库的用户文档
	var user = {
		username: this.username,
		password: this.password,
		email: this.email
	};

	//打开数据库
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);//错误，返回错误信息
		}

		//读取user集合
		db.collection('users', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('username',{  
            	unique:true  
        	});  
			//将用户数据插入users集合中
			collection.insert(user, {
				safe: true
			}, function(err, user) {
				mongodb.close();
				if(err) {
					return callback(err);
				}
				callback(null, user[0]);//成功，err为null，返回存储后的用户数据
			});

		});
	});
};

//读取用户信息
User.get = function(username, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}

		//读取users集合
		db.collection('users', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}

			collection.findOne({
				username: username
			}, function(err, user) {
				mongodb.close();
				if(err) {
					return callback(err);
				}
				callback(null, user);
			})
		})
	})
} 