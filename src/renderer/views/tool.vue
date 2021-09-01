<template>
<div style="height: 100%;display: flex;flex-direction: column;">
    <div class="url-panel">
        <el-input @change="changeUrl" v-model="url" placeholder="请输入内容"></el-input>
        <el-select v-model="env" placeholder="请选择" @change="envChange">
            <el-option
                v-for="item in envOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
        </el-select>
    </div>

    <div class="panel">
        <div class="panel-url-content">
            <el-button size="mini" @click="clearUrl" icon="el-icon-delete-solid"></el-button>
            <el-button size="mini" @click="decodeStr" icon="el-icon-unlock"></el-button>
            <div @click="urlClick(index)" :class="currentIdx == index ? 'panel-url-selected' : 'panel-url' " v-for="(item,index) in requestDatas">
                {{ getLastPath(item.response.url) }}
            </div>
        </div>
        <div class="request-panel-content">
            <DecodePanel v-if="showDecodePanel" />
            <RequestPanel v-if="currentItem && showDecodePanel == false" :requestItem="currentItem" />
        </div>

    </div>
</div>
</template>

<script>
import RequestPanel from "../components/RequestPanel";
const { ipcRenderer } = require('electron');
import {parseQueryStr} from "../../module/query"
import { MessageBox } from 'element-ui';
import DecodePanel from "../components/DecodePanel";
const envConfig = [
    {
        value: 'production',
        label: '正式环境'
    },
    {
        value: 'preview',
        label: '预上线环境'
    },
    {
        value: 'development',
        label: '测试环境'
    },
]
export default {
name: "tool",
    components: {DecodePanel, RequestPanel },
    data() {
        return {
            url:"https://weixin.sxyygh.com/#/patient/home",
            requestDatas:[],
            currentIdx:-1,
            currentItem:null,
            env:"production",
            envOptions:envConfig,
            showDecodePanel:false,
        }
    },
    created() {
        // 检测代理服务器是否可用
        ipcRenderer.send("CHECKPROXY")
        ipcRenderer.on('CURRENTURL',(event,arg)=>{
            const paramsStr = arg.split("?")[1]
            const url = arg.split("?")[0]
            console.log(paramsStr);

            this.url = decodeURIComponent(url + "?" + parseQueryStr(paramsStr))
        })
        ipcRenderer.on("REQUEST",(event,arg)=>{
            console.log("data:",arg)
            this.requestDatas.push(arg)
        })
        ipcRenderer.on("PROXYISENABLE",(event,arg)=>{
            console.log("PROXYISENABLE",arg)
            if (arg === true) {
                this.envOptions = envConfig
            }else {
                this.envOptions = [{
                    value: 'production',
                    label: '代理服务器不可用'
                }]
            }

        })
        // 服务器证书是否安装
        ipcRenderer.on('PROXYCERTISINSTALL',(event,arg)=>{

            console.log("PROXYCERTISINSTALL")
            if (arg == false) {
                MessageBox.alert('首次使用需要安装代理服务器证书', '需要安装证书', {
                confirmButtonText: '确定',
                callback: action => {
                    ipcRenderer.send("OPENCERTWINDOW")
                }})
            }
        })
    },
    methods: {

        envChange(value) {
            ipcRenderer.send("CHANGEENV",value)
        },
        clearUrl() {
            this.requestDatas = []
        },
        getLastPath(url) {
            return url.split('/').pop()
        },
        urlClick(index) {
            console.log(index)
            this.showDecodePanel = false
            this.currentIdx = index
            this.currentItem = this.requestDatas[index]
        },
        changeUrl(value) {
            ipcRenderer.send("URLCHANGE",this.url)
            const paramsStr = value.split("?")[1]
            const url = value.split("?")[0]
            console.log(paramsStr);
            this.url = decodeURIComponent(url + "?" + parseQueryStr(paramsStr))
        },
        decodeStr(){
            this.showDecodePanel = true
        }
    }
}
</script>

<style scoped>
.panel {
    display: flex;
    flex-direction: row;
    flex:1;
}
.panel-url-content {
    width: 200px;
    overflow: scroll;
    flex-shrink:0;
}
.panel-url {
    color:#7A1784;
    font-size: 15px;
    cursor:pointer;
    padding:4px 6px;
}
.panel-url-selected {
    background-color: #3B9D6C;
    color: white;
    cursor:pointer;
    padding:4px 6px;
}
.request-panel-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}
.url-panel {
    display: flex;
    flex-direction: row;
}
</style>
