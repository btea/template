/**
 * Created by Han on 2019/7/1.
 */
import L from './deploy';
import defaultSrc from 'leaflet/dist/images/marker-icon.png';
// eslint-disable-next-line no-unused-vars


const c = window.console.log;
/**
 * 工具
 */
const Util = {
    formatUtil: (value) => {
        value = Math.abs(value);
        const v1 = Math.floor(value);
        const v2 = Math.floor((value - v1) * 60);
        const v3 = Math.round((value - v1) * 3600 % 60);
        return v1 + '°' + v2 + '\'' + v3 + '"';
    },
    /**
     * 判断marker点的事件名是否正确
     * @param eventStr
     * @returns {boolean}
     */
    checkMarkerEvent(eventStr) {
        if (typeof eventStr !== 'string') return false;
        const markerEvent = ['click', 'mouseover', 'mouseout', 'drag', 'dragend', 'dragstart', 'movestart', 'moveend'];
        return markerEvent.indexOf(eventStr) > -1;
    },
    /**
     * 格式化经纬度
     * @param latLng 支持三种类型：[(number)latitude,(number)longitude]  {lat,lon}  {lat,lng}
     * @returns {lat,lng}
     */
    formatLatLng(latLng) {
        const c = {lat: latLng.lat || latLng[0], lng: latLng.lng || latLng.lon || latLng[1]};
        return Util.checkLatLng(c) ? c : null;
    },
    /**
     * 判断是否符合经纬度标准格式
     * @param latLng
     * @returns {boolean}
     */
    checkLatLng(latLng) {
        return typeof latLng === 'object' &&
            typeof (latLng.lat || latLng[0]) === 'number' &&
            typeof ((latLng.lng || latLng.lon) || latLng[1]) === 'number';
    },
    /**
     * 判断是否是一个字符串
     * @returns {boolean}
     */
    isString(e) {
        return typeof e === 'string';
    },
    /**
     * 判断是否是一个对象
     * @returns {boolean}
     */
    isObject(e) {
        return typeof e === 'object';
    },
    /**
     * 判断是否是一个函数
     * @returns {boolean}
     */
    isFunction(e) {
        return typeof e === 'function';
    },
    /**
     * 用风向的角度，得到中文八风向
     * @return {string}
     */
    GetWindDStringByAngle(angle, reverse) {
        var strWindD = '';
        angle = parseFloat(angle);
        if (angle === 0 || angle === 360) {
            strWindD = reverse ? '南风' : '北风';
        } else if ((360 - 22.5) < angle || angle < 22.5) {
            strWindD = reverse ? '偏南风' : '偏北风';
        } else if (angle > 22.5 && angle < (90 - 22.5)) {
            strWindD = reverse ? '西南风' : '东北风';
        } else if (angle === 90) {
            strWindD = reverse ? '西风' : '东风';
        } else if ((90 - 22.5) < angle && angle < (90 + 22.5)) {
            strWindD = reverse ? '偏西风' : '偏东风';
        } else if ((90 + 22.5) < angle && angle < (180 - 22.5)) {
            strWindD = reverse ? '西北风' : '东南风';
        } else if (angle === 180) {
            strWindD = reverse ? '北风' : '南风';
        } else if ((180 - 22.5) < angle && angle < (180 + 22.5)) {
            strWindD = reverse ? '偏北风' : '偏南风';
        } else if ((180 + 22.5) < angle && angle < (270 - 22.5)) {
            strWindD = reverse ? '东北风' : '西南风';
        } else if (angle === 270) {
            strWindD = reverse ? '东风' : '西风';
        } else if ((270 - 22.5) < angle && angle < (270 + 22.5)) {
            strWindD = reverse ? '偏东风' : '偏西风';
        } else if ((270 + 22.5) < angle && angle < (360 - 22.5)) {
            strWindD = reverse ? '东南风' : '西北风';
        }
        return strWindD;
    },
    /**
     * 排序
     * @param arr
     * @returns {*}
     */
    quickSort(arr) {
        if (arr.length <= 1) {
            return arr;
        }
        const pivotIndex = Math.floor(arr.length / 2);
        const pivot = arr.splice(pivotIndex, 1)[0];
        const left = [];
        const right = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] < pivot) {
                left.push(arr[i]);
            } else {
                right.push(arr[i]);
            }
        }
        return Util.quickSort(left).concat([pivot], Util.quickSort(right));
    },
    /**
     * 数组去重
     * @param array
     * @returns {Array}
     */
    uniq(array) {
        const temp = [];
        for (let i = 0; i < array.length; i++) {
            if (temp.indexOf(array[i]) === -1) {
                temp.push(array[i]);
            }
        }
        return temp;
    },
    shouldAddToArr(latLng, pointArr, type, radius) {
        // var _self = this;
        const bufferUtil = {
            check(latLng, arr, type, radius) {
                const buffer = bufferUtil._toBuffer(arr, type || 'line', radius || 5);
                // _self.buffer && _self.buffer.remove();
                // _self.markerCC && _self.markerCC.remove();
                // _self.buffer = L.geoJSON(buffer).addTo(map);
                // _self.markerCC = L.marker(latLng).addTo(map);
                return window.turf.booleanPointInPolygon(window.turf.point(bufferUtil._latLngReverse(latLng)), buffer);
            },
            _toBuffer(arr, type, radius) {
                let step1;
                switch (type) {
                    case'line':
                        // 生成化简多边形数组
                        step1 = bufferUtil._toLineString(arr);
                        // 返回缓冲区
                        return window.turf.buffer(step1, radius);
                    case'polygon':
                        // 生成化简多边形数组
                        step1 = bufferUtil._toPolygon(arr);
                        // 返回缓冲区
                        return window.turf.buffer(step1, radius);
                    default :
                        return null;
                }
            },
            _latLngReverse(latLng) {
                return [latLng[1], latLng[0]]
            },
            _getSimpleArr(arr) {
                // 经纬度顺序
                const arrR = arr.map(p => bufferUtil._latLngReverse(p));
                // 清除无用经纬度
                return window.d3.polygonHull(arrR);
            },
            _toLineString(arr) {
                const p = bufferUtil._getSimpleArr(arr);
                return window.turf.lineString(p)
            },
            _toPolygon(arr) {
                const p = bufferUtil._getSimpleArr(arr);
                p.push(p[0]);
                return window.turf.polygon([p]);
            }
        };
        return bufferUtil.check(latLng, pointArr, type, radius);
    }
};
/**
 * 图层工具
 */
