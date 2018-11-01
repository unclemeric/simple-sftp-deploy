# sftp-deploy
deploy

### Usage

- 引入
```
npm install https://github.com/unclemeric/sftp-deploy.git -S
```
- 使用
```
const sftpDeploy = require('sftp-deploy')
const path = require('path')
sftpDeploy.start({
  remote_path: '/data/webapps/xxx',//服务器项目根路径
  assets_path: path.resolve(__dirname,'./dist'),//编译后资源文件夹名称(需上传的文件夹)
  host: 'xxx.xxx.xxx.xxx',//ftp服务器ip
  port: '22',//端口,可不填(默认22)
  user: 'username',//ftp用户名
  password: 'password'//ftp密码
})
```
