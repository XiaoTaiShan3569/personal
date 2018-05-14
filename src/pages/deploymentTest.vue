<template lang="pug">
    el-container.ProjectDetails(v-loading='isLoadingTable')
        el-main.project-details-main

            //- 训练日志弹出框
            //- el-dialog.dialog-train-log(:visible.sync='dialog_train_log_visible', custom-class='dialog-train-log', width='61.8%', top='50px', append-to-body='', modal-append-to-body='', lock-scroll='', :show-close='true', :close-on-click-modal='false', :close-on-press-escape='false', close='handleCloseLog')
                //- .log-container
                    //- log(:train_status='train_status' , :podName='train_pod', :freq='5000', :timestamp='trainCreateDate', :switch='dialog_train_log_visible')

            // 新建训练弹出框
            el-dialog.dialog-build-image(:visible.sync='dialog_add_training_visible', width='800px', append-to-body='', modal-append-to-body='', lock-scroll='', :before-close="handleCloseDialogBuildImage", :show-close='false', :close-on-click-modal='false', :close-on-press-escape='false')
                // 标题栏
                div(slot='title')
                    el-steps(:active='at_step_add_training', simple='', finish-status='success')
                        el-step(title='输入训练名', icon='el-icon-circle-plus-outline')
                        el-step(title='构建镜像', icon='el-icon-edit')
                        el-step(title='部署镜像', icon='el-icon-upload')

                // 表单
                .form-container(v-loading='isBuildingImage')
                    // 第1步: 输入训练名
                    el-form(v-show='at_step_add_training === 0', :model='form_naming_train', :rules='rules_naming_deployment', ref='form_naming_train', element-loading-background='rgba(255, 255, 255, 0.1)', :disabled='isNamingTrain', :status-icon='true', label-position='left', label-width='200px', size='small')
                        |
                        el-form-item(label='选择训练:', prop='rprojectName')
                            el-select(v-model='form_naming_train.rprojectName', placeholder='请选择训练', :style="{'width': '300px'}")
                                el-option(v-for='train in develop_trainings_data', :label='train.rprojectName', :key='train.rprojectId', :value='train.rprojectName')
                                <!--el-input(v-model.trim='form_naming_train.rprojectName', auto-complete='off')-->
                        |
                        el-form-item.input-dir(label='训练目录')
                            <!--el-input(v-model='prependProjectDir' readonly="")-->
                            el-tag(type="info" :style="{'width': '300px'}")
                                |{{prependProjectDir}}

                    |
                    // 第2步: 构建镜像
                    el-form(v-show='at_step_add_training === 1', :model='form_build_image', :rules='rules_build_image', ref='form_build_image', element-loading-background='rgba(255, 255, 255, 0.1)', :disabled='isBuildingImage || isTransformingFile', :status-icon='true', label-position='left', label-width='50%', size='small')

                        el-form-item(label='训练名:', prop='rprojectName')
                            el-input(v-model.trim='form_build_image.rprojectName', auto-complete='off', :style="{'width': '300px'}", disabled='')

                        el-form-item(label='选择镜像:', prop='imageName')
                            el-select(v-model='form_build_image.imageName', placeholder='请选择镜像', :style="{'width': '300px'}")
                                el-option(v-for='image in list_images', :label='image.imageName', :key='image.imageId', :value='image.imageName')

                        el-form-item(:label="'上传代码到 ' + upload_code_url_short", prop='uploaded_code')
                            el-upload(:action='upload_code_url', :on-progress='handleFileUploading', :on-success='handleCodeUploadedSuccess', :on-error='handleFileUploadedFailed', :show-file-list='true', :multiple='true', :disabled='form_build_image.rprojectName.length < 3 || !form_build_image.imageName')
                                el-button(type='primary', icon='el-icon-upload', :disabled='form_build_image.rprojectName.length < 3 || !form_build_image.imageName') 点击上传

                        el-form-item(:label="'上传训练数据到 ' + upload_data_url_short", prop='uploaded_data')
                            el-upload(:action='upload_data_url', :on-progress='handleFileUploading', :on-success='handleDataUploadedSuccess', :on-error='handleFileUploadedFailed', :show-file-list='true', :multiple='true', :disabled='form_build_image.rprojectName.length < 3 || !form_build_image.imageName')
                                el-button(type='primary', icon='el-icon-upload', :disabled='form_build_image.rprojectName.length < 3 || !form_build_image.imageName') 点击上传
                    |
                    // 第3步: 部署镜像
                    el-form.form-deploy-image(v-show='at_step_add_training === 2', :model='form_deploy_image', :rules='rules_deploy_image', ref='form_deploy_image', :status-icon='true', label-position='left', label-width='200px', size='small', :disabled='isTransformingFile')
                        |
                        .templates(v-show='!showCustomComputeResource')
                            .compute-resource-template(v-for='(tmpl, index) in tmpl_compute_resource', :key='index', @click="selectComputeResourceTemplate(index)", :class="{selected: index === selected_compute_resource_template}")
                                p
                                    span.left CPU:
                                    span.right {{tmpl.requestCPU}} 核
                                p
                                    span.left 内存:
                                    span.right {{tmpl.requestMemory}}
                                p
                                    span.left GPU:
                                    span.right {{tmpl.gpu}} 个
                        |
                        el-form-item(v-if='form_deploy_image.jupyterPasswd !== undefined', label='Jupyter密码:', prop='jupyterPasswd')
                            el-input(v-model='form_deploy_image.jupyterPasswd', type="password", auto-complete="off")
                        |
                        el-form-item(label='启用TensorBoard:')
                            el-switch(v-model='form_deploy_image.tensorboard', active-color='#13ce66')
                        |
                        .forty-sixty
                            .forty
                                el-form-item(:label="labelOfConfigParaServer")
                                    el-switch(v-model='form_deploy_image.enablePS', active-color='#13ce66')
                            .sixty
                                el-slider(v-model='form_deploy_image.env.ps', :step='1', :min='0', :max='3', :show-stops='true',:disabled='!form_deploy_image.enablePS')
                        |
                        .forty-sixty
                            .forty
                                el-form-item(:label="labelOfConfigWorker")
                                    el-switch(v-model='form_deploy_image.enableWorkers', active-color='#13ce66')
                            .sixty
                                el-slider(v-model='form_deploy_image.env.workers', :step='1', :min='0', :max='3', :show-stops='true', :disabled='!form_deploy_image.enableWorkers')
                        |
                        el-form-item(label='训练轮数:')
                            el-input-number(v-model.trim='form_deploy_image.env.train_num', :min='0', :step='1000', auto-complete='off')
                        |
                        el-form-item(label='命令行参数:')
                            el-input(v-model.trim='form_deploy_image.env.cmd', auto-complete='off')
                |
                |
                // 页脚
                |
                // 第1步: 输入训练名
                .dialog-footer(v-show='at_step_add_training === 0', slot='footer')
                    el-button(@click="cancelForm('form_naming_train')", :v-show='!isNamingTrain', :disabled='isNamingTrain', size='small')
                        | 取消
                    el-button(type='primary', @click="validateForm('form_naming_train')", :disabled='isNamingTrain', :loading='isNamingTrain', icon='el-icon-check', size='small')
                        | 下一步
                |
                // 第2步: 构建镜像
                .dialog-footer(v-show='at_step_add_training === 1', slot='footer')
                    el-button(@click="cancelForm('form_build_image')", :v-show='!isBuildingImage', :disabled='isTransformingFile || isBuildingImage', size='small')
                        | 取消
                    el-button(type='primary', @click="validateForm('form_build_image')", :disabled='disableBtnBuildImage', :loading='isBuildingImage', icon='el-icon-check', size='small')
                        | 下一步
                |
                // 第3步: 部署镜像
                .dialog-footer(v-show='at_step_add_training === 2', slot='footer')
                    el-button(@click="cancelForm('form_deploy_image')", :disabled='isTransformingFile || isBuildingImage', size='small')
                        | 取消
                    el-button(type='primary', @click="validateForm('form_deploy_image')", :loading='isBuildingImage', icon='el-icon-check', size='small')
                        | 完成


            el-row(type='flex', style='overflow: hidden;')
                //- 左侧菜单栏
                //- el-col.menu-wrapper(:sm='6', :md='6', :lg='4', :xl='3')
                //-    project-menu(:data='project_menu_data', :projectType="projectType")
                el-col(:sm='24', :md='24', :lg='24', :xl='24')
                    // 操作栏
                    el-card.card.operations(:body-style="{padding:'15px',display: 'flex','justify-content': 'space-between'}")
                        .button-group
                            el-button(size='small', type='primary', icon='el-icon-circle-plus-outline', style='margin-right: 10px;', @click='handleAddTrain')
                                | 新增训练
                            el-button(size='small', type='primary', icon='el-icon-refresh', @click='fetchData()', :disabled='isLoadingTable')
                                | 刷新

                        el-input(placeholder='过滤训练名', suffix-icon='el-icon-search', size='small', clearable='', v-model='input_trainings_filter')


