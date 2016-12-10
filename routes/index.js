var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Blog = require('../models/Blog');
var crypto = require('crypto');

// 首页
router.get('/', function (req, res) {

    var indexBlogAmount = parseInt(req.query.blog_amount)||3,
        end = false,
        bottom = false;

    Blog.getHotBlog(indexBlogAmount, function (err, hotBlogs) {

        if(hotBlogs.length < indexBlogAmount){
            end = true;
        }

        if(indexBlogAmount > 3){
            bottom = true;
        }


        res.render('index',
            {
                title: 'HKH博客',
                url:'/',
                user: req.session.user,
                err:req.flash('err').toString(),
                hotBlogs:hotBlogs,
                blog_amount:indexBlogAmount+3,
                end:end,
                bottom:bottom
            }
        );
    });
});

// 登录
router.post('/login', function (req, res){
    var email = req.body['email'],
        password = req.body['password'],
        url = req.body['url']||'/';

    if(email==""||password==""){
        return res.redirect('/');
    }

    var md5 = crypto.createHash('md5'),
        password_md5 = md5.update(password).digest('hex');

    User.getUserInfo(email, function (err, user) {
        if (err) {
            req.flash('err', err);
            return res.redirect('/');
        } else {
            if(password_md5 == user.password) {
                req.session.user = user;
                return res.redirect(url);
            } else {
                req.flash('err', '密码错误');
                return res.redirect('/');
            }
        }
    })
});

// 注册页
router.route('/register').get(function (req, res, next) {
    res.render('register', {
        error_info: req.flash('error').toString()
    });
}).post(function (req, res) {
    var nickName = req.body['nickName'],
        email = req.body['email'],
        password = req.body['password'],
        password_re = req.body['password_repeat'];

    if (nickName === "" || email === "" || password === "" || password_re === "") {
        req.flash('error', '内容不得为空');
        return res.redirect('register');
    }

    if (password != password_re) {
        req.flash('error', '两次密码输入不一致');
        return res.redirect('register');
    }

    // 生成密码的Md5值
    var md5 = crypto.createHash('md5'),
        password_md5 = md5.update(password).digest('hex');

    User.getUserInfo(email, function (err, user) {
        if (user) {
            req.flash('error', "用户邮箱已注册");
            return res.redirect('/register');
        } else {
            var newUser = new User({nickName: nickName, email: email, password: password_md5});
            newUser.save(function (err, user) {
                if (err) {
                    req.flash('err', err);
                    return res.redirect('/register'); // 相当于执行app.get('/register',callback)
                } else {
                    req.session.user = user;
                    res.redirect('userHome'); // 成功后返回用户主页
                }
            });
        }
    });
});


// 登出
router.get('/logout', function (req, res) {
    req.session.user = null;
    res.redirect('/');
});

// 用户首页
router.get('/userHome', function (req, res, next) {
    var user = req.session.user;

    if (user) {

        Blog.getAuthorBlog(user.email, function (err, blogList) {
            if(err) {
                req.flash('err', err);
                return res.redirect('/error');
            }else{
                res.render('userHome', {
                    title: user.nickName + '的主页',
                    user: user,
                    blogs:blogList
                });
            }
        });


    } else {
        res.redirect('/');
    }
});

module.exports = router;
