<template>
  <el-container>
    <div style="margin: auto">
      <h2 style="text-align: center">登录页</h2>
      <div v-if="countFlag" id="countDown">
        <h2 style="text-align: center">请正视摄像头</h2>
      </div>
      <div class="video-box">
        <video
          id="video"
          width="640"
          height="480"
          preload
          autoplay
          loop
          muted
        />
        <canvas id="canvas" width="640" height="480" />
      </div>
      <canvas id="screenshotCanvas" width="640" height="480" />
      <!-- <el-button type="primary" @click="handleBegin" style="margin: 50px"
        >开始认证</el-button        倒计时开关去除，默认自动开始检测人脸
      > -->
    </div>
  </el-container>
</template>

<script>
import tracking from "@/assets/tracking/build/tracking.js";
import "@/assets/tracking/build/data/face-min.js";
import { crop } from "@/api/user";
import Cookies from "js-cookie";
import { setToken } from "@/utils/auth";

export default {
  data() {
    return {
      video: null,
      screenshotCanvas: null,
      uploadLock: true, // 上传锁
      image: "",
      username: "",
      countFlag: true,
      count: 3,
      time: 2,
      fail: 0,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    // 初始化设置
    init() {
      this.video = document.getElementById("video");
      this.screenshotCanvas = document.getElementById("screenshotCanvas");

      const canvas = document.getElementById("canvas");
      const context = canvas.getContext("2d");

      this.video.srcObject = window.stream;

      // 固定写法
      const tracker = new window.tracking.ObjectTracker("face");
      tracker.setInitialScale(4);
      tracker.setStepSize(2);
      tracker.setEdgesDensity(0.1);
      window.tracking.track("#video", tracker, {
        camera: true,
      });
      const _this = this;
      // 相机打开

      tracker.on("track", function (event) {
        // 检测出人脸 绘画人脸位置
        context.clearRect(0, 0, canvas.width, canvas.height);
        event.data.forEach(function (rect) {
          context.strokeStyle = "#0764B7";
          context.strokeRect(rect.x, rect.y, rect.width, rect.height);
          // 上传图片
          _this.uploadLock && _this.screenshotAndUpload();
        });
      });
    },
    // 上传图片
    screenshotAndUpload() {
      // 上锁避免重复发送请求
      this.uploadLock = false;
      console.log("have detected face...");
      // 绘制当前帧图片转换为base64格式
      const canvas = this.screenshotCanvas;
      const video = this.video;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Img = canvas.toDataURL("image/jpeg");

      // 使用 base64Img 请求接口即可
      console.log("base64Img:", base64Img);

      var username = Cookies.get("username");
      crop(base64Img).then((res) => {
        // 采集到合格人脸
        // alert(res.pwd);
        if (res.success == true) {
          var pwd = res.pwd;
          // this.video.srcObject = null;
          this.image = res.face_img;
          console.log("crop_img:", this.image);
          // 将人脸信息与账号密码一同完成login,服务方式loading
          const loading = this.$loading({
            lock: true,
            text: "登陆中，请稍后...",
            spinner: "el-icon-loading",
            background: "rgba(255, 255, 255, 0.9)",
          });
          this.$store
            .dispatch("user/login", {
              username: username,
              password: pwd,
              face: this.image,
            })
            .then((resolve) => {
              loading.close();
              console.log(resolve)
              if (resolve == 1) {
                this.$message({
                  type: "success",
                  message: "欢迎您 " + username + "!   今日已签到",
                });
                this.stopMediaStreamTrack();
                this.$router.push("/");
              } else if (resolve == 0) {
                this.$message({
                  type: "error",
                  message: "非本人登录",
                });
                this.stopMediaStreamTrack();
                this.$router.push("/");
              } else if (resolve == 2) {
                this.$message({
                  type: "error",
                  message: "活体检测失败，请重试",
                });
                this.fail++;
                this.uploadLock = true;
                if (this.fail == 3) {
                  this.$message({
                    type: "error",
                    message: "活体检测失败，请重新登录",
                  });
                  this.stopMediaStreamTrack();
                  this.$router.push("/");
                }
              }
              console.log(resolve);

              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
        }
      });

      // 请求接口成功以后打开锁
      // this.uploadLock = true;
    },
    handleBegin() {
      const that = this;
      const interval = window.setInterval(function () {
        --that.count;
        if (that.count === 0) {
          that.uploadLock = true;
          that.count = 3;
          window.clearInterval(interval);
        }
      }, 1000);
    },
    stopMediaStreamTrack() {
      if (typeof window.stream === "object") {
        //	this.videoEl是视频流容器，也就是video标签，需要在data中声明这个变量，然后在打开摄像头的方法中this.videoEl.srcObject = window.stream
        this.video.srcObject = null;
        window.stream.getTracks().forEach((track) => track.stop());
      }
    },
  },
};
</script>

<style scoped>
/* 绘图canvas 不需显示隐藏即可 */
#screenshotCanvas {
  display: none;
}

.video-box {
  position: relative;
  width: 640px;
  height: 480px;
}

video,
canvas {
  position: absolute;
  top: 0;
  left: 0;
  border: #000000 5px solid;
}
</style>