const layerUtil = {
    create: (name) => {
        if (!C.Clayer) {
            C.Clayer = {};
        }
        if (!C.Clayer[name]) {
            C.Clayer[name] = L.layerGroup();
        }
        return C.Clayer[name];
    },
    add: (name) => {
        if (!C.Clayer) {
            C.Clayer = {};
        }
        if (!C.Clayer[name]) {
            layerUtil.create(name)
        }
        (!C.app.map.hasLayer(C.Clayer[name])) && (C.Clayer[name].addTo(C.app.map));
        return true;
    },
    remove: (name) => {
        if (!C.Clayer[name]) {
            return false;
        } else {
            (C.app.map.hasLayer(C.Clayer[name])) && (C.Clayer[name].removeFrom(C.app.map));
            return true;
        }
    },
    get: (name) => {
        if (!C.Clayer[name]) {
            return null;
        } else {
            return C.Clayer[name];
        }
    },
    /**
     * 图层切换，如果图层已经在地图上了，
     * @param name
     * @returns {boolean}
     */
    switch: (name) => {
        if (!C.Clayer[name]) {
            return false;
        } else {
            if (C.app.map.hasLayer(C.Clayer[name])) {
                C.Clayer[name].removeFrom(C.app.map)
            } else {
                C.Clayer[name].addTo(C.app.map)
            }
            return true;
        }
    }
};

