# simple-sftp-deploy

### Usage

- 引入

```
npm install simple-sftp-deploy -S
or
yarn add simple-sftp-deploy
```

- 使用

```
const ssd = require('simple-sftp-deploy')
const path = require('path')
ssd.deploy({
  is_bak: true, // 是否备份
  remote_path: '/data/webapps/xxx',//服务器项目根路径
  assets_path: path.resolve(__dirname,'./dist'),//编译后资源文件夹名称(需上传的文件夹)
  host: 'xxx.xxx.xxx.xxx',//ftp服务器ip
  port: '22',//端口,可不填(默认22)
  user: 'username',//ftp用户名
  password: 'password'//ftp密码
})
```
