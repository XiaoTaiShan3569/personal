<template lang="pug">
    .container

        .bar
            el-button(@click='refresh', :loading='isLoading', type='primary', icon='el-icon-refresh', size='mini')
                | 立即刷新
            el-button(@click='clear', type='danger', icon='el-icon-delete', size='mini')
                | 清空当前显示
            el-checkbox(v-model='auto_scroll_to_bottom', size='mini')
                | 自动滚动到新内容
            el-input.input-log-filter(v-model='input_log_filter', placeholder='过滤当前显示日志', size='mini', :clearable='true')

        .log
            el-table#logs_table(:data='tableData', :style='styleObj', :show-header='false', size='mini', :fit="true")
                el-table-column(prop='timeStamp', width='220')
                el-table-column(prop='log')
</template>

<script>
    import {extend, isEmpty} from 'lodash'
    import API from '@/service/api'

    export default {
        name: "Log",
        props: ['train_status', 'podName', 'timestamp', 'freq', 'switch'],
        data() {
            return {
                max_line: 5e3,
                auto_scroll_to_bottom: true,
                isLogEnd: false,
                isLoading: false,
                input_log_filter: '',
                logs: [],
                interval_id: null,
                req_conf: {
                    from: 0,
                    size: 10,
                    timestamp: null
                },
                styleObj: {
                    width: '100%',
                    height: '100%'
                }
            };
        },
        watch: {
            switch: function (val) {
                console.log(`switch: ${val}`);
                if (val) {
                    this.setTrainingMode();
                    this.pollingLog();
                } else {
                    this.req_conf.from = 0;
                    this.clear();
                    window.clearInterval(this.interval_id);
                }
            }
        },
        computed: {
            tableData() {
                return this.logs.filter(log => log.log.toLowerCase().includes(String(this.input_log_filter).toLowerCase()))
            }
        },
        mounted() {
            console.log('<Log/> mounted(): ', this.switch);
            // this.isTrainingMode();
            // this.setTrainingMode();
            // return this.pollingLog();
        },
        beforeDestroy: function () {
            this.stopPollingLog();
            this.clear();
        },
        methods: {
            isTrainingMode() {
                return (this.train_status === '10' ? true : false);
            },
            setTrainingMode() {
                if (this.isTrainingMode()) {
                    // debugger;
                    // 训练中
                    this.req_conf.timestamp = `${Date.now()}`;
                } else {
                    // debugger;
                    this.req_conf.timestamp = Number(this.timestamp)
                }
                console.log(`setTrainingMode() =>`, this.req_conf.timestamp);
            },
            fetchData(podName) {
                let $table = document.querySelector('#logs_table');
                this.isLoading = true;
                console.log(extend({}, this.req_conf, {podName: this.podName}));
                return API.getLog(extend({}, this.req_conf, {podName: this.podName})).then(res => {
                    console.log(`res: `, res);
                    this.isLoading = false;
                    if (!isEmpty(res.logs)) {
                        if (this.logs.length > this.max_line) {
                            this.logs = [];
                        }
                        res.logs.forEach(ele => this.logs.push(ele));
                        this.req_conf.from = res.from;
                    } else {
                        if (!this.isTrainingMode()) {
                            // debugger;
                            return this.stopPollingLog();
                        }
                    }
                    this.auto_scroll_to_bottom && this.$nextTick(() => {
                        $table.scrollTop = $table.scrollHeight - $table.clientHeight;
                    });
                }, err => {
                    console.error(`err: `, err);
                    this.isLoading = false;
                    this.$notify({
                        message: `${err}`,
                        type: 'error',
                        duration: 2000
                    });
                })
            },
            refresh() {
                if (this.isLoading === false) {
                    return this.fetchData(this.podName);
                }
            },
            clear() {
                return this.logs = [];
            },
            pollingLog() {
                this.fetchData(this.podName);
                return this.interval_id = setInterval(() => {
                    if (this.isTrainingMode() && this.isLoading === false) {
                        return this.fetchData(this.podName);
                    } else {
                        // 非训练中模式
                        if (!this.isLogEnd && this.isLoading === false) {
                            return this.fetchData(this.podName);
                        }
                    }
                }, Number(this.freq))
            },
            stopPollingLog() {
                this.req_conf.from = 0;
                window.clearInterval(this.interval_id);
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .container
        width 100%
        height 100%
        padding 0

    .bar
        display flex
        justify-content space-evenly
        align-items center
        padding 0 15px
        background-color #fff
        color #333644
        height 40px

    .bar > *
        margin 0 auto
        margin-right 10px

    .input-log-filter
        margin-right 0

    ::-webkit-scrollbar
        width 5px

    ::-webkit-scrollbar-thumb
        -webkit-border-radius 10px
        border-radius 10px
        background-color red

    .log::selection
        background-color rgba(248, 28, 229, 0.4)

    .log
        width 100%
        height calc(100% - 40px)
        overflow-x hidden
        overflow-y auto
        padding 0
        font-family Menlo, "DejaVu Sans Mono", Consolas, "Lucida Console", monospace
        font-variant-ligatures none
        white-space pre
        -webkit-font-smoothing subpixel-antialiased
        user-select text
        background-color black

        /deep/ .el-table::before
            height 0

        /deep/ .el-table {
            background-color black
            color #00D900
            overflow-y auto
            scroll-behavior smooth
        }
        /deep/ .el-table
            th, tr, td, th.is-leaf
                font-size 12px
                padding 2px 0
                background-color black
                color #00D900
                vertical-align text-top
                border-bottom 1px groove #666

        /deep/ .el-table--enable-row-hover .el-table__body tr:hover > td
            background-color black
        /deep/ .el-table .cell
            line-height 1rem
</style>
