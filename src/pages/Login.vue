<template lang="pug">
    el-container.login(:style='styleObj')
        el-main.login-main(@keyup.capture.enter="submit('form_login')")
            el-card(:body-style="{padding:'15px'}")
                .header(slot='header')
                    img.logo(:src='logo_file')
                    .title 平安银行AI云系统
                el-form(:model='form_login', :rules="rules", ref='form_login', size='small', :disabled='isLoading', label-position='left', label-width='70px')
                    el-form-item(label='用户名', prop='userName')
                        el-input(v-model='form_login.userName', :autofocus='true')
                    el-form-item(label='密码', prop='password')
                        el-input(v-model='form_login.password', type='password', @keyup.enter.native="submit('form_login')", auto-complete='off')
                    el-form-item.btn-grp
                        el-button(@click="submit('form_login')", :loading='isLoading', type='primary') 登录
                        el-button(@click="resetForm('form_login')", v-show='!isLoading') 取消
</template>

<script>
  import API from '@/service/api'

  // import CanvasBackgroundImg from '@/components/CanvasBackgroundImg'
  import logo_file from '@/assets/images/logo.png'
  import bg_file from '@/assets/images/bg_login.jpg'

  export default {
    name: 'Login',
    metaInfo: {
      titleTemplate: '%s-登录'
    },

    data: function () {
      return {
        logo_file,
        tmpl_form_login: {
          userName: '',
          password: ''
        },
        form_login: {
          userName: '',
          password: ''
        },
        rules: {
          userName: [
            {type: "string", required: true, message: '请输入用户名', trigger: 'blur'}
          ],
          password: [
            {type: "string", required: true, message: '请输入密码', trigger: 'blur'}
          ]
        },
        isLoading: false,
        styleObj: {
          'background-image': `url(${bg_file})`,
          'background-size': 'cover',
          'background-position': 'center',
          'background-repeat': 'no-repeat'
        }
      }
    },
    mounted() {

    },
    methods: {
      submit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.isLoading = true;
            return API.loginAICloud(this.form_login).then(res => {
              this.isLoading = false;
              this.$store.commit('SAVE_USER_INFO', res);
              return this.$router.push({name: 'development'})
            }, err => {
              this.isLoading = false;
              console.error(err);
              this.resetForm('form_login');
              this.$notify({
                message: `${err.message}`,
                type: 'error',
                duration: 2000
              });
            });
          } else {
            console.error('error submit!!');
            return false;
          }
        });

      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      }
    },
    components: {

    }
  }
</script>

<style lang="stylus" scoped>
    ping_an-orange = #EA5505

    .login
        display flex
        align-items center
        justify-content center
        background-color white
        position fixed
        top 0
        bottom 0
        left 0
        right 0
        width 100%
        height 100%
        z-index 10000

    .login-main
        flex-grow 0
        flex-shrink 0
        padding 0
        width 360px
        position relative
        overflow hidden
        z-index 10000

        /deep/ .el-card__header
            border-bottom none

        .header
            user-select none
            text-align center
            font-size 20px

        .logo
            width 60px
            height auto

        .title
            color ping_an-orange
            font-weight bolder
            margin 10px auto
            user-select none

        /deep/ .el-form-item__label
            user-select none

    .btn-grp
        display flex
        align-items center
        justify-content center


</style>