class C {
    /**
     * 初始化地图
     * @param option
     */
    init(option){
        const {id} = option;
        C._autoLoad();
        C.app = L.cqkj.initMap(id, {
            basemapType: '',
            maxBounds: [[3, 54], [72, 136]],
            defaultMap: 'null'
        });

        this.addTileMapLayer();
        return C;
    };

    static _autoLoad() {
        C.var = {};
        // 绑定键盘事件
        C.var.count = 0;
        document.onkeydown = (e) => {
            if (e.ctrlKey) {
                switch (e.key.toUpperCase()) {
                    case 'Z':
                        console.dir(C);
                        break;
                    case 'X':
                        break;
                    case 'C':
                        break;
                    default:
                        break;
                }
            }
        };
    }

    /**
     * 根据分组来添加图标，常用于需要不同图标的地图标记点添加
     * @param arr 数据数组，其中每条数据都包括经纬度
     * @param option  需要附加 group { obj } 分组对象; iconKey { string } 图标标识字段
     * @example Map.addMarkersWithGroup([{lat:30,lng:120,grade:'test1'},{lat:31,lng:120,grade:'test2'}],{
     *     group: {
     *         test1:require('./test1.png'),
     *         test2:require('./test2.png')
     *     },
     *     iconKey:'grade',
     * })
     */
    addMarkersWithGroup(arr, option){
        option = option || {};
        const {group, iconKey} = option;
        if (!iconKey || !group) {
            c('请设置 [iconKey] 和 [group]');
            return;
        }
        for (const index in group) {
            const layerName = index + iconKey;
            this.handleLayer(layerName, 'ADD');
            this.handleLayer(layerName, 'clear');
        }
        arr.forEach(info => {
            if (Util.isObject(group)) {
                const latLng = Util.formatLatLng(info);
                const layerToAddArr = [];
                const layerName = info[iconKey] + iconKey;
                layerToAddArr.push(this.handleLayer(layerName, 'get'));

                option.layerToAdd = layerToAddArr;
                option.iconSrc = group[info[iconKey]];
                latLng && C._addMarker(latLng, info, option);
            }
        });
    };
    /**
     * 批量增加地图标记点
     * @param arr 数据数组 其中每条数据都包括经纬度
     * @param option 可选附加 identifier ( string ) 标记点的添加图层，便于图层控制，若为空，则添加到地图上
     */
    addMarkers(arr, option){
        option = option || {};
        const {group, iconKey, identifier, zoomFlag = false} = option || {};
        arr.forEach(info => {
            const latLng = Util.formatLatLng(info);
            const layerToAddArr = [];
            let hasLayerToAddFlag = false;

            if (Util.isString(identifier)) { // 指定图层名的情况
                hasLayerToAddFlag = true;
                const layer = this.handleLayer(identifier, 'add');
                layerToAddArr.push(layer);
            } else if (Util.isObject(identifier)) { // (大于 || 小于 || 等于) 表达式的情况
                hasLayerToAddFlag = true;
                for (const ofc in identifier) {
                    if (identifier.hasOwnProperty(ofc)) {
                        this.handleLayer(ofc, 'add');
                        this.handleLayer(ofc + '!', 'add');
                        const supportedChar = ['>', '<', '='];
                        if (supportedChar.indexOf(identifier[ofc]) > -1) {
                            const identifyArr = identifier[ofc].split('>');
                            const tail = (info[identifyArr[0]] >= identifyArr[1]) ? '' : '!';
                            layerToAddArr.push(this.handleLayer(ofc + tail, 'get'));
                        }
                    }
                }
            }
            group && iconKey && (option.iconSrc = group[info[iconKey]]);
            option.layerToAdd = hasLayerToAddFlag ? layerToAddArr : [C.app.map];
            latLng && C._addMarker(latLng, info, option);
        });
        if (zoomFlag) {
            this._mapZoomEnd();
        }
    };
    /**
     * 图层管理
     * @param identification
     * @param type
     */
    handleLayer(identification, type){
        type = type || 'NEW';
        switch (type.toUpperCase()) {
            case'NEW':
                c(layerUtil.create(identification));
                break;
            case'ADD':
                c(layerUtil.add(identification));
                break;
            case'REMOVE':
                c(layerUtil.remove(identification));
                break;
            case'GET':
                return layerUtil.get(identification);
            case'SWITCH':
                return layerUtil.switch(identification);
        }
    };

