const Client = require('ssh2-sftp-client')
const fs = require('fs')
const registConf = require('./sftp.config.js')
class Deploy {
  constructor() {
    this.localFileJson = []
    this.staticFilesPath = {
      folder: {
        local: '',
        remote: ''
      }
    }
    this.sftp = null
    this.handleFilePath = this.handleFilePath.bind(this)
    this.uploadFile = this.uploadFile.bind(this)
    this.start = this.start.bind(this)
  }
  // 处理文件路径，循环所有文件，如果是图片需要读取成Buffer类型
  handleFilePath(obj, type) {
    const { local, remote } = obj
    const files = fs.readdirSync(local)
    files.forEach(file => {
      const _lp = `${local}/${file}`
      type = fs.statSync(_lp).isFile() ? 'file' : fs.statSync(_lp).isDirectory() ? 'folder' : ''
      let item = {
        type: type,
        file: file,
        localPath: _lp,
        remotePath: `${remote}/${file}`
      }
      this.localFileJson.push(item)
      if (type === 'folder') {
        this.handleFilePath(
          {
            local: item.localPath,
            remote: `${remote}/${file}`
          },
          'folder'
        )
      }
    })
  }
  // 上传文件
  uploadFile() {
    Object.keys(this.staticFilesPath).forEach(key => {
      this.handleFilePath(this.staticFilesPath[key], key)
    })
    const tasks = this.localFileJson.map(item => {
      return new Promise((resolve, reject) => {
        if (item.type === 'folder') {
          this.sftp.mkdir(item.remotePath, false) // false:不设置递归创建文件夹
          resolve()
        } else {
          this.sftp
            .put(item.localPath, item.remotePath)
            .then(() => {
              console.log(`${item.localPath}上传完成`)
              resolve()
            })
            .catch(err => {
              console.error(err, `\n${item.localPath}上传失败`)
              resolve()
            })
        }
      })
    })
    console.log('开始上传...')
    return Promise.all(tasks)
  }
  start(options) {
    return new Promise(resolve => {
      this.localFileJson = []
      this.sftp = new Client()
      const config = registConf(options)
      this.staticFilesPath.folder = {
        local: config.assets_path,
        remote: config.remote_path
      }
      this.sftp
        .connect(config.options)
        .then(async data => {
          console.log('文件服务器连接成功')
          const deployFiles = () => {
            console.log(`准备创建项目根路目录${config.project_remote_path}`)
            await this.sftp.mkdir(config.project_remote_path, false) // false: 不设置递归创建文件夹
            console.log('正在上传...')
            this.uploadFile()
              .then(() => {
                console.log('------所有文件上传完成!-------\n')
                this.sftp.end()
                resolve()
              })
              .catch(err => {
                console.error('------uploadFile()=>上传失败,请检查!-------\n', '', err)
                this.sftp.end()
                resolve()
              })
          }
          if (config.is_bak) {
            const bakName = `${config.project_remote_path}-${new Date().getTime()}`
            console.log(`目录${config.project_remote_path}存在，准备备份为${bakName}`)
            this.sftp
              .rename(config.project_remote_path, bakName)
              .then(res => {
                deployFiles()
              })
              .catch(e => {
                console.log(`重命名文件夹${config.project_remote_path}}失败，目录不存在`)
                deployFiles()
              })
          } else {
            // 删除旧文件
            this.sftp
              .rmdir(config.project_remote_path, true)
              .then(res => {
                deployFiles()
              })
              .catch(e => {
                console.log(`删除目录${config.project_remote_path}失败`)
                deployFiles()
              })
          }
        })
        .catch(err => {
          console.error('start() catch error\n', error)
          this.sftp.end()
          resolve()
        })
    })
  }
}
module.exports = function(options) {
  this.start = new Deploy().start(options)
}
