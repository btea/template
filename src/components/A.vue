<template>
    <div class="a">
        <h5>这是a路由</h5>
        <div id="box"></div>
    </div>
</template>

<script>
import {Map} from '@/leaflet'
export default {
    mounted(){
        const options = {
            id: 'box',
            center: [30, 120],
            zoom: 8
        };
        Map.init(options);
    }

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