    /**
     * 增加arcGIS服务图层 瓦片图
     * @param option
     */
    addTileMapLayer(option){
        const {url = 'http://192.168.1.144:6080/arcgis//rest/services/ZhuMaDian/%E5%9F%BA%E7%AB%99%E5%88%87%E7%89%87/MapServer'} = option || {};
        L.esri.tiledMapLayer({
            url, maxZoom: 15, opacity: 1
        }).addTo(C.app.map);
    };

    showImage(option){
        const {url, bound = [[3, 72], [54, 136]]} = option || {};
        // 测试增加雷达图片
        L.imageOverlay(url, bound, {interactive: false}).addTo(C.app.map)

        // L.rectangle(bound, {color: '#ff7800', weight: 1}).addTo(C.app.map);
    };

    static info(data, type) {
        Message({
            message: data,
            type: type || 'success',
            duration: 3 * 1000
        });
    }

    static _createPane(zIndex) {
        const pane = `customer-pane-${zIndex}`;

        //  如果已经存在pane，那么返回已存在的pane
        if (C.app.map.getPane(pane)) return pane;

        C.app.map.createPane(pane);
        C.app.map.getPane(pane).style.zIndex = zIndex;
        return pane;
    }

    /**
     * 销毁地图图层
     */
    destroyMap(){
        C.var.tileLayer && C.var.tileLayer.remove();// 测试用的瓦片图
        C.var.count = 0;// 计数器
        C.AMap = null;
    };

    addTile(url){
        C.var.tileLayer && C.var.tileLayer.remove();
        C.var.tileLayer = L.tileLayer(url).addTo(C.app.map);
    };

    /**
     * 增加标记点
     * @param latLng 经纬度
     * @param info 信息
     * @param option 设置图标  绑定事件
     */
    static _addMarker(latLng, info, option) {
        const {layerToAdd} = option;
        const marker = L.marker(latLng, option);

        layerToAdd.forEach(targetLayer => {
            marker.addTo(targetLayer);
        });

        const {iconSrc = defaultSrc, iconSize = [25, 41]} = option || {};
        if (iconSrc !== defaultSrc) {
            const icon = L.icon({iconUrl: iconSrc, iconSize});
            marker.setIcon(icon);
        }
        marker.info = info;

        marker.bindTooltip(info.value + '&nbsp;&nbsp;&nbsp;', {permanent: true});

        C.bindMarkerEvent(marker, option);
    }

    setIconWithGroup(layerName, iconOption) {
        const {iconSrc = defaultSrc, iconSize = [25, 41]} = iconOption;
        const icon = L.icon({iconSize, iconUrl: iconSrc});
        const layer = this.handleLayer(layerName, 'get');
        layer.getLayers().forEach(lay => {
            lay.setIcon && Util.isFunction(lay.setIcon) && lay.setIcon(icon);
        });
    }

    /**
     * 绑定地图缩放事件
     * @param flag true:取消缩放事件
     */
    _mapZoomEnd(flag) {
        const event = () => {
            c('zoom end')
        };
        C.app.map.off('zoomend', event);
        if (!flag) {
            C.app.map.on('zoomend', event);
        }
    }

    /**
     * 给marker绑定事件
     * @param marker 需要绑定的标记点 //也可以是circle，polyline，polygon等
     * @param event 传入的事件数组
     */
    static bindMarkerEvent(marker, event) {
        if (Util.isObject(event)) {
            for (const index in event) {
                if (event.hasOwnProperty(index)) {
                    if (Util.checkMarkerEvent(index)) {
                        if (Util.isFunction(event[index])) {
                            marker.off(index);
                            marker.on(index, event[index]);
                        }
                    }
                }
            }
        }
    }
}

const Map = new C();
export {Map, c};
