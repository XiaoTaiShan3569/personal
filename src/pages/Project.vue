<template lang="pug">
    el-container.training-container
        el-main.training-container-main
            <!--el-row.main-row(type='flex')-->
                |
                <!--//- 左侧菜单栏-->
                <!--el-col.menu-wrapper(:sm='6', :md='6', :lg='4', :xl='3')-->
                    <!--project-menu(:data='project_menu_data', :projectType="projectType")-->
                |
                <!--el-col(:sm='18', :md='18', :lg='20', :xl='21')-->
                    router-view/

</template>

<script>
    import ProjectMenu from '@/components/ProjectMenu'

    export default {
        name: 'Trainings',
        props: ["projectType", "trainType"],
        data: function () {
            return {}
        },
        computed: {
            project_menu_data() {
                return this.$store.state.project_list
            }
        },
        mounted() {
            console.log(`<Trainings/> mounted()`);
            if (!this.$store.state.project_list || !this.$store.state.project_list.length) {
                return this.$router.push({name: 'project'})
            }
        },
        components: {
            ProjectMenu
        }
    }
</script>

<style lang="stylus" scoped>
    .training-container
        background-color antiquewhite
        min-height 100%
        position relative

    .training-container-main
        display flex
        flex-direction column
        padding 10px
        width 100%
        height 100%
        position relative
        overflow hidden

        .main-row
            height 100%
            overflow hidden

    .menu-wrapper
        display flex
        align-items stretch
        padding-right 10px
        overflow-x hidden
        overflow-y auto

</style>
