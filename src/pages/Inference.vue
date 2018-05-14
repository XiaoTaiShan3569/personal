<template lang="pug">
    el-container.inference-list
        el-main.inference-list-main
            //- 新增预测弹出框表单
            el-dialog(title='新增预测', :visible.sync='dialog_add_inference_visible', :width='dialog_width', :append-to-body='true', :center='true', :show-close='false', :close-on-click-modal='false', :close-on-press-escape='false', )
                el-form(:model='form_add_inference', :rules='rules', ref='form_add_inference', size='small', :disabled='isSendingForm')
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
                    el-form-item(label='推断名称:', prop='servingModelName')
                        el-input(v-model.trim='form_add_inference.servingModelName', auto-complete='off', style='width:300px', :clearable='true')
                    |
                    el-form-item(label='选择镜像:', prop='image')
                        el-select(v-model='form_add_inference.image', placeholder='请选择镜像', :style="{'width': '300px'}")
                            el-option(v-for='image in list_images', :label='image.imageName', :key='image.imageId', :value='image.imageUrl')
                    |
                    el-form-item(label='选择训练:', prop='trainName')
                        el-select(v-model='form_add_inference.trainName', placeholder='请选择训练', :style="{'width': '300px'}")
                            el-option(v-for='train in list_trains', :label='train.rprojectName', :key='train.rprojectId', :value='train.rprojectId')
                    |
                    el-form-item.input-dir(label='模型路径:', prop='servingModelPath')
                            el-input(v-model.trim='form_add_inference.servingModelPath')
                                |
                                template(slot="prepend") {{prepend}}
                |
                .dialog-footer(slot='footer')
                    el-button(@click="cancelForm('form_add_inference')", size='small') 取消
                    el-button(type='primary', @click="validateForm('form_add_inference')", icon='el-icon-upload2', :loading='isSendingForm', size='small')
                        | 提交
            |
            el-card.card.operations(:body-style="{padding:'15px'}", style='margin-bottom: 10px;')
                .button-group
                    el-button(size='small', type='primary', icon='el-icon-circle-plus', style='margin-right: 10px;', @click='showForm')
                        | 新增预测
                    el-input(placeholder='过滤项目名', suffix-icon='el-icon-search', size='small', clearable='', v-model='input_proj_filter')
            |


            el-card.card(:body-style="{padding:'15px'}")
                |
                el-table.training-table(:data='proj_list', :height='table_height', stripe='', fit='')

                    el-table-column(prop='name', label='训练名', sortable='')
                    |
                    el-table-column(prop='createDate_converted', label='创建时间', :sort-method='sortCreateDate', sortable='')
                    el-table-column(prop='status', label='状态', align='center', )
                        template(slot-scope='scope')
                            el-tag(v-if="scope.row.status === '10'", type='success')
                                i.el-icon-success
                                |
                                | 成功
                            el-tag(v-if="scope.row.status === '20'", type='danger')
                                i.el-icon-error
                                |
                                | 失败
                    el-table-column(label='操作', align='center')
                        template(slot-scope='scope')
                            el-button-group
                                el-button(type='primary', size='mini', icon='el-icon-edit-outline', @click='handleDeleteProj(scope.$index, scope.row)')
                                    | 删除

            <!--el-row.loading-target(type='flex', :style="{height: table_height + 'px','overflow': 'hidden','margin-bottom': '10px'}")-->
                <!--|-->
                <!--el-col.empty-list-container(v-if='proj_list.length === 0', :span='24')-->
                    <!--.tip 暂无项目-->
                <!--|-->
                <!--el-col(v-if='proj_list.length !== 0', :span='24', :style="{'overflow-y': 'auto','overflow-x': 'hidden'}")-->
                    <!--el-row.proj-container(type='flex', :gutter='10')-->

                        <!--el-col(v-for='proj in proj_list', :xs='12', :sm='12', :md='8', :lg='6', :xl='4', :key='proj.proId', :style="{'margin-bottom': '10px'}")-->
                            <!--el-card.proj-card(:body-style="{padding:'15px'}")-->
                                <!--.card-header(slot='header')-->
                                    <!--span {{proj.servingModelName}}-->
                                <!--div(style='font-size: 13px;line-height: 30px;user-select: none;')-->
                                    <!--p.create-time 创建时间： {{proj.createDate_converted}}-->
                                <!--.button-group-->
                                    <!--el-button(size='mini', plain='', icon='el-icon-tickets', style='color: #303133;', @click='handleGoToProj(proj)')-->
                                        <!--| 训练列表-->

                                    <!--el-button(size='mini', type='danger', icon='el-icon-delete', @click='handleDeleteProj(proj)')-->
                                        <!--| 删除-->

</template>

