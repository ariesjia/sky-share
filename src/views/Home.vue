<template>
  <div class="home">
    <h1 class="logo">
      <img src="../assets/logo.svg" /> Skynet Share
    </h1>
    <div class="container">
      <div class="uploader">
        <div class="uploader-inner">
          <input type="file" @change="handleFileChange"/>
        </div>
      </div>
       <button @click="test">下载测试</button>
    </div>
  </div>
</template>

<script lang="ts">
import {download, upload} from '@/utils/skynet'
import share from "@/utils/share";

export default {
  name: "Home",
  components: {
  },
  data() {
    return {
      files: [],
    }
  },
  methods: {
    addFile(file: File, skylink: string) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      this.files.push({
        name: file.name,
        size: file.size,
        type: file.type,
        skylink,
      })
    },
    handleFileChange(e: any) {
      const file = e.target.files[0];
      upload(file, share.key).then((res) => {
        this.addFile(file, res.skyLink);
      })
    },
    test() {
      download('BAAMVAx6I7vLTCY_N19k7QQGlPwA-vPQAgYeoUW-BAPdbg', share.key, 'xxx.png')
    }
  }
};
</script>
<style src="./index.scss" lang="scss"></style>
