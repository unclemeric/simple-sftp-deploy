const registConf = function({ remote_path, assets_path, is_bak = false, host, port = '22', user, password }) {
  return {
    remote_path, // 服务器项目根路径
    assets_path, // 存放编译之后资源文件夹 此项目需同_config.yml的public_dir值一样 Vue项目为./dist
    options: {
      host, // ftp服务器ip
      port, // 端口
      user, // ftp用户名
      password, // ftp密码
      // privateKey: fs.readFileSync("C:/Users/laisf/.ssh/id_rsa"), // 私钥
      passphrase: '' //  私钥密码(为空)
    },
    is_bak, // 是否备份, 默认不备份
    project_remote_path: remote_path, // 项目服务器路径
    public_asset_path: assets_path // 指定需要上传的文件夹目录
  }
}

module.exports = registConf
