<template>
  <el-container>
    <el-header>
      <h1 id="header">注册页</h1>
    </el-header>
    <el-form
      ref="form"
      :model="form"
      label-width="160px"
      style="margin: 50px auto"
    >
      <el-form-item label="用户名">
        <el-input v-model="form.username" clearable />
      </el-form-item>
      <el-form-item label="是否采用生物密码">
        <el-radio-group v-model="form.checkpwd">
          <el-radio label="是" />
          <el-radio label="否" />
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="this.form.checkpwd == '否'" label="密码">
        <el-input v-model="form.pwd" show-password />
      </el-form-item>
      <el-form-item label="头像上传">
        <el-upload
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :on-change="handleUpload"
          :before-upload="beforeAvatarUpload"
          :auto-upload="false"
        >
          <img v-if="image" :src="image" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon" />
        </el-upload>
      </el-form-item>
      <el-form-item v-if="mask_img" label="遮罩图片">
        <img :src="mask_img" class="avatar">
      </el-form-item>
      <el-form-item v-if="patch_img" label="数据库存储图片">
        <el-image
          style="width: 100%; height: 100%"
          :src="patch_img"
          :fit="fill"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSignup">注册</el-button>
        <el-button>取消</el-button>
        <el-button type="primary" @click="handleJump">返回登录</el-button>
      </el-form-item>
    </el-form>
  </el-container>
</template>

<script>
import tracking from '@/assets/tracking/build/tracking-min.js'
import '@/assets/tracking/build/data/face-min.js'
import { signUp, chooseApd, checkUsername, crop } from '@/api/user'

export default {
  data() {
    return {
      form: {
        username: '',
        checkpwd: '是',
        pwd: ''
      },
      image: '',
      appendant: 2,
      mask_img: '',
      patch_img: ''
    }
  },
  methods: {
    handleSignup() {
      var checkpwd
      if (this.form.checkpwd == '是') checkpwd = true
      else checkpwd = false

      // 首先检查用户名是否重复
      checkUsername(this.form.username).then((res) => {
        // 不重复
        if (res.success == true) {
          // 服务方式loading
          const loading = this.$loading({
            lock: true,
            text: '注册中，请稍后...',
            spinner: 'el-icon-loading',
            background: 'rgba(255, 255, 255, 0.9)'
          })

          chooseApd(this.form.pwd, this.appendant, this.image, checkpwd).then(
            (res) => {
              if (res.success == false) {
                this.$message({
                  message: res.err_msg,
                  type: 'error'
                })
              } else {
                // 选定附加值
                this.appendant = res.appendant
                console.log('best apd:' + this.appendant)
                signUp(
                  this.form.username,
                  checkpwd,
                  this.image,
                  this.form.pwd,
                  this.appendant
                ).then((res) => {
                  if (res.success == true) {
                    loading.close()
                    this.$message({
                      message: '注册成功',
                      type: 'success'
                    })
                    this.mask_img = res.mask_img
                    this.patch_img = res.patch_img
                  }
                })
              }
            }
          )
        }
        // 重复
        else {
          this.$message({
            message: '用户名重复，请重新输入！',
            type: 'error'
          })
        }
      })
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    handleJump() {
      this.$router.push('/login')
    },
    getBase64(file) {
      // 把图片转成base64编码
      return new Promise(function(resolve, reject) {
        const reader = new FileReader()
        let imgResult = ''
        reader.readAsDataURL(file)
        reader.onload = function() {
          imgResult = reader.result
        }
        reader.onerror = function(error) {
          reject(error)
        }
        reader.onloadend = function() {
          resolve(imgResult)
        }
      })
    },
    handleUpload(file, fileList) {
      // 头像转b64
      this.getBase64(file.raw).then((b64) => {
        crop(b64).then((res) => {
          if (res.success == true) {
            if (this.form.checkpwd == '是')
            {
                this.form.pwd = res.pwd
            }
            this.$message({
              message: '裁剪成功',
              type: 'success'
            })
            this.image = res.face_img
            console.log('face_img:\n' + this.image)
          } else {
            this.$message({
              message: res.err_msg,
              type: 'error'
            })
          }
        })
      })
    }
  }
}
</script>

<style>
#header {
  text-align: center;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
