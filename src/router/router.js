import Vue from 'vue';
import VueRouter from 'vue-router';

const Index = () => import('@/components/Index');
const A = () => import('@/components/A');
const B = () => import('@/components/B');

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