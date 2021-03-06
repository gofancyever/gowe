import encryptModule from './encryptModule'
const encodeReserveRE = /[!'()*]/g
const encodeReserveReplacer = c => '%' + c.charCodeAt(0).toString(16)
const commaRE = /%2C/g

const encode = str => encodeURIComponent(str)
    .replace(encodeReserveRE, encodeReserveReplacer)
    .replace(commaRE, ',')

const decode = decodeURIComponent

/**
 * 序列化对象 并加密
 * @param {Object} obj
 */
export const stringifyQuery = obj => {
    for (let i in obj) {
        console.log(i);
    }
    const res = obj ? Object.keys(obj).map(key => {
        const val = obj[key]

        if (val === undefined) {
            return ''
        }

        if (val === null) {
            return encode(key)
        }

        if (Array.isArray(val)) {
            const result = []
            val.forEach(val2 => {
                if (val2 === undefined) {
                    return
                }
                if (val2 === null) {
                    result.push(encode(key))
                } else {
                    result.push(encode(key) + '=' + encode(val2))
                }
            })
            return result.join('&')
        }

        return encode(key) + '=' + encode(val)
    }).filter(x => x.length > 0).join('&') : null

    console.log('encrypt(res)', encodeURIComponent(encryptModule.j_img666555_e_m(res)));
    return res ? `?${encodeURIComponent(encryptModule.j_img666555_e_m(res))}` : ''
    // return res ? `?${encryptModule.j_img666555_e_m(obj)}` : ''
}

/**
 * 解密 解析 字符串参数
 * @param {String} query
 */
export const parseQuery = query => {
    // 先对query进行解密
    // 在使用vue-router中的解析方法对query进行解析，详见vue-router/src/query.js
    console.log('hhhhh', query, query.indexOf('=') !== -1);
    const res = {}

    query = query.trim().replace(/^(\?|#|&)/, '')

    if (!query) {
        return res
    }

    // 解密
    if (query.indexOf('=') === -1) {
        try {
            query = encryptModule.j_img666555_d_m(decodeURIComponent(query));
        } catch (e) {
            console.log('无法解析url数据，', e)
        }
    }

    query.split('&').forEach(param => {
        const parts = param.replace(/\+/g, ' ').split('=')
        const key = decode(parts.shift())
        const val = parts.length > 0
            ? decode(parts.join('='))
            : null

        if (res[key] === undefined) {
            res[key] = val
        } else if (Array.isArray(res[key])) {
            res[key].push(val)
        } else {
            res[key] = [res[key], val]
        }
    })
    return res
}

/**
 * 解密 解析 字符串参数为未加密URL
 * @param {String} query
 */
export const parseQueryStr = query => {
    // 先对query进行解密
    // 在使用vue-router中的解析方法对query进行解析，详见vue-router/src/query.js
    console.log('hhhhh', query, query.indexOf('=') !== -1);
    const res = {}

    query = query.trim().replace(/^(\?|#|&)/, '')

    if (!query) {
        return res
    }

    // 解密
    if (query.indexOf('=') === -1) {
        try {
            query = encryptModule.j_img666555_d_m(decodeURIComponent(query));
        } catch (e) {
            console.log('无法解析url数据，', e)
        }
    }

    return query
}
