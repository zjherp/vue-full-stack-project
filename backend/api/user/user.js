/*
 * @Author: xypecho
 * @Date: 2018-09-08 21:44:47
 * @Last Modified by: xueyp
 * @Last Modified time: 2018-09-13 17:24:34
 */
const mysql = require('mysql')
const url = require('url');
const mysqlJs = require('../../common/mysql.js')
const tool = require('../../common/tool.js');
class user {
    // 用户注册
    async register(ctx) {
        let res;
        let register_time = new Date().getTime();
        let username = ctx.request.body.username;
        let password = tool.md5(ctx.request.body.password);
        let is_exist = await mysqlJs.queryFromMysql(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`);
        if (is_exist && is_exist.length > 0) {
            res = {
                status: 201,
                message: '该用户名已被注册'
            }
            return ctx.body = res;
        } else {
            let insertUser = await mysqlJs.queryFromMysql(`INSERT INTO users (username,password,register_time) VALUES ('${username}','${password}','${register_time}')`);
            let userInfo = await mysqlJs.queryFromMysql(`SELECT * FROM users WHERE uid = ${insertUser.insertId}`);
            if (!insertUser) {
                res = {
                    status: 201,
                    message: '注册失败，请稍候重试'
                }
            } else {
                res = {
                    status: 200,
                    message: '注册成功',
                    data: userInfo[0]
                }
            }
            return ctx.body = res;
        }
    }
    // 用户登录
    async login(ctx) {
        let res;
        let last_login_time = new Date().getTime();
        let username = ctx.request.body.username;
        let password = tool.md5(ctx.request.body.password);
        let userInfo = await mysqlJs.queryFromMysql(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`);
        if (userInfo && userInfo.length === 1 && userInfo[0].is_deleted == 1 && userInfo[0].status == 1) {
            let uid = JSON.parse(JSON.stringify(userInfo))[0].uid;
            await mysqlJs.queryFromMysql(`UPDATE users SET last_login_time = '${last_login_time}' WHERE uid = '${uid}'`);
            res = {
                status: 200,
                message: '登录成功',
                data: userInfo[0]
            }
        } else if (userInfo && userInfo.length === 1 && userInfo[0].is_deleted == 0) {
            res = {
                status: 201,
                message: '该帐号已被注销，请重新注册'
            }
        } else if (userInfo && userInfo.length === 1 && userInfo[0].status == 0) {
            res = {
                status: 201,
                message: '该帐号已被禁用，请联系管理员解封'
            }
        } else {
            res = {
                status: 201,
                message: '帐号或密码错误，请重试'
            }
        }
        return ctx.body = res;
    }
    // 获取所有用户列表
    async list(ctx) {
        let res;
        let userList = JSON.parse(JSON.stringify(await mysqlJs.queryFromMysql(`SELECT * FROM users`)));
        if (userList && userList.length > 0) {
            res = {
                status: 200,
                data: userList
            }
        } else {
            res = {
                status: 201,
                message: '获取用户列表失败，请稍候重试'
            }
        }
        return ctx.body = res;
    }
    // 获取指定用户的信息
    async userInfo(ctx) {
        let res;
        let uid = url.parse(ctx.request.url, true).query.uid;
        let userInfo = await mysqlJs.queryFromMysql(`SELECT * FROM users WHERE uid = '${uid}'`);
        if (userInfo && userInfo.length == 1) {
            res = {
                status: 200,
                data: userInfo[0]
            }
        } else {
            res = {
                status: 201,
                message: '获取用户信息失败，请稍候重试'
            }
        }
        return ctx.body = res;
    }
    // 编辑用户信息
    async edit(ctx) {
        let res;
        let user = ctx.request.body.userInfo;
        let uid = user.uid;
        let is_exist = await mysqlJs.queryFromMysql(`SELECT * FROM users WHERE uid = '${uid}'`);
        if (is_exist && is_exist.length == 1) {
            let userInfo = await mysqlJs.queryFromMysql(`UPDATE users SET email = '${user.email}',is_deleted = '${user.is_deleted}',avatar = '${user.avatar}',password = '${tool.md5(user.password)}' WHERE uid = '${uid}'`);
            console.log('===============')
            console.log(userInfo)
            console.log('================')
        } else {
            res = {
                status: 201,
                message: '编辑用户信息失败，请稍候重试'
            }
        }
        console.log(uid)
        console.log(user);
        return ctx.body = res;
    }
}
module.exports = new user();
