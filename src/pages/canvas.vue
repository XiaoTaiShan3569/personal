<template lang="pug">
   el-container.page
        el-main.main
            el-card.card_top(:body-style="{padding:'15px'}")
                input(type="file", @change="selectImg")
                el-button(size='mini', @click="canvas_primary")
                    | 原色
                el-button(size='mini', @click="canvas_transpose")
                    | 反转
                el-button(size='mini', @click="canvas_remove")
                    | 去色
                el-button(size='mini', @click="canvas_monochrome")
                    | 单色
                el-button(size='mini', @click="canvas_china")
                    | 中国画
                el-button(size='mini', @click="canvas_vague")
                    | 模糊
                el-button(size='mini', @click="canvas_reliefProcess")
                    | 浮雕

            el-card.card_img(:body-style="{padding:'15px',height:'100%'}")
                .img_wrap(:style="{height: canvas_wrap_height + 'px'}")
                     canvas.img(id="canvas")


</template>

<script>
    export default {
        name: "canvas",
        data(){
            return {
                base64:'',
                canvas: null,
                ctx: null,
                img:null,
                w:'',
                h:''

            }
        },
        mounted(){

        },
        computed:{
            canvas_wrap_height:function(){
                if(this.h === ''){
                    return '100%'
                }else {
                    return this.h
                }
            }
        },
        methods:{
            selectImg(val){
                const _this = this;
                if(!val.target.files || !val.target.files[0]){
                    return
                }
                let reader = new FileReader();
                reader.readAsDataURL(val.target.files[0])
                reader.onload = function(env){
                    _this.drapImg(env.target.result)
                }
            },
            drapImg(env){
                const _this = this;
                this.preloadImg(env).then(function(img){
                    _this.base64 = img.src;
                    _this.img = img;
                    _this.drawCanvas(img)
                }).catch(function(err){
                    console.log(err)
                })
            },
            drawCanvas(img){
                this.canvas = document.querySelector('#canvas');
                this.cxt = this.canvas.getContext('2d');
                this.w = img.width,this.h = img.height;
                this.canvas.width = this.w;
                this.canvas.height = this.h;
                this.cxt.clearRect(0, 0, this.w, this.h);
                this.cxt.drawImage(img, 0, 0, this.w, this.h);
                // this.canvas_transpose()

            },
            canvas_primary(){
                if(this.canvas === null)return;
                let canvas = this.canvas,cxt = this.cxt;

                this.drawCanvas(this.img)
            },
            canvas_transpose(){
                if(this.canvas === null)return;
                let canvas = this.canvas,cxt = this.cxt;

                this.drawCanvas(this.img)
                var imageData = cxt.getImageData(0, 0, this.w, this.h);
                var imageData_length = imageData.data.length / 4;
                // 解析之后进行算法运算
                for (var i = 0; i < imageData_length; i++) {
                    imageData.data[i * 4] = 255 - imageData.data[i * 4];
                    imageData.data[i * 4 + 1] = 255 - imageData.data[i * 4 + 1];
                    imageData.data[i * 4 + 2] = 255 - imageData.data[i * 4 + 2];
                }
                cxt.putImageData(imageData, 0, 0);
            },
            canvas_remove(){
                if(this.canvas === null)return;
                let canvas = this.canvas,cxt = this.cxt;
                this.drawCanvas(this.img)
                var imageData = cxt.getImageData(0, 0, this.w, this.h);
                var imageData_length = imageData.data.length / 4;
                // 解析之后进行算法运算
                for (var i = 0; i < imageData_length; i++) {
                    var red = imageData.data[i * 4];
                    var green = imageData.data[i * 4 + 1];
                    var blue = imageData.data[i * 4 + 2];
                    var gray = 0.3 * red + 0.59 * green + 0.11 * blue;
                    imageData.data[i * 4] = gray;
                    imageData.data[i * 4 + 1] = gray;
                    imageData.data[i * 4 + 2] = gray;
                }
                cxt.putImageData(imageData, 0, 0);
            },
            canvas_monochrome(){
                if(this.canvas === null)return;
                let canvas = this.canvas,cxt = this.cxt;
                this.drawCanvas(this.img)
                var imageData = cxt.getImageData(0, 0, this.w, this.h);
                var imageData_length = imageData.data.length / 4;
                // 解析之后进行算法运算
                for (var i = 0; i < imageData_length; i++) {
                    imageData.data[i * 4 + 1] = 0;
                    imageData.data[i * 4 + 2] = 0;
                }
                cxt.putImageData(imageData, 0, 0);
            },
            canvas_china(){
                if(this.canvas === null)return;
                let canvas = this.canvas,cxt = this.cxt;
                this.drawCanvas(this.img)
                var imageData = cxt.getImageData(0, 0, this.w, this.h);
                var imageData_length = imageData.data.length / 4;
                // 解析之后进行算法运算
                for (var i = 0; i < imageData_length; i++) {
                    var red = imageData.data[i * 4];
                    var green = imageData.data[i * 4 + 1];
                    var blue = imageData.data[i * 4 + 2];
                    var gray = 0.3 * red + 0.59 * green + 0.11 * blue;
                    var new_black;
                    if (gray > 126) {
                        new_black = 255;
                    } else {
                        new_black = 0;
                    }
                    imageData.data[i * 4] = new_black;
                    imageData.data[i * 4 + 1] = new_black;
                    imageData.data[i * 4 + 2] = new_black;
                }
                cxt.putImageData(imageData, 0, 0);
            },
            canvas_vague(){
                if(this.canvas === null)return;
                let canvas = this.canvas,cxt = this.cxt;
                this.drawCanvas(this.img)
                var imageData = cxt.getImageData(0, 0, this.w, this.h);
                var imageData_length = imageData.data.length / 4;
                // 解析之后进行算法运算
                cxt.putImageData(gaussBlur(imageData), 0, 0);
                function gaussBlur(imgData) {
                    console.log(imgData);
                    var pixes = imgData.data;
                    var width = imgData.width;
                    var height = imgData.height;
                    var gaussMatrix = [],
                        gaussSum = 0,
                        x, y,
                        r, g, b, a,
                        i, j, k, len;

                    var radius = 30;
                    var sigma = 5;

                    a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
                    b = -1 / (2 * sigma * sigma);
                    //生成高斯矩阵
                    for (i = 0, x = -radius; x <= radius; x++, i++){
                        g = a * Math.exp(b * x * x);
                        gaussMatrix[i] = g;
                        gaussSum += g;

                    }
                    //归一化, 保证高斯矩阵的值在[0,1]之间
                    for (i = 0, len = gaussMatrix.length; i < len; i++) {
                        gaussMatrix[i] /= gaussSum;
                    }
                    //x 方向一维高斯运算
                    for (y = 0; y < height; y++) {
                        for (x = 0; x < width; x++) {
                            r = g = b = a = 0;
                            gaussSum = 0;
                            for(j = -radius; j <= radius; j++){
                                k = x + j;
                                if(k >= 0 && k < width){//确保 k 没超出 x 的范围
                                    //r,g,b,a 四个一组
                                    i = (y * width + k) * 4;
                                    r += pixes[i] * gaussMatrix[j + radius];
                                    g += pixes[i + 1] * gaussMatrix[j + radius];
                                    b += pixes[i + 2] * gaussMatrix[j + radius];
                                    // a += pixes[i + 3] * gaussMatrix[j];
                                    gaussSum += gaussMatrix[j + radius];
                                }
                            }
                            i = (y * width + x) * 4;
                            // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
                            // console.log(gaussSum)
                            pixes[i] = r / gaussSum;
                            pixes[i + 1] = g / gaussSum;
                            pixes[i + 2] = b / gaussSum;
                            // pixes[i + 3] = a ;
                        }
                    }
                    //y 方向一维高斯运算
                    for (x = 0; x < width; x++) {
                        for (y = 0; y < height; y++) {
                            r = g = b = a = 0;
                            gaussSum = 0;
                            for(j = -radius; j <= radius; j++){
                                k = y + j;
                                if(k >= 0 && k < height){//确保 k 没超出 y 的范围
                                    i = (k * width + x) * 4;
                                    r += pixes[i] * gaussMatrix[j + radius];
                                    g += pixes[i + 1] * gaussMatrix[j + radius];
                                    b += pixes[i + 2] * gaussMatrix[j + radius];
                                    // a += pixes[i + 3] * gaussMatrix[j];
                                    gaussSum += gaussMatrix[j + radius];
                                }
                            }
                            i = (y * width + x) * 4;
                            pixes[i] = r / gaussSum;
                            pixes[i + 1] = g / gaussSum;
                            pixes[i + 2] = b / gaussSum;
                        }
                    }
                    console.log(imgData);
                    return imgData;
                }
            },
            canvas_reliefProcess(){
                if(this.canvas === null)return;
                let canvas = this.canvas,cxt = this.cxt;
                this.drawCanvas(this.img)
                var imageData = cxt.getImageData(0, 0, this.w, this.h);
                var imageData_length = imageData.data.length / 4;
                // 解析之后进行算法运算
                var tempCanvasData = copyImageData(imageData);
                for ( var x = 0; x < tempCanvasData.width-1; x++)
                {
                    for ( var y = 0; y < tempCanvasData.height-1; y++)
                    {

                        // Index of the pixel in the array
                        var idx = (x + y * tempCanvasData.width) * 4;
                        var bidx = ((x-1) + y * tempCanvasData.width) * 4;
                        var aidx = ((x+1) + y * tempCanvasData.width) * 4;

                        // calculate new RGB value
                        var nr = tempCanvasData.data[aidx + 0] - tempCanvasData.data[bidx + 0] + 128;
                        var ng = tempCanvasData.data[aidx + 1] - tempCanvasData.data[bidx + 1] + 128;
                        var nb = tempCanvasData.data[aidx + 2] - tempCanvasData.data[bidx + 2] + 128;
                        nr = (nr < 0) ? 0 : ((nr >255) ? 255 : nr);
                        ng = (ng < 0) ? 0 : ((ng >255) ? 255 : ng);
                        nb = (nb < 0) ? 0 : ((nb >255) ? 255 : nb);

                        // assign new pixel value
                        imageData.data[idx + 0] = nr; // Red channel
                        imageData.data[idx + 1] = ng; // Green channel
                        imageData.data[idx + 2] = nb; // Blue channel
                        imageData.data[idx + 3] = 255; // Alpha channel
                    }
                }
                function copyImageData(imgData){
                    return imgData && new ImageData(new Uint8ClampedArray(imgData.data),imgData.width,imgData.height);
                };
                cxt.putImageData(imageData, 0, 0);
            },
            preloadImg(url){
                return new Promise(function(resolve, reject) {
                    const image = new Image();
                    image.onload = function() {
                        resolve(image);
                    };
                    image.onerror = function() {
                        reject(new Error('Could not load image at ' + url));
                    };
                    image.src = url;
                });
            },
            
        }
    }
</script>

<style lang="stylus" scoped>
    .page
        min-width 1200px
    .main
        display flex
        flex-direction column
        justify-content space-between
    .card_top
        margin-bottom 10px
    .card_img
        flex 1
        overflow-y auto
    .img_wrap
        display flex
        align-items center
        justify-content center
        min-height 100%
        min-width 1000px


        .img
            height auto

</style>