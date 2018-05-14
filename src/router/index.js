import Router from 'vue-router'
import store from '@/store/'


const Canvas = r => require(['@/pages/canvas'], r);
const Canvas2 = r => require(['@/pages/canvas2'], r);

const NotFound = r => require(['@/pages/NotFound'], r);


const router = new Router({
    routes: [
        {
            name: 'canvas',
            path: '/canvas',
            component: Canvas
        },
        {
            path: '*',
            component: NotFound
        }
    ]
});

router.beforeEach((to, from, next) => {
    // console.log(`router.beforeEach(to: `, to, `from: `, from, `next: `, next);
    return next();
});

export default router