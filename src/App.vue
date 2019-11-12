<template>
    <div class="app">
        <h1>-------------------------项目启动----------------------------------</h1>
        <div class="banner">
            <router-link class="route" v-for="path in routerData" :to="path.path" :key="path.path">{{path.name}}</router-link>
        </div>
        <img src="../public/img/bird.png" alt="">
        <div id="list" className="list-group" style="text-align: center;">
            <div class="list-group-item">Item 1</div>
            <div class="list-group-item">Item 2</div>
            <div class="list-group-item">Item 3</div>
            <div class="list-group-item">Item 4</div>
            <div class="list-group-item">Item 5</div>
        </div>
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
    },
    mounted(){
        Sortable.create(document.getElementById('list'), {
            multiDrag: true,
            selectedClass: "selected",
            animation: 150
        })
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
        .list-group-item{
            height: 30px;
            background: gray;
            border: 1px solid #ffffff;
        }
        .selected{
            background-color: #f9c7c8 !important;
            border: solid red 1px !important;
            z-index: 1 !important;
        }
    }
</style>