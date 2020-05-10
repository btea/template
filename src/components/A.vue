<template>
    <div class="a">
        <h5>这是a路由</h5>
        <div id="box"></div>
        <h1>我的名字是：{{name}} {{message}}</h1>
    </div>
</template>

<script>
export default {
    inject: ['message', 'name']
}
</script>
<style lang="less" scoped>
    .a{
        text-align: center;
        #box{
            width: 50%;
            height: 500px;
            display: inline-block;
        }
    }
    
</style>