<template lang="pug">
    .row()
        .column.logo
            router-link.link.col(:to="{path: '/'}")
                img(:src='logo_file')
        |
        .column.title
            span AI Cloud
        |
        .column.menu
            el-menu(mode='horizontal', background-color='#333644', text-color='#fff', active-text-color='#EA5505', :default-active='"/canvas"', router)
                el-menu-item( :index="'canvas'")
                    | canvas
                el-menu-item( :index="'canvas2'")
                    | canvas2
        |

</template>

<script>
  // @flow

  import logo_file from '@/assets/images/logo.jpg'

  export default {
    name: 'GlobalHeader',
    data() {

      return {
        logo_file,
      }
    },
    computed: {
    },
    methods: {
    }
  }
</script>

<style lang="stylus" scoped>
    header-height = 60px
    ping_an-orange = #EA5505

    .invisiable
        visibility hidden
        display none
        opacity 0
    .link
        height 100%
        display flex
        justify-content space-around
        align-items center
        background-color ping_an-orange
        user-select none
    .row
        display flex
        height 100%
        background-color #333644
        color #fff

        .column
            height 100%
            width auto

            &:first-of-type
                padding-left 10px
            &:last-of-type
                padding-right 10px
    .logo
        background-color ping_an-orange

        img
            display block
            flex-grow 0
            flex-shrink 0
            width 82px
            height auto
            max-height header-height
            user-select none

    .title
        justify-content center
        line-height header-height
        text-align center
        background-color ping_an-orange
        font-size 20px
        font-family Verdana
        font-weight bold
        color #fff
        user-select none
        padding 0 20px

    .menu
        flex-grow 1
</style>