</template>

<script>
    import {baseURL} from '@/conf/env'
    import API from '@/service/api'
    import ProjectMenu from '@/components/ProjectMenu'
    import Log from '@/components/Log'
    import {map, extend, assign, debounce, omit, find, isEmpty} from 'lodash'
    import Clipboard from 'clipboard'
    import format from 'date-fns/format'
    import ElCard from "element-ui/packages/card/src/main";
    import icon_clippy from '@/assets/images/clippy.svg'
    import ElRow from "element-ui/packages/row/src/row";
    import ElSwitch from 'element-ui/packages/switch/src/component';

    const zh_cn = require('date-fns/locale/zh-CN')

    export default {
        metaInfo: {
            titleTemplate: '%s-模型训练'
        },
        data(){
            return {
                isLoadingTable: false,
                isTransformingFile: false,
                icon_clippy: icon_clippy,
                trainings_data: [],
                list_images: [],
                dialog_add_training_visible: false,
                at_step_add_training: 0,
                selected_compute_resource_template: 0,
                tmpl_compute_resource: [{
                    requestCPU: 1,
                    requestMemory: '2 Gi',
                    gpu: 0
                }, {
                    requestCPU: 2,
                    requestMemory: '4 Gi',
                    gpu: 0
                }, {
                    requestCPU: 8,
                    requestMemory: '16 Gi',
                    gpu: 1
                }, {
                    requestCPU: 16,
                    requestMemory: '32 Gi',
                    gpu: 2
                }],
                form_naming_train: {
                    rprojectName: '',
                    namespace: '',
                    name: '',
                    projectType: this.projectType,
                    projectDir: '',
                    type: this.trainType
                },
                tmpl_form_build_image: {
                    rprojectName: '',
                    rprojectId: '',
                    name: '',
                    namespace: '',
                    imageName: '',
                    uploaded_code: false,
                    uploaded_data: false
                },
                form_build_image: {
                    rprojectName: '',
                    rprojectId: '',
                    name: '',
                    namespace: '',
                    imageName: '',
                    uploaded_code: false,
                    uploaded_data: false
                },
                rules_naming_deployment: {
                    rprojectName: [
                        {type: "string", required: true, message: '请输入目录名', trigger: 'blur'},
                        {min: 3, message: '长度在3个字符以上', trigger: 'blur'}
                    ]
                },
                rules_build_image: {
                    imageName: [
                        {type: 'string', required: true, message: '请选择镜像', trigger: 'change'}
                    ],
                },
                form_deploy_image: {
                    env: {
                        ps: 0,
                        workers: 0,
                        train_num: 0,
                        cmd: ''
                    },
                    replicas: 1,
                    type: this.trainType,
                    tensorboard: false,
                    enablePS: false,
                    enableWorkers: false,
                    jupyterPasswd: this.projectType === 'develop' ? '' : undefined
                },
                tmpl_form_deploy_image: {
                    env: {
                        ps: 0,
                        workers: 0,
                        train_num: 0,
                        cmd: ''
                    },
                    replicas: 1,
                    type: this.trainType,
                    tensorboard: false,
                    enablePS: false,
                    enableWorkers: false,
                    jupyterPasswd: this.projectType === 'develop' ? '' : undefined
                },
                rules_deploy_image:{}
            }
        }

    }
</script>

<style>

</style>