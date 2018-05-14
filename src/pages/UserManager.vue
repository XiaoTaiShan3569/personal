<template lang="pug">
    el-container.UserManager(v-loading='isLoading')
        el-main.user-manager-main
            el-dialog(title='新增用户', :visible.sync='dialog_add_user_visible', width='30%', :append-to-body='true')
                el-form(:model='form_add_user', :rules='rules', ref='form_add_user', :status-icon='true', label-position='top', size='small')

                    el-form-item(label='用户名', prop='userName')
                        el-input(v-model='form_add_user.userName')
                    el-form-item(label='角色', prop='role')
                        el-select(v-model='form_add_user.role', placeholder='请选择用户角色', style='width: 100%;')
                            el-option(v-for='role in roles', :label='role.name', :key='role.v', :value='role.v')
                    el-form-item(label='密码', prop='password')
                        el-input(v-model='form_add_user.password', type='password')

                .dialog-footer(slot='footer')
                    el-button(@click="cancelForm('form_add_user')") 取消
                    el-button(type='primary', @click="validateForm('form_add_user')", icon='el-icon-upload2', :loading='isSendingForm')
                        | 提交

            el-card.card.operations(:body-style="{padding:'15px',display: 'flex','justify-content': 'space-between'}")
                .button-group
                    el-button(size='small', type='primary', icon='el-icon-circle-plus-outline', style='margin-right: 10px;', @click='handleAddUser')
                        | 新增用户
                el-input(placeholder='过滤用户名', suffix-icon='el-icon-search', size='small', :clearable='true', v-model='input_users_filter')

            el-card.card(:body-style="{padding:'15px'}")
                el-table.user-table(:data='tableUsers', :height='table_height', :stripe='true', :border='true')
                    el-table-column(prop='userName', label='用户名', :sortable='true')
                        template(slot-scope='scope')
                            el-popover(trigger='hover', placement='right')
                                span ID: {{ scope.row.userId }}
                                div(slot='reference')
                                    | {{ scope.row.userName }}
                    el-table-column(prop='role', label='角色', align='center', width='120px', :sortable='true')
                        template(slot-scope='scope')
                            el-tag(v-if="scope.row.role === 'admin'", type='warning')
                                img.user-avatar.admin(:src='icon_admin_user')
                                | 管理员
                            el-tag(v-if="scope.row.role === 'normal'", type='info')
                                img.user-avatar.normal(:src='icon_normal_user')
                                | 普通用户
                    el-table-column(prop='createDate_converted', label='创建时间', width='220', :sort-method='sortCreateDate', :sortable='true')
                    el-table-column(prop='parentDir', label='主目录')
                    el-table-column(prop='training', label='训练目录')
                    el-table-column(prop='inference', label='部署目录')

</template>

