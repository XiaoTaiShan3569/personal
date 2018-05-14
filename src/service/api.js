import network from '@/service/network'

export default {
  // 文档地址:  http://10.25.81.230:31082/swagger-ui.html
  // 根据userName验证用户是否存在及权限
  loginAICloud(cred) {
    // return network.get('auth.json');
    return network.post(`/auth`, cred);
  },
  // 登出AI Cloud
  logoutAICloud() {
    // return network.get('signout.json');
    return network.post(`/signout`, {});
  },
  // 修改密码
  changePasswd(obj) {
    return network.post(`/user/password`, obj);
  },

  // 根据用户路径删除文件，不能删除有文件的目录
  deleteFile(path) {
    // return network.get('deleteFileFailure.json');
    return network.delete(`/file`, {
      params: {
        path: path
      }
    });
  },
  // 根据用户路径获取目录及文件列表
  ls(path) {
    // return network.get('ls.json');
    return network.get(`/file`, {
      params: {
        path: path
      }
    });
  },
  // admin角色用户可以获取用户列表
  getUsers() {
    // return network.get('users.json');
    return network.get('/users');
  },
  // admin角色用户可以新增用户
  addUser(user) {
    // return network.get('users.json');
    return network.post(`/user`, user);
  },
  // admin角色用户可以删除用户
  delUser(user) {
    // return network.get('users.json');
    return network.delete(`/user`, {
      params: {userName: user.userName}
    });
  },
  // 训练项目List
  getProjects(userName, projectType) {
    // console.log(`getProjects(${userName})`)
    // return network.get('getProjects.json');
    return network.get(`/projects/${userName}/${projectType}`);
  },
  // 新增训练项目
  addProject(obj) {
    // return network.get('addProject.json');
    return network.post(`/projects`, obj);
  },
  // 删除训练项目
  delProject(proId) {
    return network.delete(`/projects/${proId}`);
  },
  // 项目对应训练List
  getTrains(obj) {
    // return network.get('getTrains.json');
    return network.get(`/apps`, {
      params: obj
    });
  },
  // 获取基础镜像列表
  getImages(type) {
    // return network.get('getImages.json');
    return network.get(`/images/${type}`);
  },
  // 命名新训练
  namingTrain(obj) {
    // return network.get('namingTrain.json');
    return network.post(`/app`, obj);
  },
  // 获取训练详情
  getTrainById(rProjectId) {
    return network.get(`/app/${rProjectId}`);
  },
  // 删除训练项目
  delTrain(trainId) {
    return network.delete(`/apps/${trainId}`);
  },
  // 构建镜像
  buildImage(obj) {
    let req = network.create({
      timeout: 60 * 1000
    });
    console.log(`buildImage(): `, req);
    return req.post(`/image/build`, obj);
  },
  // 部署镜像
  deployImage(obj) {
    let req = network.create({
      timeout: 60 * 5 * 1000
    });
    console.log(`deployImage(): `, req);
    return req.post(`/image/deploy`, obj);
  },
  // 获取训练日志
  getLog(obj) {
    // return network.get('getLog.json');
    return network.post('/logs', obj);
  },

  baseUploadToAddr(path) {
    return `${network.defaults.baseURL}${path}`
  },
  //模型预测 获得已添加预测
  getInference(obj) {
    // return network.get('getLog.json');
    return network.get('/deploys',{
      params: obj
    });
  },
  //模型预测 添加预测 获得训练
  getInfTrains(obj) {
    // return network.get('getLog.json');
    return network.get('/trains',{
      params: obj
    });
  },

}
