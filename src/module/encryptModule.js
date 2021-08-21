const crypto = require('crypto-js');

const encryptModule = {
    key: 'sxlkkjoefncxmggg',
    iv: '0682036802830600',
    clearEncoding: 'utf8',
    cipherEncoding: 'base64',
    algorithm: 'aes-128-cbc',
    j_img666555_d_m(params) {
        var akey = crypto.enc.Utf8.parse(encryptModule.key);
        var decrypt = crypto.AES.decrypt(params, akey, { iv: crypto.enc.Utf8.parse(encryptModule.iv), mode: crypto.mode.CBC, padding: crypto.pad.Pkcs7 });
        var decryptedStr = decrypt.toString(crypto.enc.Utf8);
        return decryptedStr.toString();
    },
    j_img666555_e_m(params) {
        var word = params
        if (typeof params != 'string') {
            word = JSON.stringify(params)
        }
        var srcs = crypto.enc.Utf8.parse(word);
        var akey = crypto.enc.Utf8.parse(encryptModule.key);
        var encrypted = crypto.AES.encrypt(srcs, akey, {
            iv: crypto.enc.Utf8.parse(encryptModule.iv), mode: crypto.mode.CBC, padding: crypto.pad.Pkcs7});
        return encrypted.toString()
    },
    objToBase64(obj) {
        return encodeURIComponent(Buffer.from(JSON.stringify(obj)).toString('base64'));
    },
    base64ToObj(base64) {
        return JSON.parse(Buffer.from(decodeURIComponent(base64), 'base64').toString());
    }
};
// const result = encryptModule.j_img666555_d_m("YOiRqu+mXLvpqfuJNN+qli1x4EKZYZNhFVhwuX02q3lLgtW5yxKujTuBJ0Mkg/YC+cH/kkGSwzJoVNl/4nLLvMF9GNdgEyA9ACh92Bgy3vP9zGPDH/0F7A6fLBZBQnFYQg86WNLoqiRmeBxgzmp44BSH3H6ybodrPVb0uN245tH4DdSQ+03N/fnFzREq66vqRSXhNzmY7sv5IYNtsFOeMGr8bu3WPCK6rISEaL6hyx5vJe6EUWuCLoLSJSKOUX0r")
// console.log(result)
export default encryptModule

