import request from '@/utils/request'

export async function login(username, pwd, face) {
  const rec_img = await rec(username, pwd)
  console.log('rec_img:\n' + rec_img)
  return match(rec_img, face)
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: 'user/logout',
    method: 'get'
  })
}

export function signUp(username, checkpwd, img, pwd, appendant) {
  return request({
    url: '/signup',
    method: 'post',
    data: {
      img_base64: img,
      username: username,
      checkpwd: checkpwd,
      pwd: pwd,
      appendant: appendant
    }
  })
}

export function chooseApd(pwd, appendant, image, checkpwd) {
  return request({
    url: '/test',
    method: 'post',
    data: {
      pwd: pwd,
      appendant: appendant,
      img_base64: image,
      checkpwd: checkpwd
    }
  })
}

export function crop(img) {
  return request({
    url: '/detect',
    method: 'post',
    data:
    {
      img_base64: img,
      mask: true
    }

  })
}

export async function rec(username, pwd) {
  return new Promise(resolve => {
    request({
      url: '/rec',
      method: 'post',
      data:
      {
        username: username,
        pwd: pwd,
        checkpwd:false
      }
    }).then(res => {
      resolve(res.rec_img)
    })
  })
}

export function match(img_db, img_crop) {
  return request({
    url: '/match',
    method: 'post',
    data:
    {
      img1_base64: img_db,
      img2_base64: img_crop,
      live2: "NORMAL"
    }

  })
}

export function checkUsername(username) {
  return request({
    url: '/checkusername',
    method: 'post',
    data:
    {
      username: username
    }
  })
}
