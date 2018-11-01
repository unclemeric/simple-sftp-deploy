const Client = require('ssh2-sftp-client')
const fs = require('fs')
const registConf = require('./sftp.config.js')
const sftp = new Client()

const staticFilesPath = {
    folder: {
        local: '',
        remote: ''
    }
}
/**
 * 处理文件路径，循环所有文件，如果是图片需要读取成Buffer类型
 **/
let localFileJson = [];
function handleFilePath(obj, type) {
  const { local, remote } = obj;
  const files = fs.readdirSync(local);
  files.forEach(file => {
    const _lp = `${local}/${file}`;
    type = fs.statSync(_lp).isFile() ? 'file' : fs.statSync(_lp).isDirectory() ? 'folder' : '';
    let item = {
        type: type,
        file: file,
        // localPath: type !== "img" ? _lp : fs.readFileSync(_lp),
        localPath: _lp,
        remotePath: `${remote}/${file}`
    }
    localFileJson.push(item);
    if(type=='folder'){
        handleFilePath({
            local: item.localPath,
            remote: `${remote}/${file}`
        },'folder');
    }
  });
}
/**
 * 上传文件
 **/
function uploadFile() {
  Object.keys(staticFilesPath).forEach(key => {
      handleFilePath(staticFilesPath[key], key)
  })
  const tasks = localFileJson.map(item => {
    return new Promise((resolve, reject) => {
      if(item.type == 'folder'){
        sftp.mkdir(item.remotePath,false);//false:不设置递归创建文件夹
        resolve();
      }else{
        sftp
        .put(item.localPath, item.remotePath)
        .then(() => {
          console.log(`${item.localPath}上传完成`);
          resolve();
        })
        .catch(err => {
          console.log(`${item.localPath}上传失败`);
          reject();
        });
      }
    });
  });
  console.log('开始上传...')
  return Promise.all(tasks);
}
const start = function(options){
  const config = registConf(options);
  staticFilesPath.folder = {
      local: config.assets_path,
      remote: config.remote_path
  }
  sftp.connect(config.options)
  .then((data) => {
    console.log('ftp文件服务器连接成功');
    try {
      const bak_name = `${config.project_remote_path}-${new Date().getTime()}`
      console.log(`目录${config.project_remote_path}存在，准备备份为${bak_name}`);
      sftp.rename(config.project_remote_path, bak_name);
    } catch (e) {
      console.log(`目录${config.project_remote_path}不存在`);
    }
    console.log(`准备创建项目根路目录${config.project_remote_path}`);
    sftp.mkdir(config.project_remote_path, false);//false:不设置递归创建文件夹
    console.log('正在上传...');
    uploadFile()
      .then(() => {
        console.log('------所有文件上传完成!-------\n');
        sftp.end();
      })
      .catch(() => {
        console.error('------上传失败,请检查!-------\n');
        sftp.end();
      });
  })
  .catch(err => {
    console.error(err, 'catch error');
    sftp.end();
  });
}

module.exports = start;