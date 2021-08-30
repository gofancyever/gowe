import { app, BrowserWindow,Menu,MenuItem } from 'electron'
import '../renderer/store'
const ipcMain = require('electron').ipcMain;
import util from "/src/module/utils"
// import { autoUpdater } from 'electron-updater'


/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
let requestEnv = 'production'
const http_proxy = "https=192.168.1.201:6000;http=192.168.1.201:6000"
// const http_proxy = "https=192.168.1.98:8080;http=192.168.1.98:8080"
const proxyBypassRules = "upload.sxyygh.com,localhost"
var requestDatas = {}
let mainWindow
let toolWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/tool`
  : `file://${__dirname}/index.html`

function openInstallCertWindow() {
  const certWindow = new BrowserWindow({
    height: 400,
    useContentSize: true,
    width: 600
  })
  certWindow.webContents.session.setProxy({
    proxyRules: http_proxy,
    proxyBypassRules:proxyBypassRules
  },  ()=> {
    certWindow.loadURL("http://mitm.it/")
  })

}
function setProxy() {
  mainWindow.webContents.session.setProxy({
    proxyRules: http_proxy,
    proxyBypassRules:proxyBypassRules
  },  ()=> {
    console.log('代理设置完毕')
    mainWindow.loadURL("http://weixin.sxyygh.com")
    setTimeout(()=>{

      const isOpened = util.StorageUtil.isOpened()
      if (isOpened == false) {
        toolWindow.webContents.send("PROXYCERTISINSTALL", false)
        util.StorageUtil.setOpened()
      }
    },10000)

  });
}
function createWindow () {

  // util.checkPortProxyIsAvailable().then((isAv)=>{
  //   console.log("+===,",isAv)
  // })


  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 667,
    useContentSize: true,
    width: 375,

  })


  toolWindow = new BrowserWindow({
    height: 667,
    useContentSize: true,
    width: 1000
  })

    toolWindow.loadURL(winURL)
    // toolWindow.webContents.openDevTools()
    if (process.env.NODE_ENV === 'development') toolWindow.webContents.openDevTools()
    util.checkProxyServerIsStart().then((isStart)=>{
      console.log("代理服务器是否可用：", isStart)
      if (isStart) {
        setProxy()
      }else {
        mainWindow.loadURL("http://weixin.sxyygh.com")
      }

    })
  ipcMain.on('OPENCERTWINDOW',()=>{
    openInstallCertWindow()
  })
  // 检测代理服务器是否可用
  ipcMain.on('CHECKPROXY',()=>{
    util.checkProxyServerIsStart().then((isStart)=>{
      console.log("代理服务器是否可用：", isStart)
      toolWindow.webContents.send("PROXYISENABLE", isStart)
    }).catch((e)=>{
      console.log(e)
    })
  })
  // 请求地址
  ipcMain.on("URLCHANGE",(event,arg)=>{
    console.log(arg)
    mainWindow.loadURL(arg)
  })

  //  获取localStorag
  ipcMain.on("GETLOCALSTORAGE",(event,arg)=>{
    console.log("GETLOCALSTORAGE")
    util.StorageUtil.getAllItem(mainWindow).then(datas=>{
      toolWindow.webContents.send("LOCALSTORAGEDATAS",datas)
    })
  })
  // 删除
  ipcMain.on("DELLOCALSTORAGE",(event,arg)=>{
    console.log("DELLOCALSTORAGE")
    util.StorageUtil.removeItem(mainWindow,arg.key)
  })
  // 设置
  ipcMain.on("SETLOCALSTORAGE",(event,arg)=>{
    console.log("SETLOCALSTORAGE")
    util.StorageUtil.setItem(mainWindow,arg.key,arg.value)
  })

  ipcMain.on("GETUSERS",(event,arg)=>{
    console.log("GETUSERS")
    const users = util.StorageUtil.getUsers()
    toolWindow.webContents.send("USERS",users)
  })
  // 获取当前userid
  ipcMain.on("GETCURRENTUSERID",(event,arg)=>{
    console.log("GETCURRENTUSERID")
    util.StorageUtil.getItem(mainWindow,'userid').then((userid)=>{
      toolWindow.webContents.send("CURRENTUSERID",userid)
    })

  })

  // 切换用户
  ipcMain.on("SWITCHUSER",(event,arg)=>{
    console.log("SWITCHUSER")
    util.StorageUtil.setUserInfoToLocalStroage(mainWindow,arg)
    mainWindow.reload()

  })

  // 切换环境
  ipcMain.on("CHANGEENV",(event,arg)=>{
    console.log("CHANGEENV")
    console.log(arg)
    requestEnv = arg
    mainWindow.reload()

  })
  const filter = {
    urls: ['http://upload.sxyygh.com:8015/*',"chrome-devtools://*","chrome-extension://*"]
  }
  mainWindow.webContents.on("did-navigate-in-page",(event,url)=>{
    let currentURL = mainWindow.webContents.getURL();
    toolWindow.webContents.send("CURRENTURL",currentURL)
  })

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['Debug-Config'] = requestEnv
    if (details.uploadData instanceof Array) {
      // console.log("details:",details.uploadData)
      const byteObj = details.uploadData.find((data) => {
        if (Object.keys(data).find((key)=>key == 'bytes')) {
          return true
        }else {
          return false
        }
      })

      if (byteObj.bytes) {
        const json = byteObj.bytes.toString()
        details.requestHeaders['Post-Data'] = json
      }
    }

    callback({ requestHeaders: details.requestHeaders })
  })



  try {
    mainWindow.webContents.debugger.attach('1.1');
    mainWindow.webContents.debugger.sendCommand('Network.enable');
    const isMac = process.platform === 'darwin'
    if (!isMac) {
      mainWindow.webContents.debugger.sendCommand("Emulation.setTouchEmulationEnabled", {         enabled: false     });
      mainWindow.webContents.debugger.sendCommand("Emulation.setEmitTouchEventsForMouse", {         enabled: false     });
    }

  } catch (err) {
    console.log('Debugger attach failed: ', err);
  }

  mainWindow.webContents.debugger.on('detach', (event, reason) => {
    console.log('Debugger detached due to: ', reason);
  });



  mainWindow.webContents.debugger.on('message', (event, method, params) => {

    if (method === 'Network.responseReceived') {

      if (params.type == "XHR") {
        requestDatas[params.requestId] = params
      }
    }
    if (method == 'Network.loadingFinished') {
      // console.log(params.response.requestHeaders)

      mainWindow.webContents.debugger.sendCommand('Network.getResponseBody', { requestId: params.requestId },(error, result)=>{
        const requeustData = requestDatas[params.requestId]
        if (!requeustData) return
        const paramsData = requeustData
        paramsData.response.body = result
        paramsData.postData = requeustData.response.requestHeaders['Post-Data']
        toolWindow.webContents.send("REQUEST",paramsData)
        if (requeustData.response.url.toLowerCase().includes("app/harsUserinfo/login".toLowerCase())) { //拦截用户信息
          console.log("==========")
          util.StorageUtil.saveUserFromResult(result)
        }
        delete requestDatas[params.requestId]
      })
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
    try {
      toolWindow.close()
    }catch (e) {

    }


  })
  mainWindow.on("focus",()=>{
    toolWindow.showInactive()
  })

  toolWindow.on('closed', () => {
    toolWindow = null
    try {
      mainWindow.close()
    }catch (e) {

    }

  })

}
function createMenu() {
  const isMac = process.platform === 'darwin'
  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: '安装代理证书',
          click: async () => {
            openInstallCertWindow()
          }
        },
        {
          label: '检查代理服务器',
          click: async () =>{
            util.checkProxyServerIsStart().then((isStart)=>{
              console.log("代理服务器是否可用：", isStart)
              toolWindow.webContents.send("PROXYISENABLE", isStart)
            }).catch((e)=>{
              console.log(e)
            })
          }
        }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
app.on('ready', ()=>{
  createWindow()
  createMenu()
  // if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// autoUpdater.on('update-downloaded', () => {
//   autoUpdater.quitAndInstall()
// })



