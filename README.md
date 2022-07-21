# README.md

## 一些说明

本文件夹为基于Vue框架的“见微”系统-员工打卡场景开发源码，开发基于vue-element-admin模板，其中人脸检测模块调用tracking.js，依赖包管理采用npm，运行前需通过`npm install`安装依赖库，请各位老师审阅。

## 几个重要的项目目录

**node_modules**				 依赖库

**src**
```
├─api
├─assets
│  ├─401_images
│  ├─404_images
│  ├─custom-theme
│  │  └─fonts
│  └─tracking					人脸检测库
├─components
├─router							路由配置页
│  └─modules
└─views							前端展示文件夹
    ├─dashboard				主页
    │  ├─admin		
    │  │  └─components
    │  │      ├─mixins
    │  │      └─TodoList
    │  └─editor
    ├─login							登录页
    │  └─components
```
