<template lang="pug">
    canvas#canvas
</template>

<script>
  import icn_w from '@/assets/images/cloud_w.png'
  import icn_b from '@/assets/images/cloud_b.png'
  import icn_0 from '@/assets/images/cloud_0.png'
  import icn_1 from '@/assets/images/cloud_1.png'
  import icn_2 from '@/assets/images/cloud_2.png'
  import icn_3 from '@/assets/images/cloud_3.png'
  import icn_4 from '@/assets/images/cloud_4.png'
  import icn_5 from '@/assets/images/cloud_5.png'
  import icn_6 from '@/assets/images/cloud_6.png'
  import icn_7 from '@/assets/images/cloud_7.png'

  export default {
    name: "CanvasBackgroundImg",
    props: ['loading'],
    data() {
      return {
        icn_w,
        icn_b,
        icn_0,
        icn_1,
        icn_2,
        icn_3,
        icn_4,
        icn_5,
        icn_6,
        icn_7,
        w: 0,
        h: 0,
        matrix: []
      };
    },
    computed: {
      isLoading() {
        return Boolean(this.loading);
      }
    },
    mounted() {
      let canvas = document.getElementById('canvas');
      let canvas_size = this.resizeHandler();
      canvas.setAttribute('width', canvas_size.w);
      canvas.setAttribute('height', canvas_size.h);
      this.initCanvas(canvas_size);
      window.onresize = () => {
        let new_canvas_size = this.resizeHandler();
        canvas.setAttribute('width', new_canvas_size.w);
        canvas.setAttribute('height', new_canvas_size.h);
        this.initCanvas(new_canvas_size);
      }
    },
    beforeDestroy: function () {
      window.onresize = undefined;
    },
    methods: {
      resizeHandler() {
        const canvas = document.querySelector('#canvas');
        let size = {
          w: canvas.getBoundingClientRect().width,
          h: canvas.getBoundingClientRect().height
        };
        return size;
      },
      initCanvas(size) {
        const canvas = document.querySelector('#canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let dimsOfMatrix = () => {
          let m = Math.ceil(size.h / 75);
          let n = Math.ceil(size.w / 75);
          return {m, n}
        };
        let [m, n] = [dimsOfMatrix().m, dimsOfMatrix().n];

        let genMatrix = () => {
          for (let i = 0; i < m * n; i++) {
            this.matrix.push(Math.floor((Math.random() * m * n) % 8));
          }
        };
        genMatrix();

        let drawImgs = () => {
          this.matrix.forEach((num, idx) => {
            let img = new Image();
            img.src = this[`icn_${num}`];
            img.onload = () => ctx.drawImage(img, Math.floor((idx) / m) * 75, Math.floor(idx % (m)) * 75, 50, 50);
          });
        };

        drawImgs();
      }
    }
  }
</script>

<style lang="stylus" scoped>
    #canvas
        width 100%
        height 100%
</style>
