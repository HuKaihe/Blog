var express = require('express');
var router = express.Router();
var Blog = require('../models/Blog');
var util = require('util');
var right = require('../models/right');
var multer = require('multer');
var fs = require('fs');
var markdown = require('markdown').markdown;

// 写新的博客
router.use('/newBlog', right.checkLogin).get('/newBlog', function (req, res, next) {
    var user = req.session.user, blog = req.flash('blog')[0];
    if (user) {
        res.render('newBlog', {
            title: user.nickName + '的主页',
            user: user,
            blog: blog
        });
    }
    else {
        res.redirect('/');
    }
});

// 发布新的博客
router.post("/publishNewBlog", function (req, res) {
    var blogTitle = req.body["blog_title"],
        blogContent = req.body["blog_content"],
        blogIntroduction = req.body['blog_introduction'],
        _id = req.body['_id'],
        publishingDate = new Date(),
        author = req.session.user,
        readingQuantity = 0;

    var newBlog = new Blog({
        title: blogTitle,
        content: blogContent,
        publishingDate: publishingDate,
        introduction: blogIntroduction,
        author: author,
        readingQuantity: readingQuantity
    });

    if (_id) {
        Blog.deleteBlog(_id, function () {
            newBlog.save(function (err, blog) {
                if (err) {
                    res.json(err);
                }

                res.json("success");
            })
        });
    } else {
        newBlog.save(function (err, blog) {
            if (err) {
                console.log(err)
            }
            res.json("success");
        })
    }

});

// 图片上传
router.get('/imgFrame', function (req, res) {
    var filename = req.flash('filename').toString();

    if (filename) {
        res.render('imgFrame', {
            layout: false,
            img_url: '/images/blog/' + filename,
            width: '200px',
            pic_name: filename
        });
    } else {
        res.render('../imgFrame', {
            layout: false,
            img_url: '/images/blog/' + filename,
            width: '200px',
            pic_name: filename
        });
    }

});

router.post('/upload', function (req, res) {
    var fileinfos = req.files;
    req.flash('filename', fileinfos['upload_file']['name']);
    console.log('文件上传成功！！');
    res.redirect('imgFrame');
});

// 删除上传的图片

router.post('/deletePic', function (req, res) {
    var picname = req.body['picname'];

    fs.unlink('D:\\WebStorm 2016.2\\WSPro\\Node\\Blog\\public\\images\\blog\\' + picname, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log('删除文件成功！');
            res.json('');
        }
    });
});

// 删除博客
router.get("/deleteBlog/:_id", function (req, res) {
    var _id = req.params._id;

    Blog.deleteBlog(_id, function (err) {
        if (err) {
            req.flash('err',err);
            return res.redirect('back');
        } else {
            console.log("博客删除成功");
            return res.redirect('/userHome');
        }
    })
});

// 编辑博客
router.get("/editBlog/:_id", function (req, res) {
    var _id = req.params._id;

    Blog.getABlog(_id, function (err, blog) {
        if (err) {

        } else {
            req.flash('blog', blog);
            return res.redirect('../newBlog');
        }
    });
});

// 读一篇博客
router.get("/blogDetail/:_id", function (req, res) {
    var _id = req.params._id;

    Blog.getABlog(_id, function (err, blog) {
        if (err) {
            req.flash('err',err);
            return res.redirect('back');
        } else {
            blog.content = markdown.toHTML(blog.content);

            var publishingDate = blog.publishingDate;
            blog.dateStr = publishingDate.getFullYear()+"年"+(publishingDate.getMonth()+1)+"月"+publishingDate.getDate()+"日"+(publishingDate.getHours()+1)+"时";

            Blog.addVisitedAmount(_id, function (err) {
                if(err) {
                    req.flash('err',err);
                    return res.redirect('back');
                }

                return res.render('blogDetail',{
                    blog:blog,
                    user:req.session.user
                });
            });


        }
    })
});


module.exports = router;