<script>
  // @flow
  import API from '@/service/api'
  import {map, extend, assign, debounce, isEmpty} from 'lodash'
  import format from 'date-fns/format'
  import ElCard from "element-ui/packages/card/src/main";
  import icon_normal_user from 'material-design-icons/action/2x_web/ic_face_black_48dp.png'
  import icon_admin_user from 'material-design-icons/action/2x_web/ic_supervisor_account_black_48dp.png'

  const zh_cn = require('date-fns/locale/zh-CN')

  export default {
    name: 'UserManager',
    metaInfo: {
      titleTemplate: '%s-用户管理'
    },
    data() {
      return {
        isLoading: false,
        icon_normal_user: icon_normal_user,
        icon_admin_user: icon_admin_user,
        users_data: [],
        dialog_add_user_visible: false,
        roles: [{'v': 'admin', 'name': '管理员'}, {'v': 'normal', 'name': '普通用户'}],
        form_actions: {
          add_user: {
            api_name: 'addUser',
            display_name: '新增用户',
            form_name: 'form_add_user'
          }, modify_user: {
            api_name: '',
            display_name: '修改用户',
            form_name: ''
          }, del_user: {
            api_name: '',
            display_name: '删除用户',
            form_name: ''
          }
        },
        operation: 'add_user',
        tmpl_form_add_user: {
          userName: '',
          role: '',
          password: ''
        },
        form_add_user: {
          userName: '',
          role: '',
          password: ''
        },
        rules: {
          userName: [
            {type: "string", required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, message: '长度在3个字符以上', trigger: 'blur'}
          ],
          role: [
            {type: "string", required: true, message: '请选择用户角色', trigger: 'change'}
          ],
          password: [
            {type: "string", required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, message: '至少6个字', trigger: 'blur'}
          ]
        },
        isSendingForm: false,
        input_users_filter: '',
        table_height: this.resizeHandler()
      }
    },
    computed: {
      tableUsers: function () {
        return map(this.users_data, (v) => {
          return assign(v, {
            'userName': String(v.userName),
            'createDate_converted': format(
              new Date(v.createDate),
              'YYYY[年]MMMD[日]Ah[点]mm[分]',
              {locale: zh_cn}
            )
          })
        }).filter((user) => user.userName.toLowerCase().includes(String(this.input_users_filter).toLowerCase()))
      }
    },
    mounted() {
      this.fetchData();
      this.table_height = this.resizeHandler();
      console.log(this.resizeHandler());
      window.onresize = debounce(() => {
        this.table_height = this.resizeHandler();
      }, 300);
    },
    beforeDestroy: function () {
      window.onresize = undefined;
    },
    methods: {
      resizeHandler(): number {
        return document.querySelector('#router_view').getBoundingClientRect().height - (20 + 64 + 10 + 30);
      },
      fetchData() {
        let loading = this.$loading({
          target: '.UserManager',
          lock: true,
          text: '正在获取数据。。。',
          background: 'rgba(250,235,215,0.5)'
        });
        return API.getUsers().then(res => {
          this.users_data = res;
          loading.close();
        }, err => {
          console.error(`err: `, err);
          loading.close();
          this.$notify({
            message: `${err.message}`,
            type: 'error',
            duration: 2000
          });
        });
      },
      sortCreateDate(a: number, b: number): number {
        return Number(a.createDate) - Number(b.createDate);
      },
      handleAddUser() {
        console.log(`handleAddUser()`);
        this.operation = 'add_user';
        this.form_add_user = extend({}, this.tmpl_form_add_user);
        this.dialog_add_user_visible = true;
      },
      cancelForm(formName: string) {
        console.log(`cancelForm(${formName})`);
        this.$refs[formName].resetFields();
        this.form_add_user = extend({}, this.tmpl_form_add_user);
        this.dialog_add_user_visible = false;
      },
      validateForm(form: string) {
        console.log('validateForm(form): ', form);
        console.log(this.$refs[form]);

        this.$refs[form].validate((valid) => {
          console.log(`valid: `, valid);
          if (valid) {
            // alert('submit!');
            return this.postForm(this.form_add_user);
          } else {
            console.error('error submit!!');
            return false;
          }
        });
      },
      postForm(data) {
        console.log(`postForm(): `, data);
        API[this.form_actions[this.operation].api_name](data).then(res => {
          this.$notify({
            message: `${this.form_actions[this.operation].display_name}成功`,
            type: 'success',
            duration: 2000
          });
          this.isSendingForm = false;
          this.cancelForm(this.form_actions[this.operation].form_name);
          return this.fetchData();
        }, err => {
          console.log(`err: `, err);
          this.$notify({
            message: `${err.message}`,
            type: 'error',
            duration: 2000
          });
          this.isSendingForm = false;
        });
      }
    },
    components: {ElCard}
  }
</script>

<style lang="stylus" scoped>
    .UserManager
        background-color antiquewhite
        min-height 100%
        position relative

    .user-manager-main
        display flex
        flex-direction column
        padding 10px
        width 100%
        height 100%
        position relative
        overflow hidden

    .card
        margin-bottom 10px
        flex-shrink 0

    .card:last-of-type
        margin-bottom 0
        flex-shrink 1
        height calc(100% - 74px)

    .card.operations .el-input
        width 200px

    .user-table
        padding 0
        width 100%
        font-size 12px

    .user-avatar
        width 23px
        height 23px
        vertical-align middle

</style>
