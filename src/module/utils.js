import it from "element-ui/src/locale/lang/it";

const Store = require('electron-store');
const  { net } = require("electron");
import encryptModule from "/src/module/encryptModule"
import axios from 'axios'
const checkProxyServerIsStart = function () {
    return new Promise((resolve)=>{
        axios.get('http://192.168.1.201:6000').then((res)=>{
            console.log(res)
        }).catch((error)=>{
            if (error.response) {
                resolve(true)
            }else {
                resolve(false)
            }
        })
    })
}
const checkProxyCertIsInstall = function (){
    return new Promise((resolve)=>{
        const request = net.request("http://mitm.it/")
        request.on("response",(res)=>{
            res.on("data",(chunk)=>{
                const body = chunk.toString()
                if (body.toLowerCase().includes('If you can see this, traffic is not passing through mitmproxy'.toLowerCase())) {
                    resolve(false)
                }else {
                    resolve(true)
                }
            })
        })
        request.end()
    })
}

const StorageUtil = {
    getItem:function (win,key) {
        return win.webContents.executeJavaScript(`window.localStorage.getItem('${key}');`);
    },
    setItem: function (win,key,value) {
        return win.webContents.executeJavaScript(`window.localStorage.setItem('${key}', '${value}');`);
    },
    removeItem: function (win,key,value) {
        return win.webContents.executeJavaScript(`window.localStorage.removeItem('${key}');`);
    },
    getKey:function (win,index) {
        return win.webContents.executeJavaScript(`window.localStorage.key(${index});`);
    },
    getAllItem: function (win) {
        return win.webContents.executeJavaScript(`window.localStorage.length;`).then((length)=>{
            var arr = []
            for(var i = 0; i < length; i++) {
                const result = new Promise((resolve, reject)=>{
                    this.getKey(win,i).then((key)=>{
                        return this.getItem(win,key).then((item)=>{
                            // console.log('value:',item,'key:',key)
                            resolve({key:key,value:item})
                        }).catch((e)=>{
                            reject(e)
                        })
                    }).catch((e)=>{
                        reject(e)
                    })
                })

                arr.push(result)
            }
            return Promise.all(arr)
        })
    },
    clearAll: function (win) {
        return win.webContents.session.clearStorageData()
    },
    setUserInfoToLocalStroage:function (win,patient) {
        let user = { userid: patient.userid, username: (!patient.username)?'':patient.username, phone: patient.phone };
        this.setItem(win,'userid', patient.userid)
        this.setItem(win,'username', (!patient.username)?'':patient.username)
        this.setItem(win,'phone', (!patient.phone)?'':patient.phone)
        this.setItem(win,'addrcity', (!patient.addrcity)?'':patient.addrcity)
        this.setItem(win,'addrcountry', (!patient.addrcountry)?'':patient.addrcountry)
        this.setItem(win,'addrprovince', (!patient.addrprovince)?'':patient.addrprovince)
        this.setItem(win,'idcard', (!patient.idcard)?'':patient.idcard)
        this.setItem(win,'user', JSON.stringify(user))
        this.setItem(win,'appClient', 'patient')
    },
    saveUserFromResult(result) {
        console.log("saveUserFromResult:",result)
        var json = result.body
        if (typeof result.body == "string") {
            try {
                json = JSON.parse(result.body)
            }catch (e) {
                return 
            }

        }
        if (json && json.result && json.code == 1) {
            let encryptStr = encryptModule.j_img666555_d_m(json.result)
            const decodeJson = JSON.parse(encryptStr)
            console.log("decodeJson",decodeJson)
            this.saveUser(decodeJson.result)
        }
    },
    saveUser:function(user) {
        const store = new Store();
        var users = store.get("users") || []
        console.log("users",users)
        const arr_user = users.find((u)=>{
            return u.userid == user.userid
        })
        if (arr_user) return
        users.splice(0,0,user)
        users = Array.from(new Set(users))
        if (users.length > 6) {
            users.slice(0,5)
        }
        store.set('users', users);
    },
    getUsers:function(){
        const store = new Store();
        var users = store.get("users")
        console.log("users",users)
        return users
    },
    clearAllUsers:function (){
        const store = new Store();
        store.clear()
    },
    isOpened:function (){
        const store = new Store();
        var isOpened = store.get("isOpened") || false
        console.log("isOpened:",isOpened)
        return isOpened || false
    },
    setOpened:function (){
        const store = new Store();
        store.set("isOpened",true)
    }
}
export default {
    StorageUtil:StorageUtil,
    checkProxyServerIsStart:checkProxyServerIsStart,
    checkProxyCertIsInstall:checkProxyCertIsInstall
}
