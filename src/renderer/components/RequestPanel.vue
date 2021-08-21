<template>
    <div class="request-panel-content">
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane style="overflow: scroll;max-height: 400px;" label="Request" name="request">
                <div class="item-title">Request URL</div>
                <div class="item-value">{{ requestItem.response.url }}</div>

                <div class="item-title">Request Payload Decode</div>
                <json-viewer :copyable="true" v-if="requestItem.postData" :value="JSON.parse(decryptUrlParams(requestItem.postData))"></json-viewer>

                <div class="item-title">Request Payload Origin</div>
                <json-viewer :copyable="true" v-if="requestItem.postData" :value="JSON.parse(requestItem.postData)"></json-viewer>

            </el-tab-pane>
            <el-tab-pane style="overflow: scroll;max-height: 400px;" label="Response" name="response">
                <div class="item-title">Response Decode</div>
                <json-viewer :copyable="true" v-if="requestItem.response.body.body" :value="JSON.parse(decryptResponseData(requestItem.response.body.body))"></json-viewer>

                <div class="item-title">Response Origin</div>
                <json-viewer :copyable="true" v-if="requestItem.response.body.body" :value="JSON.parse(requestItem.response.body.body)"></json-viewer>

            </el-tab-pane>
            <el-tab-pane style="overflow: scroll;max-height: 400px;" label="Local Storage" name="storage">
                <el-table
                    max-height="400"
                    :data="localStorageDatas.filter(data => !searchLocalStroage || data.key.toLowerCase().includes(searchLocalStroage.toLowerCase()))"
                    style="width: 100%">
                    <el-table-column
                        label="Key"
                        prop="key"
                        width="180">
                    </el-table-column>
                    <el-table-column
                        label="Value"
                        width="180">
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.value" @change="localStorageChange(scope.row)" placeholder="请输入内容"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column width="180">
                        <template slot="header" slot-scope="scope">
                            <el-input
                                v-model="searchLocalStroage"
                                size="mini"
                                placeholder="输入关键字搜索"/>
                            <el-button
                                size="mini"
                                type="primary"
                                @click="dialogFormVisible = true">新增</el-button>
                        </template>
                        <template slot-scope="scope">
                            <el-button
                                size="mini"
                                type="danger"
                                @click="handleDeleteStroage(scope.$index, scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane style="padding:24px;" label="切换用户" name="switch">
                <div class="item-title">登录历史</div>
                <el-radio-group style="display: flexflex-direction: column;" v-model="currentUserid" @change="switchUser">
                    <el-radio v-for="user in users" :label="user.userid">{{ user.username }}</el-radio>
                </el-radio-group>

            </el-tab-pane>
        </el-tabs>
        <el-dialog title="新增 local stroage" :visible.sync="dialogFormVisible">
            <el-form :model="form">
                <el-form-item label="key" label-width="100">
                    <el-input v-model="form.key" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="value" label-width="200">
                    <el-input v-model="form.value" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="onSubmitLocalStroage">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import encryptModule from '/src/module/encryptModule'
const { ipcRenderer } = require('electron');
export default {
name: "RequestPanel",
    props: {
        requestItem:{
            type:Object,
            default:()=>{
                return {}
            }
        }
    },
    mounted() {
        ipcRenderer.on("LOCALSTORAGEDATAS",(event,arg)=>{
            this.localStorageDatas = arg
        })
        ipcRenderer.on("USERS",(event,arg)=>{
            console.log(arg)
            this.users = arg
        })
        ipcRenderer.on("CURRENTUSERID",(event,arg)=>{
            console.log(arg)
            this.currentUserid = arg
        })
        ipcRenderer.send("GETCURRENTUSERID")
    },
    data() {
        return {
            activeName: 'request',
            localStorageDatas:[],
            searchLocalStroage:'',
            dialogFormVisible:false,
            users:[],
            currentUserid:'',
            form:{
                key:'',
                value:''
            }
        }
    },
    methods: {
        switchUser(userid) {
            console.log(userid)
            const user = this.users.find((u)=>{
                return u.userid == userid
            })
            if (user) {
                ipcRenderer.send("SWITCHUSER",user)
            }
        },
        handleClick(tab, event) {
            console.log(tab, event);
            if (tab.index == 2) {
                ipcRenderer.send("GETLOCALSTORAGE")
            }else if(tab.index == 3) {
                ipcRenderer.send("GETUSERS")
            }
        },
        onSubmitLocalStroage() {
            console.log(this.form)
            ipcRenderer.send("SETLOCALSTORAGE",this.form)
            this.localStorageDatas.splice(0,0,this.form)
            this.form = {
                key:'',
                value:''
            }
            this.dialogFormVisible = false
        },
        decryptResponseData(ret){
            console.log(ret)
            var json = ret
            if (typeof ret == "string") {
               json = JSON.parse(ret)
            }
            if (json && json.result && json.code == 1) {
                let encryptStr = encryptModule.j_img666555_d_m(json.result)
                return encryptStr
            }else {
                return ret
            }
        },
        handleDeleteStroage(index, row) {
            console.log(index, row);
            ipcRenderer.send("DELLOCALSTORAGE",row)
            this.localStorageDatas.splice(index,1)
        },
        localStorageChange(row) {
            console.log(row)
            ipcRenderer.send("SETLOCALSTORAGE",row)
        },
        decryptUrlParams(data) {
            if (!data) {
                return ""
            }
            var params = data
            if (typeof data == "string") {
                params = JSON.parse(data)
            }
            console.log(params)
            if (params.endec == 'on') {
                return encryptModule.j_img666555_d_m(params.params)
            }else {
                return data
            }
        },
    }
}
</script>

<style scoped>
.request-panel-content {
    padding:0px 24px;
    flex:1;
    display: flex;
}
.item-title {
    font-weight: bold;
    margin-bottom: 6px;
    margin-top: 6px;
}
.item-value {
    color: #333333;
    padding: 6px 0px;
    word-break: break-word;
}
</style>
