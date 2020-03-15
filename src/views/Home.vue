<template>
  <div class="home">
    <h1 class="logo">
      <img src="../assets/logo.svg" /> Skynet Crypto Share
    </h1>
    <div class="container">
      <div class="transfer" :class="{'transfer-is-receive': isReceive}">
        <div class="transfer-file">
          <svg width="14" height="12" viewBox="0 0 14 12"><path d="M2 1h3.586a1 1 0 01.707.293l1.414 1.414A1 1 0 008.414 3H12a1 1 0 011 1v6a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" stroke-width="2" fill="none" fill-rule="evenodd"></path></svg>
          Share File
          <input type="file" class="file" @change="handleFileChange"/>
        </div>
        <div class="transfer-receive">
          <button @click="toggleReceive(true)" class="button btn-receive">RECEIVE</button>
          <div class="receive-input">
            <input type="text" v-model="code" @keyup.enter="handleDownload" autofocus>
            <a class="close" @click="toggleReceive(false)" />
          </div>
        </div>
      </div>
      <div class="files">
        <div class="upload-file" v-for="file in files" :key="file.uuid">
          <div class="upload-file-content">
            <div class="name">{{file.name}} ({{file.size}})</div>
            <div class="code" title="receive code" @click="copy(file.skylink, true)">{{file.skylink}}</div>
          </div>
          <button v-if="file.skylink" class="button" @click="copy(file.skylink)">Copy</button>
          <button v-else class="button loading">Process</button>
        </div>
      </div>
    </div>
    <div class="fork" @click="fork">
      <a>Fork</a>
    </div>
    <div class="tips" v-show="toastTips">{{toastTips}}</div>
    <vue-element-loading :active="loading" :is-full-screen="true"/>
  </div>
</template>
<script>
import copy from 'clipboard-copy';
import VueElementLoading from 'vue-element-loading'
import {download, upload} from '@/utils/skynet'
import share from "@/utils/share";
import {encryptFile} from "@/utils/crypto";

let id = 1;
export default {
  name: "Home",
  components: {
    VueElementLoading,
  },
  data() {
    return {
      code: '',
      isReceive: false,
      toastTips: '',
      tipsTimer: null,
      files: [],
      loading: false,
    }
  },
  methods: {
    addFile(file, uuid) {
      this.files.push({
        name: file.name,
        size: file.size,
        type: file.type,
        uuid,
        skylink: null,
      })
    },
    updateFile(file, uuid, skylink) {
      this.files = this.files.map(
        (item) => item.uuid === uuid ? {
          ...item,
          skylink,
        } : item
      )
    },
    removeFile(uuid) {
      this.files = this.files.filter(item => item.uuid !== uuid)
    },
    handleDownload() {
      this.loading = true
      download(this.code, share.key, 'xxx.png').finally(() => {
        this.loading = false
      }).catch(() => {
        this.toast('Failed! please check your code & link')
      })
    },
    handleFileChange(e) {
      const file = e.target.files[0];
      const uuid = ++id;
      this.addFile(file, uuid);
      this.loading = true
      encryptFile(file, share.key).then((blob) => {
        return upload(blob, file.name)
      }).then((res) => {
        this.updateFile(file, uuid, res.skylink);
      }, () => {
        this.toast('Failed! upload failed', 2000)
        this.removeFile(uuid)
      }).finally(() => {
        this.loading = false
      })
    },
    toggleReceive(status) {
      this.isReceive = status
      this.code = ''
    },
    copy(skylink, isPure) {
      if(isPure) {
        copy(skylink)
      } else {
        copy(`download link: ${share.link}  code is: ${skylink}`)
      }
      this.toast('copied!')
    },
    toast(text, time = 700) {
      this.toastTips = text;
      if(this.tipsTimer) {
        clearTimeout(this.tipsTimer)
        this.tipsTimer = null
      }
      this.tipsTimer = setTimeout(() => {
        this.toastTips = false
      }, time)
    },
    fork() {
      this.loading = true
      share.fork().then(() => {
        this.toast('Success!')
      }).finally(() => {
        this.loading = false
      })
    }
  }
};
</script>
<style src="./index.scss" lang="scss"></style>
