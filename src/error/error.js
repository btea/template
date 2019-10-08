// https://zhuanlan.zhihu.com/p/51800345
import Vue from 'vue';

window.onerror = function(message, source, lineno, colno, error){
    console.log('捕获到异常：', {message, source, lineno, colno, error});
    return true;
    // window.onerror 函数只有在返回true的时候，异常才不会向上抛出，否则即使是知道异常的发生控制台还是会显示鲜红的 Uncaught Error: xxx
}

// promise catch
// 未了防止有漏掉的Promise异常，建议在全局增加一个对 unhandledrejection 的监听，用来全局监听 Uncaught Promise Error
window.addEventListener('unhandledrejection', function(e){
    e.preventDefault();
    console.log('捕获到异常：', e);
    return true;
});

// Vue 错误捕获
Vue.config.errorHandler = (err, vm, info) => {
    // console.error('通过vue errorHandler捕获的错误');
    // console.error(err);
    // console.error(vm);
    // console.error(info);
    console.log('通过vue errorHandler捕获的错误');
    console.log(err);
    console.log(vm);
    console.log(info);
}


// iframe异常捕获
if(window.frames.length){
    window.frames[0].onerror = function (message, source, lineno, colno, error) {
        console.log('捕获到 iframe 异常：',{message, source, lineno, colno, error});
        return true;
    };
}