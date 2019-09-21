import Vue from 'vue';
import VueRouter from 'vue-router';

// 动态引入的模块能动态加载，分文件打包
// 注释里的模块名则是打包时生成的代码块的名字
const Index = () => import(/* webpackChunkName: "Index" */ '@/components/Index');
const A = () => import(/* webpackChunkName: "A"*/ '@/components/A');
const B = () => import(/* webpackChunkName: "B"*/ '@/components/B');

const routes = [
    {
        name: 'Index',
        path: '/',
        component: Index
    },
    {
        path: '/A',
        name: 'A',
        component: A
    },
    {
        name: 'B',
        path: '/B',
        component: B
    }
]
Vue.use(VueRouter);

export default new VueRouter({
    routes    
})