<template>
    <div class="app">
        <h1>-------------------------项目启动----------------------------------</h1>
        <div class="banner">
            <router-link class="route" v-for="path in routerData" :to="path.path" :key="path.path">{{path.name}}</router-link>
        </div>
        <img src="../public/img/bird.png" alt="">
        <router-view></router-view>
    </div>

</template>
<script>
export default {
    data(){
        return {
            routerData: [
                {path: '/', name: '默认模块'},
                {path: '/A', name: 'A'},
                {path: '/B', name: 'B'},
            ]
        }
    }
}
</script>
<style lang="less" scoped>
    .app{
        text-align: center;
        h1{
            text-align: center;
        }
        .banner{
            text-align: center;
            .route{
                margin: 0 20px;
                &:link {color: #FF0000}
                &:visited {color: #00FF00}
                &:hover {color: #FF00FF}
            }
        }
    }
</style>