/**
 * Created by Han on 2019/9/12.
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
    }
};
/**
 * 图层工具
 */
const layerUtil = {
    getAll: (mapName) => {
        return C[mapName].Clayer;
    },
    create: (mapName, name) => {
        if (!C[mapName].Clayer[name]) {
            C[mapName].Clayer[name] = L.layerGroup();
        }
        return C[mapName].Clayer[name];
    },
    add: (mapName, name) => {
        const layer = layerUtil.create(mapName, name);
        if (!C[mapName].app.map.hasLayer(layer)) {
            layer.addTo(C[mapName].app.map);
        }
        return layer;
    },
    clear: (mapName, name) => {
        layerUtil.get(mapName, name) && layerUtil.get(mapName, name).clearLayers();
    },
    remove: (mapName, name) => {
        if (!C[mapName].Clayer[name]) {
            return false;
        } else {
            if (C[mapName].app.map.hasLayer(C[mapName].Clayer[name])) {
                C[mapName].Clayer[name].removeFrom(C[mapName].app.map);
            }
            return true;
        }
    },
    get: (mapName, name) => {
        return C[mapName].Clayer[name];
    },
    switch: (mapName, name) => {
        if (!C[mapName].Clayer[name]) {
            return false;
        } else {
            if (C[mapName].app.map.hasLayer(C[mapName].Clayer[name])) {
                C[mapName].Clayer[name].removeFrom(C[mapName].app.map);
            } else {
                C[mapName].Clayer[name].addTo(C[mapName].app.map);
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
    init = (option) => {
        const {id, mapName} = option;
        C._autoLoad(mapName);
        C[mapName].app = L.cqkj.initMap(id, {
            basemapType: '',
            minZoom: 5,
            center: [28.37, 121.45],
            zoom: 11,
            defaultMap: 'null'
        });

        // this.showJson(mapName);
        return C;
    };
    /**
     * 地图缩放
     */
    zoom = (mapName, type) => {
        if (!mapName) return;
        const map = C[mapName].app.map;
        switch (type.toUpperCase()) {
            case'IN':
                map.zoomIn();
                break;
            case'OUT':
                map.zoomOut();
                break;
            case'FULL':
                map.setView(map.options.center, map.options.zoom);
                break;
        }
    };

    static _autoLoad(mapName) {
        C[mapName] = {};// 图名 obj 初始化
        C[mapName].var = {};// 变量
        C[mapName].Clayer = {};// 图层

        C[mapName].var.count = 0;
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
    addMarkersWithGroup = (arr, option) => {
        option = option || {};
        const {group, iconKey, mapName} = option;
        if (!iconKey || !group) {
            c('请设置 [iconKey] 和 [group]');
            return;
        }
        for (const index in group) {
            const layerName = index + iconKey;
            this.handleLayer(mapName, layerName, 'ADD');
            this.handleLayer(mapName, layerName, 'clear');
        }
        arr.forEach(info => {
            if (Util.isObject(group)) {
                const latLng = Util.formatLatLng(info);
                const layerToAddArr = [];
                const layerName = info[iconKey] + iconKey;
                layerToAddArr.push(this.handleLayer(mapName, layerName, 'get'));

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
    addMarkers = (arr, option) => {
        option = option || {};
        const {mapName, group, iconKey, identifier, zoomFlag = false} = option || {};
        const self = this;
        arr.forEach(info => {
            const latLng = Util.formatLatLng(info);
            const layerToAddArr = [];
            let hasLayerToAddFlag = false;

            if (Util.isString(identifier)) { // 指定图层名的情况
                hasLayerToAddFlag = true;
                const layer = self.handleLayer(mapName, identifier, 'add');
                layerToAddArr.push(layer);
            } else if (Util.isObject(identifier)) { // (大于 || 小于 || 等于) 表达式的情况
                hasLayerToAddFlag = true;
                for (const ofc in identifier) {
                    if (identifier.hasOwnProperty(ofc)) {
                        self.handleLayer(mapName, ofc, 'add');
                        self.handleLayer(mapName, ofc + '!', 'add');
                        const supportedChar = ['>', '<', '='];
                        if (supportedChar.indexOf(identifier[ofc]) > -1) {
                            const identifyArr = identifier[ofc].split('>');
                            const tail = (info[identifyArr[0]] >= identifyArr[1]) ? '' : '!';
                            layerToAddArr.push(mapName, self.handleLayer(mapName, ofc + tail, 'get'));
                        }
                    }
                }
            }
            group && iconKey && (option.iconSrc = group[info[iconKey]]);
            option.layerToAdd = hasLayerToAddFlag ? layerToAddArr : [C[mapName].app.map];
            latLng && C._addMarker(latLng, info, option);
        });
        if (zoomFlag) {
            this._mapZoomEnd();
        }
    };
    /**
     * 展示geoJSON数据
     */
    showJson = (mapName, data) => {
        const style = {fillOpacity: 1, fillColor: '#fff', color: '#b4b4b4', weight: 1};
        style.pane = 'tilePane';
        C[mapName].Clayer.jsonLayer && C[mapName].Clayer.jsonLayer.removeFrom(C[mapName].app.map);
        C[mapName].Clayer.jsonLayer = L.geoJSON(data, {style: style}).addTo(C[mapName].app.map);
    };
    /**
     * 图层管理
     * @param mapName
     * @param identification
     * @param type
     */
    handleLayer = (mapName, identification, type) => {
        type = type || 'NEW';
        switch (type.toUpperCase()) {
            case 'NEW':
                return layerUtil.create(mapName, identification);
            case 'ADD':
                return layerUtil.add(mapName, identification);
            case 'REMOVE':
                layerUtil.remove(mapName, identification);
                break;
            case 'GET':
                return layerUtil.get(mapName, identification);
            case 'SWITCH':
                return layerUtil.switch(mapName, identification);
            case 'CLEAR':
                return layerUtil.clear(mapName, identification);
            case 'CLEARALL':
                // eslint-disable-next-line no-case-declarations
                const lay = layerUtil.getAll(mapName);
                for (const index in lay) {
                    if (lay.hasOwnProperty(index)) {
                        lay[index].clearLayers();
                    }
                }
                break;
        }
    };

    showImage = (mapName, option) => {
        const {url, bound = [[3, 72], [54, 136]]} = option || {};
        // 测试增加雷达图片
        L.imageOverlay(url, bound, {interactive: false}).addTo(C[mapName].app.map)

        // L.rectangle(bound, {color: '#ff7800', weight: 1}).addTo(C[mapName].app.map);
    };

    /**
     * 绘制工具
     */
    drawTool = (mapName, flag) => {
        (!C.var.distanceLayerGroup) && (C.var.distanceLayerGroup = L.layerGroup().addTo(C[mapName].app.map));
        !C.var.clickArr && (C.var.clickArr = []);
        if (flag) {
            C[mapName].app.map.doubleClickZoom.disable();
            // 添加点信息
            C[mapName].app.map.off('click');
            C[mapName].app.map.on('click', function(e) {
                C.var.clickArr.push(e.latlng);
                if (C.var.clickArr.length === 1) {
                    const fir = L.latLng(C.var.clickArr[0].lat, C.var.clickArr[0].lng);
                    L.circleMarker(fir, {
                        stroke: false,
                        color: 'green',
                        radius: 7,
                        fillOpacity: 0.6
                    }).addTo(C.var.distanceLayerGroup);
                    let flow = 0;
                    this.on('mousemove', function(e) {
                        flow++;
                        if (flow % 5 === 0) return;
                        if (C.firLine) {
                            C.firLine.remove();
                        }
                        C.firLine = L.polyline([[fir.lat, fir.lng], [e.latlng.lat, e.latlng.lng]], {color: '#55acb3'}).addTo(C.var.distanceLayerGroup).bringToBack();
                    })
                }
                if (C.var.clickArr.length === 2) {
                    const fir = L.latLng(C.var.clickArr[0].lat, C.var.clickArr[0].lng);
                    const sec = L.latLng(C.var.clickArr[1].lat, C.var.clickArr[1].lng);
                    L.circleMarker(sec, {
                        stroke: false,
                        color: 'red',
                        radius: 7,
                        fillOpacity: 0.6
                    }).addTo(C.var.distanceLayerGroup);
                    C.firLine = L.polyline([[fir.lat, fir.lng], [sec.lat, sec.lng]], {color: '#55acb3'}).addTo(C.var.distanceLayerGroup).bringToBack();
                    const length = this.distance(fir, sec).toFixed(2) + '米';
                    c(length, 'success');

                    L.marker(C.firLine.getCenter(), {
                        icon: L.divIcon({
                            className: 'fineLinePo',
                            html: '<span style="background: none; color: #000;font-size: 20px;white-space: nowrap">{length}</span>'.replace('{length}', length)
                        })
                    }).addTo(C.var.distanceLayerGroup);
                    C.var.clickArr = [];
                    C[mapName].app.map.off('mousemove');
                }
            })
        } else {
            C[mapName].app.map.off('click');
            C[mapName].app.map.off('mousemove');
            C.var.distanceLayerGroup.clearLayers();
        }
    };

    static _createPane(mapName, zIndex) {
        const pane = `customer-pane-${zIndex}`;

        //  如果已经存在pane，那么返回已存在的pane
        if (C[mapName].app.map.getPane(pane)) return pane;

        C[mapName].app.map.createPane(pane);
        C[mapName].app.map.getPane(pane).style.zIndex = zIndex;
        return pane;
    }

    invalidateSize = (mapName) => {
        C[mapName] && C[mapName].app.map.invalidateSize(true);
    };
    /**
     * 销毁地图图层
     */
    destroyMap = () => {
        C.var.count = 0;// 计数器
        (C.var.distanceLayerGroup) && (C.var.distanceLayerGroup.clearLayers());// 绘制控件图层
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
        marker.options.info = info;

        C.bindMarkerEvent(marker, option);
    }

    setIconWithGroup(mapName, layerName, iconOption) {
        const {iconSrc = defaultSrc, iconSize = [25, 41]} = iconOption;
        const icon = L.icon({iconSize, iconUrl: iconSrc});
        const layer = this.handleLayer(mapName, layerName, 'get');
        layer.getLayers().forEach(lay => {
            lay.setIcon && Util.isFunction(lay.setIcon) && lay.setIcon(icon);
        });
    }

    /**
     * 绑定地图缩放事件
     * @param mapName
     * @param flag true:取消缩放事件
     */
    _mapZoomEnd(mapName, flag) {
        const event = () => {
            c('zoom end')
        };
        C[mapName].app.map.off('zoomend', event);
        if (!flag) {
            C[mapName].app.map.on('zoomend', event);
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
