<template lang="pug">
    el-container.storage
        el-main.storage-main
            el-card.card.operations(:body-style="{padding:'15px',display:'flex','justify-content':'space-between'}")
                .button-group
                    el-button(@click="handleCd('..')", size='small', type='primary', icon='el-icon-arrow-up', :loading='folderIsLoading', :disabled="current_sub_path.trim() === ''", style='margin-right: 10px;')
                        | 去父级目录

                    <!--el-button(size='small', type='primary', icon='el-icon-circle-plus-outline', style='margin-right: 10px;')-->
                    <!--| 新建目录-->

                    el-upload(:action='full_path_upload_to', :on-success='handleFileUploadedSuccess', :on-error='handleFileUploadedFailed', :show-file-list='false', :multiple='false')
                        el-button(size='small', type='primary', icon='el-icon-upload') 上传文件
                el-input(placeholder='过滤文件名', suffix-icon='el-icon-search', size='small', clearable='', v-model='input_file_filter')
            el-card.card(:body-style="{padding:'15px'}")
                .input-dir(style='font-family: monospace;')
                    el-input(placeholder='输入子路径', v-model='current_sub_path', :disabled='folderIsLoading', clearable='')
                        template(slot='prepend') {{home_path}}
                        el-button(@click='handleCd()', slot='append', :disabled="folderIsLoading || current_sub_path.trim() === ''", icon='el-icon-d-arrow-right')
            el-card.card.table-card(:body-style="{padding:'15px'}")
                el-table.storage-table(:data='folderData', :height='table_height', stripe='', :row-class-name='tableRowClassName', @row-click='handleRowClick')
                    el-table-column(label='名称', sort-by="['type','name']", sortable='')
                        template(slot-scope='scope')
                            // <i :class="scope.row.icon"></i>
                            img.icn(v-if="scope.row.icon === 'icon_folder'", :src='icon_folder')
                            img.icn(v-if="scope.row.icon === 'icon_file'", :src='icon_file')
                            span {{ scope.row.name }}
                    el-table-column(prop='modified_time_readable', label='修改日期', width='250', :sort-method='sortModifiedTime', sortable='')
                    el-table-column(prop='size_readable', label='大小', width='100', :sort-method='sortSize', sortable='')
                    el-table-column(label='操作', width='180')
                        template(slot-scope='scope')
                            el-button(size='mini', type='danger', icon='el-icon-delete', @click='handleDeleteFile(scope.$index, scope.row)')
                                | 删除
                            el-button(v-if="scope.row.type == 'f'", size='mini', plain='', icon='el-icon-download', @click='handleDownloadFile(scope.$index, scope.row)')
                                | 下载

</template>

