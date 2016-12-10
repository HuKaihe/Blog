function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('err', '请您先登录');
        res.redirect('back');
    }else{
        next();
    }
}

exports.checkLogin = checkLogin;