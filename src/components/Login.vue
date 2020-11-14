<template>
  <div class="login_container">
    <div class="login_box">
      <div class="login_box_container">
        <!-- 标题区域 -->
        <div class="login_top">
          <span>监利县稻虾共作物联网管理平台</span>
        </div>
        <!-- 登录表单区域 -->
        <el-form :model="loginForm" class="login_form">
          <!-- 用户名 -->
          <el-form-item>
            <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" show-password placeholder="请输入密码"></el-input>
          </el-form-item>
          <!-- 按钮 -->
          <span>
            <el-button type="primary" @click="login">登 录</el-button>
          </span>
        </el-form>
      </div>
    </div>
    <div class="login_footet">
      <span>版权所有©|监利县农业局|技术支持：武汉中迪联创科技有限公司</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {}
    }
  },
  created() {
    let that = this;
    document.onkeydown =function(e){
      e = window.event || e;
      //验证在登录界面和按得键是回车键enter
      if(that.$route.path === '/login' && (e.keyCode === 13 || e.which === 13)) {
        //登录函数
        that.login();
      }
    }
  },
  methods: {
    // 登录
    async login() {
      this.$changeHttp();
      const { data: res } = await this.$http.post('login', this.loginForm);
      const { data: res2 } = await this.$http.post('adminlogin', this.loginForm);
      if (!res.token) return this.$message.error(res.message);
      this.$message.success(res.message);
      // 1. 将登录成功之后的 token 保存到客户端的 sessionStorage 中
      //   1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问
      //   1.2 token 只应在当前网站打开期间生效，所以将 token 保存在sessionStorage 
      window.sessionStorage.setItem('token', res.token);
      window.sessionStorage.setItem('token2', res2.token);
      this.$router.push('/home');
      window.sessionStorage.setItem('username', this.loginForm.username);
      window.sessionStorage.setItem('password', this.loginForm.password);
      this.getUserInfo();
    },
    // 存储用户id
    async getUserInfo() {
      const { data: res } = await this.$http.get('user/' + window.sessionStorage.getItem('username'));
      if (!res) return this.$message.error('获取用户信息失败!');
      window.sessionStorage.setItem('userId', res.id);
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  // 容器样式
  .login_container {
    width: 100%;
    height: 100%;
    background-color: #2d3a4b;
  }

  // 登录框样式
  .login_box {
    width: 100%;
    height: 100%;
    position: relative;

    .login_box_container {
      width: 500px;
      height: 400px;
      position: absolute;
      left: 50%;
      top: 25%;
      transform: translateX(-50%);
    }
  }

  // 登录框顶部样式
  .login_top {
    width: 100%;
    height: 100px;
    color: #eee;
    font-size: 32px;
    font-weight: 600;
    text-align: center;
    line-height: 100px;
  }

  // 登录框表单样式
  .login_form {
    width: 100%;
    box-sizing: border-box;

    // 输入框样式 
    .el-input {
      width: 100%;
      margin: 10px auto;
    }

    // 按钮样式
    .el-button {
      width: 100%;
      height: 48px;
      font-size: 18px;
      margin-top: 10px;
    }
  }

  // 页面底部提示文字样式
  .login_footet {
    width: 100%;
    height: 60px;
    color: #fff;
    font-size: 12px;
    text-align: center;
    line-height: 60px;
    background-color: rgba(0, 0, 0, .2);
    position: absolute;
    left: 0;
    bottom: 0;
  }
</style>
<style lang="less">
  // 登录输入框样式
  .login_form .el-input .el-input__inner {
    background-color: transparent;
    border: 2px solid hsla(0,0%,100%,.1);
    height: 48px;
    color: #ddd;
    caret-color: #ddd;
  }
  .login_form .el-input .el-input__prefix {
    line-height: 48px;
  }
</style>