<script>
  import {baseURL} from '@/conf/env'
  import API from '@/service/api'
  import filesize from 'filesize'
  import {compact, sortBy, map, debounce} from 'lodash'
  import format from 'date-fns/format'

  import ElCard from "element-ui/packages/card/src/main";
  import icon_folder from '@/assets/images/folder-documents.svg'
  import icon_file from '@/assets/images/text-x-script.svg'

  const zh_cn = require('date-fns/locale/zh-CN');

  export default {
    name: 'Storage',
    metaInfo: {
      titleTemplate: '%s-数据存储'
    },
    data: function () {
      return {
        icon_folder,
        icon_file,
        current_sub_path: '',
        current_path_content: {
          name: '',
          children: []
        },
        folderIsLoading: false,
        input_file_filter: '',
        table_height: this.resizeHandler()
      }
    },
    computed: {
      home_path() {
        return `${this.$store.state.user.parentDir}/`;
      },
      full_path() {
        return this.home_path + this.current_sub_path;
      },
      full_path_upload_to() {
        console.log(`full_path_upload_to: ${baseURL}/uploads?path=${this.full_path}` + (this.current_sub_path ? '/' : ''));
        return `${baseURL}/uploads?path=${encodeURIComponent(this.full_path)}`;
      },
      folderData() {
        return sortBy(map(this.current_path_content.children, (entry) => {
          // console.log(entry);
          entry.modified_time = Number(entry.modified_time);
          // entry.icon = entry.type === 'd' ? 'el-icon-message' : 'el-icon-document';
          entry.icon = entry.type === 'd' ? 'icon_folder' : 'icon_file';
          entry.size_readable = entry.type === 'd' ? '' : filesize(entry.size, {base: 10, round: 0});
          entry.modified_time_readable = format(
            new Date(entry.modified_time),
            'YYYY[年]MMMD[日]Ah[点]mm[分]',
            {locale: zh_cn}
          );
          return entry;
        }), ['type', 'name']).filter((file) => file.name.toLowerCase().includes(String(this.input_file_filter).toLowerCase()))
      }
    },
    mounted: function () {
      console.log('Storage mounted()');
      this.current_sub_path = '';
      this.ls(this.full_path);
      this.table_height = this.resizeHandler();
      window.onresize = debounce(() => {
        this.table_height = this.resizeHandler();
      }, 300);
    },
    beforeDestroy: function () {
      window.onresize = undefined;
    },
    methods: {
      fetchData(what, param) {
      },
      resizeHandler() {
        return document.querySelector('#router_view').getBoundingClientRect().height - (20 + 64 + 50 + 20 + 30);
      },
      ls(path) {
        this.current_path_content.name = path;
        API.ls(path).then(res => {
          this.current_path_content.children = res;
          // loading.close();
        }, err => {
          console.log(`err: `, err);
          loading.close();
          this.$notify({
            message: `${err}`,
            type: 'error',
            duration: 2000
          });
        });
      },
      handleCd(dir) {
        console.log(`handleCd(): ${this.current_sub_path}`);
        let sub_path = this.current_sub_path.trim();
        if (sub_path.length === 0) {
          if (!dir || dir === '..') {
            return false;
          }
        }
        let sub_path_arr = compact(sub_path.split('/'));
        if (sub_path_arr.length === 0) {
          if (!dir || dir === '..') {
            return false;
          }
        }
        console.log(this.home_path + sub_path_arr.join('/'));

        if (!dir) {
          console.log(this.home_path + sub_path_arr.join('/'));
          this.current_sub_path = sub_path_arr.join('/');
        } else if (dir !== '..') {
          console.log(this.home_path + sub_path_arr.join('/') + `${dir}`);
          sub_path_arr.push(`${dir}`);
          this.current_sub_path = sub_path_arr.join('/');
        } else {
          console.log(`dir: ${dir}`);
          sub_path_arr.pop();
          this.current_sub_path = sub_path_arr.join('/');
        }

        this.folderIsLoading = true;
        let loading = this.$loading({
          target: '.storage-table',
          lock: true,
          text: '正在获取数据。。。',
          background: 'rgba(255,255,255,0.5)'
        });
        setTimeout(() => {
          loading.close();
          this.folderIsLoading = false;
        }, 300);
        return this.ls(this.full_path);

      },
      tableRowClassName({row, rowIndex}) {
        return row.type === 'd' ? 'folder-row' : 'file-row';
      },
      sortSize(a, b) {
        return Number(a.size) - Number(b.size);
      },
      sortModifiedTime(a, b) {
        return Number(a.modified_time) - Number(b.modified_time);
      },
      handleRowClick(row, event, column) {
        console.log(`handleRowClick(`, column.label, row.type, ')');
        event.stopPropagation();
        if (column.label === '操作' || row.type === 'f') {
          return false;
        }
        return this.handleCd(row.name);
        // this.$emit('rowClick', row);
      },
      handleDownloadFile() {
        console.log(`handleDownloadFile() => ${baseURL}/download?path=${this.full_path}` + (this.current_sub_path ? '/' : '') + `${arguments[1].name}`);
        return window.open(`${baseURL}/download?path=${this.full_path}` + (this.current_sub_path ? '/' : '') + `${arguments[1].name}`, '_blank');
      },
      handleDeleteFile() {
        console.log(`handleDeleteFile(${arguments[1].name})`);
        this.$confirm(`继续删除${arguments[1].name}?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => API.deleteFile(`${this.full_path}` + (this.current_sub_path ? '/' : '') + `${arguments[1].name}`)).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!',
            duration: 2000
          });
          return this.ls(this.full_path);
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '删除已取消'
          });
          return this.ls(this.full_path);
        });
      },
      handleFileUploadedSuccess(response, file, fileList) {
        console.log(response, file, fileList);
        this.$message({
          type: 'success',
          message: `上传${file.name}成功!`
        });
        return this.ls(this.full_path);
      },
      handleFileUploadedFailed(err, file, fileList) {
        return this.$message.error(`上传${file.name}失败!`)
      }
    },
    components: {ElCard}
  }
</script>

<style lang="stylus" scoped>
    .storage
        background-color antiquewhite
        width 100%
        height 100%
        position relative

    .storage-main
        display flex
        flex-direction column
        padding 10px
        width 100%
        height 100%
        position relative
        overflow hidden

    .button-group
        display flex

    .card
        margin-bottom 10px
        flex-shrink 0

    .card:last-of-type
        margin-bottom 0
        flex-shrink 1

    .card.operations .el-input
        width 200px

    .storage-table
        padding 0
        width 100%

    .storage-table /deep/ .folder-row
        cursor pointer

    .icn
        width 20px
        height auto
        vertical-align text-bottom
        user-select none
        margin-right 0.5em

    .input-dir /deep/ .el-input__inner
        font-family monospace

</style>