<script>
    import API from '@/service/api'
    import router from '@/router'
    import {map, extend, assign, debounce, sortBy} from 'lodash'
    import format from 'date-fns/format'
    import ElCard from "element-ui/packages/card/src/main";

    const zh_cn = require('date-fns/locale/zh-CN');

    export default {
        name: 'Inference',
        metaInfo: {
            titleTemplate: '%s-模型预测'
        },
        props: ['projectType', 'trainType'],
        data: function () {
            let checkName = (rule, value, callback) => {

                let reg = /^[a-z]([-a-z0-9]*[a-z0-9])$/;
                if (!value) {
                    return callback(new Error('请输入名称'));
                }else if(value.length < 4){
                    callback(new Error('名称至少为4位'))
                }else if (reg.test(value)) {
                    callback();
                } else {
                    callback(new Error('请以字母开头，只能含有数字和字母'));
                }
            };
            return {
                isLoading: false,
                dialog_add_inference_visible: false,
                isSendingForm: false,
                showCustomComputeResource: false,
                selected_compute_resource_template: 0,
                tmpl_form_add_inference: {
                    servingModelName: ''
                },
                form_add_inference: {
                    servingModelName: '',
                    image: '',
                    trainName: '',
                    servingModelPath: '',
                },
                rules: {
                    servingModelName: [
                        {validator: checkName, trigger: 'blur',required: true},
                        //{required: true ,message: '请输入项目名'}
                        // {type: "string", required: true, message: '请输入项目名', trigger: 'blur'},
                        // {min: 3, message: '长度在3个字符以上', trigger: 'blur'}
                    ],
                    image: [
                        {required: true, message: '请选择镜像', trigger: 'change' }
                    ],
                    trainName: [
                        {required: true, message: '请选择训练', trigger: 'change' }
                    ],
                },
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
                projects_data: [],
                list_images:[],
                list_trains:[],
                prependTrain:'',
                chose_trains:{
                    userName:'',
                    projectType:'training'
                },
                input_proj_filter: '',
                table_height: this.resizeHandler(),
                dialog_width: this.resizeDialogHandler(),
            }
        },
        computed: {
            proj_list() {
                // console.log(this.filters)
                return sortBy(map(this.projects_data, (v) => {
                    return assign(v, {
                        createDate_converted: format(
                            new Date(v.createDate),
                            'YYYY[年]MMMD[日] Ah[点]mm[分]ss[秒]',
                            {locale: zh_cn}
                        )
                    })
                }), ['createDate']).filter((proj) => proj.name.toLowerCase().includes(String(this.input_proj_filter).toLowerCase()))
            },
            userName() {
                return this.$store.getters.user_name
            },
            selected_list_trains(){
                if(this.form_add_inference.trainName === '' || this.form_add_inference.trainName === undefined){
                    return []
                }else {
                    return this.list_trains.filter(item => {
                         return item.rprojectId == this.form_add_inference.trainName
                    })[0]
                }
            },
            prepend() {
                if(this.selected_list_trains.length === 0){
                    return ' '
                }else {
                    return this.selected_list_trains.workdir + '/output/'
                }

            }


        },

        mounted: function () {
            console.log(`<Inference/> mounted: this.projectType: ${this.projectType}, this.trainType: ${this.trainType}`);
            this.fetchData();
            this.getListImages();
            this.getInfTrains();
            this.table_height = this.resizeHandler();
            this.dialog_width = this.resizeDialogHandler();
            window.onresize = debounce(() => {
                this.table_height = this.resizeHandler();
                this.dialog_width = this.resizeDialogHandler();
            }, 300);
        },
        watch: {
            projectType() {
                console.log(`projectType changed`);
                this.fetchData();
            }
        },
        beforeDestroy: function () {
            window.onresize = undefined;
        },
        methods: {
            fetchData() {
                console.log(this.userName)
                let loading = this.$loading({
                    target: '.loading-target',
                    lock: true,
                    text: '正在获取数据。。。',
                    background: 'rgba(250,235,215,0.5)'
                });
                let INFERENCE_OBJ = {
                    "userName":this.userName,
                    "type":"tfserving"
                }

                return API.getInference(INFERENCE_OBJ).then(res => {
                    this.projects_data = res;
                    loading.close();
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
            sortCreateDate(a: number, b: number): number {
                return Number(a.createDate) - Number(b.createDate);
            },
            showForm() {
                console.log(`showForm()`);
                this.form_add_inference = extend({}, this.tmpl_form_add_inference);
                this.dialog_add_inference_visible = true;
                extend(this.form_add_inference, this.tmpl_compute_resource[this.selected_compute_resource_template]);
            },
            cancelForm(formName: string) {
                console.log(`cancelForm(${formName})`);
                this.$refs[formName].resetFields();
                this.form_add_inference = extend({}, this.tmpl_form_add_inference);
                return this.dialog_add_inference_visible = false;
            },
             selectComputeResourceTemplate(idx) {
                this.selected_compute_resource_template = idx;
                extend(this.form_add_inference, this.tmpl_compute_resource[this.selected_compute_resource_template]);
            },
            validateForm(formName: string) {
                const FORM_PARAMS = {
                    name: this.selected_list_trains.name,
                    namespace: this.selected_list_trains.namespace,
                    projectType: 'tfserving',
                    rprojectId: this.form_add_inference.trainName,
                    rprojectName: this.selected_list_trains.rprojectName,
                    limitCPU: this.form_add_inference.requestCPU,
                    limitMemory: this.form_add_inference.requestMemory,

                    imageType: 'tf',
                    target: "dev",
                    type: "tfserving",
                    revision: 1,
                };
                extend(this.form_add_inference,FORM_PARAMS );



                this.$refs[formName].validate((valid) => {
                    console.log(`valid: `, valid);
                    if (valid) {
                        return this.postForm(this.form_add_inference);
                    } else {
                        console.error('error submit!!');
                        return false;
                    }
                });
            },
            postForm(data) {
                console.log(`postForm(): `, data);
                this.isSendingForm = true;
                return API.deployImage(data).then(_ => {
                    this.fetchData();
                    this.$notify({
                        message: `新增预测成功`,
                        type: 'success',
                        duration: 1000
                    });
                    this.isSendingForm = false;
                    this.cancelForm('form_add_inference');
                }, err => {
                    console.error(`err: `, err);
                    this.$notify({
                        message: `${err.message}`,
                        type: 'error',
                        duration: 2000
                    });
                    this.isSendingForm = false;
                });
            },
            handleGoToProj(proj) {
                console.log(`handleGoToProj() ${JSON.stringify({
                    projectType: this.projectType,
                    trainType: this.trainType
                })}`);
                if (this.projectType === 'develop') {
                    return router.push({
                        name: 'development_details',
                        params: {name: proj.proName}
                    })
                } else {
                    return router.push({
                        name: 'project_details',
                        params: {name: proj.proName}
                    })
                }

            },
            handleDeleteProj(index, row) {
                console.log(`handleDeleteProj()`, index);
                console.log(`handleDeleteProj()`, row);



                this.$confirm(`<p>您确定删除<strong>${row.servingModelName}</strong></p>`, '提示', {
                    dangerouslyUseHTMLString: true,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    return API.delProject(row.rprojectId).then(res => {
                        this.fetchData();
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                    }, err => {
                        console.error(`err: `, err);
                        this.$notify({
                            message: `${err.message}`,
                            type: 'error',
                            duration: 2000
                        });
                    });

                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            resizeHandler() {
                return document.querySelector('#router_view').getBoundingClientRect().height - (20 + 64 + 10);
            },
            resizeDialogHandler(){
                let w = window.innerWidth;
                if(w > 800){
                    return Math.floor(w * 0.6) + 'px'
                }else {
                    return '800px'
                }
            },
            getListImages(){
                let image_type = 'tfserving';
                //let image_type = 'training';
                return API.getImages(image_type).then(res => {
                    this.list_images = res;
                });
            },
            getInfTrains(){
                this.chose_trains.userName = this.userName;
                return API.getInfTrains(this.chose_trains).then(res => {
                    this.list_trains = res
                })
            }
        },
        components: {ElCard}
    }

</script>

<style lang="stylus" scoped>
    .inference-list
        background-color antiquewhite
        width 100%
        height 100%
        position relative

    .inference-list-main
        padding 10px
        width 100%
        height 100%
        position relative
        overflow hidden

    .card.operations .el-input
        width 200px

    .proj-container
        flex-wrap wrap

        > .el-col
            height 165px
            overflow visible

    .proj-card
        will-change transform
        height calc(100% - 10px)
        margin-bottom 10px
        background-color #fff
        border none
        transition transform .2s ease-in-out

    .proj-card:hover
        transform scale(1.05)

    .proj-card /deep/ .el-card__header
        user-select none
        text-transform uppercase
        background #fafafa
        padding 10px 20px
        max-height 41px

    .proj-card .create-time
        overflow hidden;
        text-overflow ellipsis;
        white-space nowrap;

    .card-header
        line-height 20px
        font-size 16px
        overflow hidden
        text-overflow ellipsis

    .proj-card /deep/ .el-card__body
        height 116px
        display flex
        flex-direction column
        justify-content space-between

    .button-group
        display flex
        justify-content space-between

    .proj-card .button-group
        justify-content flex-end
        max-height 30px

    .empty-list-container
        display flex
        overflow hidden
        height 100%
        justify-content center
        align-items center

    .input-dir
        font-family monospace
        /deep/ .el-input.is-disabled .el-input__inner
            font-family monospace

     .templates
        display flex
        justify-content space-between
        margin-bottom 18px

    .compute-resource-template
        will-change border font-weight
        font-family monospace
        padding 10px
        width 120px
        margin 0
        border 2px dashed #c0c4cc
        border-radius 20px
        transition all ease-in-out .2s

    .compute-resource-template:hover, .compute-resource-template.selected
        cursor pointer
        border 2px solid #409EFF
        font-weight bold

    .compute-resource-template.selected
        cursor none

    .compute-resource-template p
        display flex
        margin 5px 0

        span
            width 50%

            &.left
                text-align right
                padding-right 1em

            &.right
                text-align left
                padding-left 1em

</style>