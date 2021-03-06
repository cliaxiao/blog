var mongodb = require('./db');

function Post(username, title, post, comments) {
	this.username = username;
	this.title = title;
	this.post = post;
	this.comments = comments;
}

module.exports = Post;

/*存储文章的相关信息*/
Post.prototype.save = function(callback) {
	
	//console.log(date.getFullYear() + '-' + (monthinit < 10 ？'0' + monthinit : monthinit));
	var date = new Date();
	var monthinit = date.getMonth() + 1;
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + '-' + (monthinit < 10 ? ('0' + monthinit) : monthinit),
		day: date.getFullYear() + '-' + (monthinit < 10 ? '0' + monthinit : monthinit) + '-' + date.getDate(),
		minute: date.getFullYear() + '-' + (monthinit < 10 ? '0' + monthinit : monthinit) + '-' + date.getDate() + ' ' + date.getHours() + ':' +(date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	}
	//存入数据库的文档
	var post = {
		username: this.username,
		time: time,
		title: this.title,
		post: this.post//正文
	};

	//打开数据库
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}

		//读取posts集合
		db.collection('posts', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
		//将文档插入posts集合

			collection.insert(post, {
				safe: true
			}, function(err) {
				mongodb.close();
				if(err) {
					return callback(err);
				}
				callback(null);//返回 err 为 null
			});
		});
	});
};

/*读取问章及其相关信息*/
Post.getAll = function(username, page, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		//读取posts集合
		db.collection('posts', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(username) {
				query.username = username;
			}
			//使用count返回特定查询的文档数
			collection.count(query, function(err, total) {
				//根据query对象查询文章,并且跳过前(page - 1)* 10,返回之后的10个结果
				collection.find(query, {
					skip: (page - 1) * 10,//skip方法接受一个数字参数作为跳过的记录条数
					limit: 10//limit()方法接受一个数字参数，该参数指定从MongoDB中读取的记录条数。
				}).sort({
					time: -1
				}).toArray(function(err, docs) {
					mongodb.close();
					if(err) {
						return callback(err);
					}
					callback(null, docs, total);//成功，以数组的形式返回查询的结果
				});
			});

		});

	});
};

Post.getOne = function(username, day, title, callback) {
	//打开数据库
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}

		//读取posts文章集合
		db.collection('posts', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			//根据用户名，发表日期及文章名进行查询
			collection.findOne({
				'username': username,
				'time.day': day,
				'title': title,
			}, function(err, doc) {
				mongodb.close();
				if(err) {
					return callback(err);
				}
				callback(null, doc);//返回查询的一篇文章
			});
		});
	});
};
//更新文章
Post.update = function(username, day, title, post, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		//读取posts集合
		db.collection('posts', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			//更新
			collection.update({
				'username': username,
				'time.day': day,
				'title': title
			}, {
				$set: {post: post}
			}, function(err) {
				mongodb.close();
				if(err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

//删除文章
Post.remove = function(username, day, title, callback) {
	//打开数据库
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		//读取posts集合
		db.collection('posts', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			//根据用户名、时间和文章标题查找文章后，删除查找到的文章
			collection.remove({
				"username": username,
				"time.day": day,
				"title": title
			}, {
				w: 1
			}, function(err) {
				mongodb.close();
				if(err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};