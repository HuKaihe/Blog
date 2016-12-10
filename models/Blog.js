var mongoose = require('./dbConnection');
var markdown = require('markdown').markdown;

var blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    introduction: String,
    author: {
        nickName: String,
        password: String,
        email: String
    },
    readingQuantity: Number,
    publishingDate: Date
}, {
    collection: 'blogs'
});

var blogModel = mongoose.model('Blog', blogSchema);

function Blog(blog) {
    this.title = blog.title;
    this.content = blog.content;
    this.author = blog.author;
    this.introduction = blog.introduction;
    this.readingQuantity = blog.readingQuantity;
    this.publishingDate = blog.publishingDate;
}

// 保存博客
Blog.prototype.save = function (callback) {
    var blog = {
        title: this.title,
        content: this.content,
        author: this.author,
        introduction: this.introduction,
        readingQuantity: this.readingQuantity,
        publishingDate: this.publishingDate
    };
    var newBlog = new blogModel(blog);
    newBlog.save(function (err) {
        if (err) {
            return callback(err);
        }

        callback(null, blog);
    });
};

// 获取某位作者的全部博客（通过email识别）
Blog.getAuthorBlog = function (queryPar, callback) {
    blogModel.find({'author.email': queryPar}, function (err, blog_list) {
        if (err) {
            return callback(err);
        } else {
            blog_list.forEach(function (item){
                var publishingDate = item.publishingDate;
                item.dateStr = publishingDate.getFullYear()+"年"+(publishingDate.getMonth()+1)+"月"+publishingDate.getDate()+"日"+(publishingDate.getHours()+1)+"时";
            });

            callback(null, blog_list);
        }
    })
};

// 删除某一篇博客
Blog.deleteBlog = function (queryPar, callback) {
    blogModel.remove({_id: queryPar}, function (err) {
        if (err) {
        } else {
            callback(err);
        }
    })
};

// 获得某一篇博客
Blog.getABlog = function (queryPar, callback) {
    blogModel.findById({_id: queryPar}, function (err, blog) {
        if (err) {
            return callback(err);
        } else {
            callback(null, blog);
        }
    });
};

// 获得n篇最热门（阅读量最高）的博客
Blog.getHotBlog = function (n,callback) {
    blogModel.find().sort({'readingQuantity':'-1'}).limit(n).exec(function (err, blogs) {
        if(err){
            return callback(err);
        }else{
            callback(null, blogs)
        }
    });
};

// 增加一个访问量
Blog.addVisitedAmount = function (query, callback) {
    blogModel.findById(query, function (err, blog) {
        blog.readingQuantity ++;
        blog.save(function (err) {
            if(err){
                console.log(err)
            }else{
                callback(null)
            }
        });
    })
};

module.exports = Blog;