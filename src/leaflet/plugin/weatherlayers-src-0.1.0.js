/* @preserve
 * WeatherLayer 0.1.0, 是一个基于leaflet继续封装并应用于气象行业的交互式地图api。
 */

(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports)
        : typeof define === 'function' && define.amd ? define(['exports'], factory)
        : (factory((global.L = global.L || {}, global.L.cqkj = {})));
}(window, function(exports) {
    'use strict';

    var version = '0.1.0';

    /**
     *  @class InitMap
     *  @aka L.cqkj.InitMap
     *
     *  创建初始化包含map的包装类。
     *  @example
     *  ```js
     *  var mapApp = L.cqkj.initMap("map");
     * ```
     */
    var InitMap = function(divId, options) {
        // @property layers: Array; 保存通过本类中loadlayer方法添加到map中的所有layer。
        this.layers = [];
        // @section
        // @aka InitMap options
        this.options = {
            // @option basemapType: String = 'web'
            // 地图的类型。有三种选择 ‘web’,'server','file',如果是这三种以外的值，那么就是在初始化的时候没有底图。这个在添加底图切换控件的时候很有用。
            basemapType: 'web',
            // @option serverType: String = 'tile'
            // 地图的类型，只有在basemapType设置为server的时候有用，是用于区别服务的类型是瓦片还是动态底图。有两种选择"tile"和"dynamic"。默认是瓦片
            serverType: 'tile',
            // @option defaultMap: Object = 'TianDiTu.Satellite.Map,TianDiTu.Satellite.Annotion'
            // 默认地图。该项值只有在basemapType设置了情况下才有用。如果 basemapType 设置的是'web'，该值设置和WebTileMapLayer类的type设置一样。 如果是'server'，该值是L.esri.TiledMapLayer或L.esri.DynamicMapLayer图层的options。如果是'file'，该值是L.cqkj.FileTileMapLayer的options的基础上增加url和extension配置项。如果设置成 "" '' null false表示不设置底图。
            defaultMap: 'TianDiTu.Satellite.Map,TianDiTu.Satellite.Annotion',
            // @option latLngBounds: LatLngBounds
            // 初始化地图的范围。
            latLngBounds: [[20, 100], [30, 120]],
            // @option center: Array = [33.6,105.4]
            // 初始化地图中心点坐标。
            center: [33.6, 105.4],
            // @option zoom: Number = 5
            // 初始化地图缩放级别。
            zoom: 5,
            attributionControl: false,
            // @option maxZoom: Number = 18
            // 初始化地图最大级别。
            maxZoom: 18,
            // @option minZoom: Number = 3
            // 初始化地图最小级别。
            minZoom: 3,
            // @option zoomControl: Boolean = false
            // 缩放控件
            zoomControl: false,
            // @option fullScreenMethod: String = "CenterAndZoom"
            // 地图全图缩放的时候使用的方法。默认方法是使用中心点和级别（设置值‘centerAndZoom’）如果是设置的是这值那设置项center和zoom就起作用；第二种使用范围（设置值‘LatLngBounds’）,如果是设置的是‘LatLngBounds’那设置项latLngBounds就起作用
            fullScreenMethod: 'CenterAndZoom'
        };
        L.setOptions(this, options);
        this._setBaseMap();
        // @property map: L.map; L.map。
        this.map = L.map(divId, this.options);
    };
    InitMap.prototype = {
        constructor: InitMap,
        /**
         * 改变初始的地图显示的中心点和缩放级别
         * @memberof L.cqkj.InitMap
         * @instance
         * @param  {array} center  地图初始化中心点位置
         * @param {number} zoom    地图初始化缩放级别
         */
        setCenterAndZoom: function(center, zoom) {
            this.center = center;
            this.zoom = zoom;
            this.zoomFullScreen();
        },
        /**
         * 改变初始的地图显示的范围
         * @memberof L.cqkj.InitMap
         * @instance
         * @param {array} latLngBounds 改变地图初始化显示范围 例:[[20, 100], [30, 120]],
         */
        setLatLngBounds: function(latLngBounds) {
            this.latLngBounds = latLngBounds;
            this.zoomFullScreenWithExtent();
        },

        /**
         * 设置放大缩小的控件的位置
         * @memberof L.cqkj.InitMap
         * @instance
         * @param {string} position - 放大缩小空间放的位置 可以是 'topleft', 'topright', 'bottomleft' or 'bottomright' 默认是右上角
         */
        setZoomControl: function(position, opt) {
            var pos = position === undefined || position === null || position === '' ? 'topright' : position;
            L.control.zoom({
                zoomInTitle: '放大',
                zoomOutTitle: '缩小',
                position: pos
            }).addTo(this.map);
            var style;
            switch (position) {
                case 'topright':
                    var right = (opt && opt.right) ? opt.right : '10px';
                    var top = (opt && opt.top) ? opt.top : '45px';
                    style = 'right:' + right + ';top:' + top + '';
                    break;
                case 'topleft':
                    var left = (opt && opt.left) ? opt.left : '10px';
                    var top = (opt && opt.top) ? opt.top : '45px';
                    style = 'left:' + left + ';top:' + top + '';
                    break;
                case 'bottomleft':
                    var left = (opt && opt.left) ? opt.left : '10px';
                    var bottom = (opt && opt.bottom) ? opt.bottom : '10px';
                    style = 'left:' + left + ';bottom:' + bottom + '';
                    break;
                case 'bottomright':
                    var right = (opt && opt.right) ? opt.right : '10px';
                    var bottom = (opt && opt.bottom) ? opt.bottom : '10px';
                    style = 'right:' + right + ';bottom:' + bottom + '';
                    break;
                default:
                    break;
            }
            if (style) {
                var zoom = document.getElementsByClassName('leaflet-control-zoom');
                zoom[0].style = style;
            }
        },
        addFullScreenButton: function(img) {
            if (img == undefined) {
                return;
            }
            var _self = this;
            var fullScreenButtonDiv = L.DomUtil.create('div', 'full-screen-button');
            // 阻止事件传播。
            L.DomEvent.disableClickPropagation(fullScreenButtonDiv);
            fullScreenButtonDiv.title = '全图';
            var imgE = L.DomUtil.create('img', '');
            fullScreenButtonDiv.appendChild(imgE);
            imgE.src = img;
            imgE.style = 'width:18px;height:18px;vertical-align: middle;';
            var zoomin = document.getElementsByClassName('leaflet-control-zoom-in');
            var zoom = document.getElementsByClassName('leaflet-control-zoom');
            zoom[0].insertBefore(fullScreenButtonDiv, zoomin[0]);
            var fullScreenMethod = this.options.fullScreenMethod;
            L.DomEvent.on(fullScreenButtonDiv, 'click', function() {
                switch (fullScreenMethod) {
                    case 'CenterAndZoom':
                        _self.zoomFullScreen();
                        break;
                    case 'LatLngBounds':
                        _self.zoomFullScreenWithExtent();
                }
            });
        },
        /**
         * 缩放至初始设置的显示范围，根据center和zoom。
         * @memberof L.cqkj.InitMap
         * @instance
         */
        zoomFullScreen: function() {
            this.map.setView(this.options.center, this.options.zoom);
        },
        // 缩放至初始设置的显示范围，根据latLngBounds。
        zoomFullScreenWithExtent: function() {
            this.map.fitBounds(this.options.latLngBounds, {
                maxZoom: 20,
                animate: false
            });
        },

        /**
         * 根据当初添加图层所设置的id来获取对应的图层
         * @memberof L.cqkj.InitMap
         * @instance
         * @param {number} id - 图层id
         */
        getLayerByid: function(id) {
            var layer = null;
            if (this.layers && this.layers.length > 0) {
                for (var i = 0; i < this.layers.length; i++) {
                    var lyr = this.layers[i];
                    if (lyr['id'] == id) {
                        layer = lyr['layer'];
                        break;
                    }
                }
            }
            return layer;
        },
        /**
         * 在Layers中根据layerid删除图层
         * @memberof L.cqkj.InitMap
         * @instance
         * @param {number} id   图层的id  即loadLayer时设置的id
         */
        unloadLayer: function(id) {
            this.hideLayer(id);
            if (this.layers && this.layers.length > 0) {
                for (var i = 0; i < this.layers.length; i++) {
                    var lyr = this.layers[i];
                    if (lyr['id'] == id) {
                        layers.splice(i, 1);
                        break;
                    }
                }
            }
        },
        /**
         * 添加图层，将layer添加到map中 并将layer保存到InitMap中的layers数组中，以方便根据id获取layer、
         * @memberof L.cqkj.InitMap
         * @instance
         * @param {L.layer} layer 参数的值可以是leaflet的任何layer
         * @param {number} id   创建的layer、的唯一的id
         */
        loadLayer: function(layer, id) {
            if (!this._isExist(id)) {
                this.map.addLayer(layer);
                this.layers.push({ 'id': id, 'layer': layer });
            } else {
                throw new Error(id + '-该id已存在！');
            }
        },
        /**
         * 根据layer的id隐藏图层  ，实际上只是将该图层从map中移除。
         * @memberof L.cqkj.InitMap
         * @instance
         * @param  {number} layerId   要隐藏的layer的id
         */
        hideLayer: function(layerId) {
            // 根据id获取对应的layer
            var layer = this.getLayerByid(layerId);
            if (layer) {
                // 将该layer从map中移除
                layer.removeFrom(this.map);
            } else {
                throw new Error('未找到id为 ' + layerId + ' 的图层，请检查是否是使用loadLayer(layer,id)方法进行加载的图层');
            }
        },
        /**
         * 根据id显示图层
         * @memberof L.cqkj.InitMap
         * @instance
         * @param {number} layerId  图层的id  即loadLayer时设置的id
         */
        showLayer: function(layerId) {
            var layer = this.getLayerByid(layerId);
            if (layer) {
                // 将该layer加载到map中
                layer.addTo(this.map);
            } else {
                throw new Error('未找到id为 ' + layerId + ' 的图层，请检查是否加载到map中！');
            }
        },
        // 私有方法  设置底图 ，，  在线的、 arcgis server发布的服务、本地瓦片文件路径
        _setBaseMap: function() {
            var basemapGroup = L.layerGroup();
            this.options.layers = [basemapGroup];
            if (!this.options.defaultMap || this.options.defaultMap === '') {
                var latlngs = [[0, 0], [0, 180], [90, 180], [90, 0]];
                basemapGroup.addLayer(L.polygon(latlngs, { stroke: false, fillColor: 'white' }));
                return;
            }
            // 调用在线网络地图
            if (this.options.basemapType === 'web') {
                var defaultMapStr = this.options.defaultMap.split(',');
                for (var i = 0; i < defaultMapStr.length; i++) {
                    basemapGroup.addLayer(new L.cqkj.webTileMapLayer(defaultMapStr[i], { id: defaultMapStr[i] + '_' + i }));
                }
            } else if (this.options.basemapType === 'server') { // 调用arcgis server发布的地图服务
                var layer;
                if (this.options.serverType === 'tile') {
                    layer = L.esri.tiledMapLayer(this.options.defaultMap);
                } else {
                    layer = L.esri.dynamicMapLayer(this.options.defaultMap);
                }
                basemapGroup.addLayer(layer);
            } else if (this.options.basemapType === 'file') { // 调用自己发布的瓦片地图
                basemapGroup.addLayer(new L.cqkj.fileTileMapLayer(this.options.defaultMap.url, this.options.defaultMap));
            }
        },
        /*
         判断该id是否已经存在
         */
        _isExist: function(id) {
            if (this.layers && this.layers.length > 0) {
                for (var i = 0; i < this.layers.length; i++) {
                    var lyr = this.layers[i];
                    if (lyr['id'] == id) {
                        return true;
                    }
                }
            }
            return false;
        }
    };
// @factory L.cqkj.initMap(divId: String,options?: InitMap options)
// 创建增强版Map。divId，必填，要呈现在div的id。options，设置项，继承 L.map 的options.
    var initMap = function(divId, options) {
        return new InitMap(divId, options);
    };

    /**
     *  @class WebTileMapLayer
     *  @aka L.cqkj.WebTileMapLayer
     *  @inherits TileLayer
     *
     *  创建底图瓦片图层，支持大部分在线网络地图。继承至`L.TileLayer`。
     *  @example
     *  ```js
     * var appMap = L.cqkj.initMap("map",{}};
     * var webTileLayer = L.cqkj.webTileMapLayer('TianDiTu.Common.Map',{minZoom:5,maxZoom:15});
     * appMap.loadLayer(webTileLayer,1);
     * ```
     */
    var WebTileMapLayer = L.TileLayer.extend({
        /**
         * @section
         * @aka WebTileMapLayer options
         *    @option proxy: Boolean = false
         *  请求地图服务的时候是否使用nginx代理。 如果使用nginx代理的话，必须先对nginx反向代理进行设置。
         */
        initialize: function(type, options) {
            var providers = {
                TianDiTu: {
                    Common: {
                        Map: '/DataServer?T=vec_w&X={x}&Y={y}&L={z}',
                        Annotion: '/DataServer?T=cva_w&X={x}&Y={y}&L={z}'
                    },
                    Satellite: {
                        Map: '/DataServer?T=img_w&X={x}&Y={y}&L={z}',
                        Annotion: '/DataServer?T=cia_w&X={x}&Y={y}&L={z}'
                    },
                    Terrain: {
                        Map: '/DataServer?T=ter_w&X={x}&Y={y}&L={z}',
                        Annotion: '/DataServer?T=cta_w&X={x}&Y={y}&L={z}'
                    },
                    prefix: 'http://t{s}.tianditu.gov.cn',
                    suffix: '&tk=0a9cfb135e61b353ba6c8b4cb3386101',
                    Subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
                },
                GaoDe: {
                    Common: {
                        Map: '/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
                    },
                    Satellite: {
                        Map: '/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}',
                        Annotion: '/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
                    },
                    prefix: 'https://webst0{s}.is.autonavi.com',
                    Subdomains: ['1', '2', '3', '4']
                },
                Google: {
                    Common: {
                        Map: '/vt/lyrs=m&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}'
                    },
                    Satellite: {
                        Map: '/vt/lyrs=s&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Gali',
                        Annotion: '/vt/imgtp=png32&lyrs=h@207000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil'
                    },
                    Terrain: {
                        Map: '/vt/lyrs=p&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}'
                    },
                    prefix: 'http://mt{s}.google.cn',
                    Subdomains: ['1', '2', '3']
                },
                Google_84: {
                    Satellite: {
                        Map: '/maps/vt?lyrs=s@198&gl=en&x={x}&y={y}&z={z}'
                    },
                    prefix: 'http://www.google.cn',
                    Subdomains: []
                },
                OSM: {
                    Common: {
                        Map: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    },
                    prefix: '',
                    Subdomains: ['a', 'b', 'c']
                },
                Geoq: {
                    Common: {
                        Map: '/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}',
                        MidnightBlue: '/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
                        Gray: '/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}',
                        Warm: '/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}'
                    },
                    prefix: 'http://map.geoq.cn',
                    Subdomains: []
                },
                SeaMap: {
                    Common: {
                        Map: '/tile.c?l=Na&m=o&z={z}&y={y}&x={x}'
                    },
                    prefix: 'http://m2.shipxy.com',
                    Subdomains: []
                }
            };
            var parts = type.split('.');
            var providerName = parts[0];
            var mapName = parts[1];
            var mapType = parts[2];
            var url = providers[providerName][mapName][mapType];
            if (!options.proxy) {
                var prefix = providers[providerName]['prefix'];
                if (options.proxyUrl) {
                    prefix = options.proxyUrl;
                }
                url = prefix + url;
            }
            if (providers[providerName]['suffix']) {
                url += providers[providerName]['suffix'];
            }
            this.options.subdomains = providers[providerName].Subdomains;
            L.TileLayer.prototype.initialize.call(this, url, options);
        }
    });
// @factory L.cqkj.webTileMapLayer(type: String,options?: WebTileMapLayer options)
// 创建瓦片地图图层。type  必填，‘TianDiTu.Common.Map’天地图电子地图(无注记)，‘TianDiTu.Common.Annotion’天地图电子地图注记，‘TianDiTu.Satellite.Map’天地图卫星图，’TianDiTu.Satellite.Annotion’天地图卫星图注记，’TianDiTu.Terrain.Map’天地图地形图，’TianDiTu.Terrain.Annotion’天地图地形图注记，GaoDe.Common.Map’高德电子地图（带注记），‘GaoDe.Satellite.Map’高德卫星地图，‘GaoDe.Satellite.Annotion’高德卫星地图注记，‘Google.Common.Map’Google电子地图带注记，‘Google.Satellite.Map’Google卫星地图，‘Google.Satellite.Annotion’Google卫星地图注记，'Google.Terrain.Map'Google地形地图，'Google_84.Satellite.Map'WGS84坐标的Google卫星地图， ‘OSM.Common.Map’OpenStreetMap电子地图，Geoq.Common.Map’智图电子地图，‘Geoq.Common.MidnightBlue’智图午夜蓝电子地图，‘Geoq.Common.Warm’智图暖色电子地图，‘Geoq.Common.Gray’智图灰色电子地图；options 继承 L.TileLayer
    var webTileMapLayer = function(type, options) {
        return new WebTileMapLayer(type, options);
    };

    var FileTileMapLayer = L.TileLayer.extend({
        initialize: function(url, options) {
            options = L.setOptions(this, options);
            this.url = url + '/{z}/{x}/{y}.' + options.extension;
            L.TileLayer.prototype.initialize.call(this, this.url, options);
        }
    });
    FileTileMapLayer.prototype.getTileUrl = function(tilePoint) {
        return L.Util.template(this._url, L.extend({
            s: this._getSubdomain(tilePoint),
            z: function() {
                var value = tilePoint.z;
                return 'L' + L.cqkj.Util.tileFileUrlFormat(value + '', 2);
            },
            x: function() {
                var value = tilePoint.y.toString(16).toUpperCase();
                return 'R' + L.cqkj.Util.tileFileUrlFormat(value, 8);
            },
            y: function() {
                var value = tilePoint.x.toString(16).toUpperCase();
                return 'C' + L.cqkj.Util.tileFileUrlFormat(value, 8);
            }
        }));
    };
    /**
     * @memberof L.cqkj
     * @class L.cqkj.FileTileMapLayer  用于加载本地瓦片文件,继承至 {@link http://leafletjs.com/reference-1.2.0.html#tilelayer <b>L.TileLayer</b>}。
     * @param {string} url  瓦片文件路径
     * @param {Object} options  设置继承至 {@link http://leafletjs.com/reference-1.2.0.html#tilelayer-option <b>TileLayer options</b>}
     * @since 1.0.0
     * @example
     *var appMap = L.cqkj.initMap("map",{...}};
     *var fileLayer = L.cqkj.fileTileMapLayer('/Scripts/LMap/fileMap/_alllayers');
     *appMap.loadLayer(fileLayer,5);
     */
    var fileTileMapLayer = function(url, options) {
        return new FileTileMapLayer(url, options);
    };

    var ImageLayer = function(map, options) {
        this.map = map;
        /**
         * @memberof L.cqkj.ImageLayer
         * @instance
         * @member {Object} options 设置项 {url:null,imageBounds:null,opacity:null}。
         */
        this.options = {
            url: null,
            imageBounds: null,
            opacity: null
        };
        L.setOptions(this, options);
        this.init();
    };
    ImageLayer.prototype = {
        constructor: ImageLayer,
        init: function() {
            this._addContourPic();
        },
        /**
         * 重新设置数据源
         * @memberof L.cqkj.ImageLayer
         * @instance
         * @param {Object} opts  可以设置 url opacity imageBounds 三个参数至少填一个  数据类型通imageOverlay的options
         * @param {string} opts.url  重新设置图片的路径
         * @param {float} opts.opacity  重新设置图片的透明度
         * @param {L.latLngBounds} opts.imageBounds  重新设置图片的的范围
         */
        setDataSource: function(opts) {
            if (this.imgLayer) {
                if (opts !== 'undefined') {
                    L.setOptions(this, opts);
                    this.imgLayer.setUrl(opts.url);
                    if (opts.imageBounds) {
                        var SW = L.latLng(opts.imageBounds[0]);
                        var NE = L.latLng(opts.imageBounds[1]);
                        var bounds = L.latLngBounds(SW, NE);
                        this.imgLayer.setBounds(bounds);
                    }
                    if (opts.opacity && opts.opacity >= 0 && opts.opacity <= 1) {
                        this.imgLayer.setOpacity(opts.opacity);
                    }
                } else {
                    throw new Error('L.cqkj.ImageLayer:setDataSource(opts)出错！原因：未设置opts(数据源参数)！');
                }
            }
        },
        /**
         * 隐藏图片图层
         * @memberof L.cqkj.ImageLayer
         * @instance
         */
        hide: function() {
            if (this.imgLayer) {
                this.imgLayer.removeFrom(this.map);
            } else {
                throw new Error('L.cqkj.ImageLayer:hide()出错！原因：ImageLayer.imageLayer不存在');
            }
        },
        /**
         * 显示图片图层
         * @memberof L.cqkj.ImageLayer
         * @instance
         */
        show: function() {
            if (this.imgLayer) {
                !this.map.hasLayer(this.imgLayer) && this.imgLayer.addTo(this.map);
            } else {
                throw new Error('L.cqkj.ImageLayer:show()出错！原因：ImageLayer.imageLayer不存在');
            }
        },
        _addContourPic: function() {
            this.imgLayer = L.imageOverlay(this.options.url, this.options.imageBounds, this.options).addTo(this.map);
        }
    };
    /**
     * @memberof L.cqkj
     * @class L.cqkj.ImageLayer  用于将图片展示在地图上
     * @param {map} map 地图对象
     * @param  {Object} options  设置项
     * @param  {string} options.url  设置图片的路径
     * @param  {L.latLngBounds} options.imageBounds  图片在地图上展示的范围
     * @param  {float} options.opacity  图片图层的透明度
     * @see {@link http://leafletjs.com/reference-1.2.0.html#imageoverlay|L.imageOverlay}
     * @since 1.0.0
     * @example
     *var appMap = L.cqkj.initMap("map",{}};
     *var imageLayer = L.cqkj.imageLayer(appMap.map, {
                  url: '/Images/map.jpg',
                  imageBounds: [[30, 120], [31, 121]],
                  opacity: 0.6
                });
     */
    var imageLayer = function(map, options) {
        return new ImageLayer(map, options);
    };

    var WindCanvasLayer = (L.Layer ? L.Layer : L.Class).extend({
        // -- initialized is called on prototype
        initialize: function initialize(options) {
            this._map = null;
            this._canvas = null;
            this._frame = null;
            this._delegate = null;
            L.setOptions(this, options);
        },

        delegate: function delegate(del) {
            this._delegate = del;
            return this;
        },

        needRedraw: function needRedraw() {
            if (!this._frame) {
                this._frame = L.Util.requestAnimFrame(this.drawLayer, this);
            }
            return this;
        },

        // -------------------------------------------------------------
        _onLayerDidResize: function _onLayerDidResize(resizeEvent) {
            this._canvas.width = resizeEvent.newSize.x;
            this._canvas.height = resizeEvent.newSize.y;
        },
        // -------------------------------------------------------------
        _onLayerDidMove: function _onLayerDidMove() {
            var topLeft = this._map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(this._canvas, topLeft);
            this.drawLayer();
        },
        // -------------------------------------------------------------
        getEvents: function getEvents() {
            var events = {
                resize: this._onLayerDidResize,
                moveend: this._onLayerDidMove
            };
            if (this._map.options.zoomAnimation && L.Browser.any3d) {
                events.zoomanim = this._animateZoom;
            }

            return events;
        },
        // -------------------------------------------------------------
        onAdd: function onAdd(map) {
            this._map = map;
            this._canvas = L.DomUtil.create('canvas', 'leaflet-layer');
            this.tiles = {};

            var size = this._map.getSize();
            this._canvas.width = size.x;
            this._canvas.height = size.y;

            var animated = this._map.options.zoomAnimation && L.Browser.any3d;
            L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));
            if (this.options.pane) {
                map._panes[this.options.pane].appendChild(this._canvas);
            }
            map.on(this.getEvents(), this);

            var del = this._delegate || this;
            del.onLayerDidMount && del.onLayerDidMount(); // -- callback
            this.needRedraw();

            var self = this;
            setTimeout(function() {
                self._onLayerDidMove();
            }, 0);
        },

        // -------------------------------------------------------------
        onRemove: function onRemove(map) {
            var del = this._delegate || this;
            del.onLayerWillUnmount && del.onLayerWillUnmount(); // -- callback

            map.getPane(this.options.pane).removeChild(this._canvas);

            map.off(this.getEvents(), this);

            this._canvas = null;
        },

        // ------------------------------------------------------------
        addTo: function addTo(map) {
            map.addLayer(this);
            return this;
        },
        // --------------------------------------------------------------------------------
        LatLonToMercator: function LatLonToMercator(latlon) {
            return {
                x: latlon.lng * 6378137 * Math.PI / 180,
                y: Math.log(Math.tan((90 + latlon.lat) * Math.PI / 360)) * 6378137
            };
        },

        // ------------------------------------------------------------------------------
        drawLayer: function drawLayer() {
            // -- todo make the viewInfo properties  flat objects.
            var size = this._map.getSize();
            var bounds = this._map.getBounds();
            var zoom = this._map.getZoom();

            var center = this.LatLonToMercator(this._map.getCenter());
            var corner = this.LatLonToMercator(this._map.containerPointToLatLng(this._map.getSize()));

            var del = this._delegate || this;
            del.onDrawLayer && del.onDrawLayer({
                layer: this,
                canvas: this._canvas,
                bounds: bounds,
                size: size,
                zoom: zoom,
                center: center,
                corner: corner
            });
            this._frame = null;
        },
        // -- L.DomUtil.setTransform from leaflet 1.0.0 to work on 0.0.7
        // ------------------------------------------------------------------------------
        _setTransform: function _setTransform(el, offset, scale) {
            var pos = offset || new L.Point(0, 0);

            el.style[L.DomUtil.TRANSFORM] = (L.Browser.ie3d ? 'translate(' + pos.x + 'px,' + pos.y + 'px)' : 'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') + (scale ? ' scale(' + scale + ')' : '');
        },

        // ------------------------------------------------------------------------------
        _animateZoom: function _animateZoom(e) {
            var scale = this._map.getZoomScale(e.zoom);
            // -- different calc of offset in leaflet 1.0.0 and 0.0.7 thanks for 1.0.0-rc2 calc @jduggan1
            var offset = L.Layer ? this._map._latLngToNewLayerPoint(this._map.getBounds().getNorthWest(), e.zoom, e.center) : this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

            L.DomUtil.setTransform(this._canvas, offset, scale);
        }
    });

    var windCanvasLayer = function(options) {
        return new WindCanvasLayer(options);
    };

    var WindFlowLayer = (L.Layer ? L.Layer : L.Class).extend({

        options: {
            displayOptions: {
                // 'bearing' (风来的方向) or 'meteo' (风去的方向)  and 'CW' (顺时针)
                angleConvention: 'bearingCW', // bearingCW  meteoCW
                // Could be 'm/s' for meter per second, 'km/h' for kilometer per hour or 'kt' for knots
                speedUnit: 'm/s'
            },
            maxVelocity: 10, // used to align color scale
            colorScale: null,
            data: null
        },

        _map: null,
        _canvasLayer: null,
        _windy: null,
        _context: null,
        _timer: 0,
        _mouseControl: null,

        initialize: function initialize(options) {
            L.setOptions(this, options);
        },

        onAdd: function onAdd(map) {
            // 创建canvas
            this._canvasLayer = L.cqkj.windCanvasLayer({ pane: this.options.pane }).delegate(this);
            this._canvasLayer.addTo(map);
            this._map = map;
        },
        onRemove: function onRemove(map) {
            this._destroyWind();
        },
        getEvents: function() {
            var _self = this;
            return {
                click: function(e) {
                    this._events['click'] && _self.fire('click', {
                        wind: _self._mouseHandler(e)
                    });
                },
                mousemove: function(e) {
                    this._events['mousemove'] && _self.fire('mousemove', {
                        wind: _self._mouseHandler(e)
                    });
                }
            };
        },

        setData: function setData(data) {
            this.options.data = data;

            if (this._windy) {
                this._windy.setData(data);
                this._clearAndRestart();
            }

            this.fire('load');
        },

        /* ------------------------------------ PRIVATE ------------------------------------------*/

        onDrawLayer: function onDrawLayer(overlay, params) {
            var self = this;

            if (!this._windy) {
                this._initWindy(this);
                return;
            }

            if (!this.options.data) {
                return;
            }

            if (this._timer) clearTimeout(self._timer);

            this._timer = setTimeout(function() {
                self._startWindy();
            }, 200); // showing velocity is delayed
        },

        _startWindy: function _startWindy() {
            var bounds = this._map.getBounds();
            var size = this._map.getSize();

            // bounds, width, height, extent
            this._windy.start([[0, 0], [size.x, size.y]], size.x, size.y, [[bounds._southWest.lng, bounds._southWest.lat], [bounds._northEast.lng, bounds._northEast.lat]]);
        },

        _initWindy: function _initWindy(self) {
            // windy object, copy options
            var options = Object.assign({ canvas: self._canvasLayer._canvas }, self.options);
            this._windy = new Windy(options);

            // prepare context global var, start drawing
            this._context = this._canvasLayer._canvas.getContext('2d');
            this._canvasLayer._canvas.classList.add('velocity-overlay');
            this.onDrawLayer();

            /*        this._map.on('dragstart', self._windy.stop);
             this._map.on('dragend', self._clearAndRestart);
             this._map.on('zoomstart', self._windy.stop);
             this._map.on('zoomend', self._clearAndRestart);
             this._map.on('resize', self._clearWind);*/
        },

        // 风场中鼠标的点击和移动的事件
        _mouseHandler: function(e) {
            var _self = this;
            var pos = this._map.containerPointToLatLng(L.point(e.containerPoint.x, e.containerPoint.y));
            var gridValue;
            if (this._windy) {
                gridValue = this._windy.interpolatePoint(pos.lng, pos.lat);
            }
            var windPointData = {
                speed: undefined,
                direction: undefined,
                containerPoint: e.containerPoint,
                latlng: e.latlng
            };
            if (gridValue && !isNaN(gridValue[0]) && !isNaN(gridValue[1]) && gridValue[2]) {
                windPointData.speed = +_self.vectorToSpeed(gridValue[0], gridValue[1], this.options.displayOptions.speedUnit).toFixed(2);
                windPointData.direction = +_self.vectorToDegrees(gridValue[0], gridValue[1], this.options.displayOptions.angleConvention).toFixed(2);
            }
            return windPointData;
        },
        // 根据uv算风速
        vectorToSpeed: function vectorToSpeed(uMs, vMs, unit) {
            var velocityAbs = Math.sqrt(Math.pow(uMs, 2) + Math.pow(vMs, 2));
            // 默认风速单位是 m/s
            if (unit === 'km/h') { // 公里每小时
                return this.meterSec2kilometerHour(velocityAbs);
            } else if (unit === 'kt') { // 多少节的速度
                return this.meterSec2Knots(velocityAbs);
            } else {
                return velocityAbs;
            }
        },
        // 根据uv算风向  以正北方向为0度。
        vectorToDegrees: function vectorToDegrees(uMs, vMs, angleConvention) {
            // 默认方向是都是顺时针（CW）

            var velocityAbs = Math.sqrt(Math.pow(uMs, 2) + Math.pow(vMs, 2));

            var velocityDir = Math.atan2(uMs / velocityAbs, vMs / velocityAbs);

            var velocityDirToDegrees = velocityDir * 180 / Math.PI + 180;

            if (angleConvention === 'meteoCW') { // 如果是算风去的方向，那就相差180
                velocityDirToDegrees += 180;
                if (velocityDirToDegrees >= 360) velocityDirToDegrees -= 360;
            }
            return velocityDirToDegrees;
        },
        //   m/s转kt(节)
        meterSec2Knots: function meterSec2Knots(meters) {
            return meters / 0.514;
        },
        //   m/s转km/h
        meterSec2kilometerHour: function meterSec2kilometerHour(meters) {
            return meters * 3.6;
        },
        _clearAndRestart: function _clearAndRestart() {
            if (this._context) this._context.clearRect(0, 0, 3000, 3000);
            if (this._windy) this._startWindy();
        },

        _clearWind: function _clearWind() {
            if (this._windy) this._windy.stop();
            if (this._context) this._context.clearRect(0, 0, 3000, 3000);
        },

        _destroyWind: function _destroyWind() {
            if (this._timer) clearTimeout(this._timer);
            if (this._windy) this._windy.stop();
            if (this._context) this._context.clearRect(0, 0, 3000, 3000);
            if (this._mouseControl) this._map.removeControl(this._mouseControl);
            this._mouseControl = null;
            this._windy = null;
            this._map.removeLayer(this._canvasLayer);
        }
    });

    var windFlowLayer = function(options) {
        return new WindFlowLayer(options);
    };

    var Windy = function Windy(params) {
        var MIN_VELOCITY_INTENSITY = params.minVelocity || 0; // velocity at which particle intensity is minimum (m/s)
        var MAX_VELOCITY_INTENSITY = params.maxVelocity || 10; // velocity at which particle intensity is maximum (m/s)
        var VELOCITY_SCALE = (params.velocityScale || 0.005) * (Math.pow(window.devicePixelRatio, 1 / 3) || 1); // scale for wind velocity (completely arbitrary--this value looks nice)
        var MAX_PARTICLE_AGE = params.particleAge || 90; // max number of frames a particle is drawn before regeneration
        var PARTICLE_LINE_WIDTH = params.lineWidth || 1; // line width of a drawn particle
        var PARTICLE_MULTIPLIER = params.particleMultiplier || 1 / 300; // particle count scalar (completely arbitrary--this values looks nice)
        var PARTICLE_REDUCTION = Math.pow(window.devicePixelRatio, 1 / 3) || 1.6; // multiply particle count for mobiles by this amount
        var FRAME_RATE = params.frameRate || 15;
        var FRAME_TIME = 1000 / FRAME_RATE; //    desired frames per second

        var defaulColorScale = ['rgb(36,104, 180)', 'rgb(60,157, 194)', 'rgb(128,205,193 )', 'rgb(151,218,168 )', 'rgb(198,231,181)', 'rgb(238,247,217)', 'rgb(255,238,159)', 'rgb(252,217,125)', 'rgb(255,182,100)', 'rgb(252,150,75)', 'rgb(250,112,52)', 'rgb(245,64,32)', 'rgb(237,45,28)', 'rgb(220,24,32)', 'rgb(180,0,35)'];

        var colorScale = params.colorScale || defaulColorScale;

        var NULL_WIND_VECTOR = [NaN, NaN, null]; // singleton for no wind in the form: [u, v, magnitude]

        var builder;
        var grid;
        var gridData = params.data;
        var date;
        var λ0, φ0, Δλ, Δφ, ni, nj;

        var setData = function setData(data) {
            gridData = data;
        };

        // interpolation for vectors like wind (u,v,m)
        var bilinearInterpolateVector = function bilinearInterpolateVector(x, y, g00, g10, g01, g11) {
            var rx = 1 - x;
            var ry = 1 - y;
            var a = rx * ry;
            var b = x * ry;
            var c = rx * y;
            var d = x * y;
            var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
            var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
            return [u, v, Math.sqrt(u * u + v * v)];
        };

        var createWindBuilder = function createWindBuilder(uComp, vComp) {
            var uData = uComp.data;
            var vData = vComp.data;
            return {
                header: uComp.header,
                // recipe: recipeFor("wind-" + uComp.header.surface1Value),
                data: function data(i) {
                    return [uData[i], vData[i]];
                },
                interpolate: bilinearInterpolateVector
            };
        };

        var createBuilder = function createBuilder(data) {
            var uComp = null;
            var vComp = null;

            data.forEach(function(record) {
                switch (record.header.parameterCategory + ',' + record.header.parameterNumber) {
                    case '1,2':
                    case '2,2':
                        uComp = record;
                        break;
                    case '1,3':
                    case '2,3':
                        vComp = record;
                        break;
                    default:
                }
            });

            return createWindBuilder(uComp, vComp);
        };

        var buildGrid = function buildGrid(data, callback) {
            builder = createBuilder(data);
            var header = builder.header;

            λ0 = header.lo1;
            φ0 = header.la1; // the grid's origin (e.g., 0.0E, 90.0N)

            Δλ = header.dx;
            Δφ = header.dy; // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)

            ni = header.nx;
            nj = header.ny; // number of grid points W-E and N-S (e.g., 144 x 73)

            date = new Date(header.refTime);
            date.setHours(date.getHours() + header.forecastTime);

            // Scan mode 0 assumed. Longitude increases from λ0, and latitude decreases from φ0.
            // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
            grid = [];
            var p = 0;
            var isContinuous = Math.floor(ni * Δλ) >= 360;

            for (var j = 0; j < nj; j++) {
                var row = [];
                for (var i = 0; i < ni; i++, p++) {
                    row[i] = builder.data(p);
                }
                if (isContinuous) {
                    // For wrapped grids, duplicate first column as last column to simplify interpolation logic
                    row.push(row[0]);
                }
                grid[j] = row;
            }

            callback({
                date: date,
                interpolate: interpolate
            });
        };

        /**
         * Get interpolated grid value from Lon/Lat position
         * @param λ {Float} Longitude
         * @param φ {Float} Latitude
         * @returns {Object}
         */
        var interpolate = function interpolate(λ, φ) {
            if (!grid) return null;

            var i = floorMod(λ - λ0, 360) / Δλ; // calculate longitude index in wrapped range [0, 360)
            var j = (φ0 - φ) / Δφ; // calculate latitude index in direction +90 to -90

            var fi = Math.floor(i);
            var ci = fi + 1;
            var fj = Math.floor(j);
            var cj = fj + 1;

            var row;
            if (row = grid[fj]) {
                var g00 = row[fi];
                var g10 = row[ci];
                if (isValue(g00) && isValue(g10) && (row = grid[cj])) {
                    var g01 = row[fi];
                    var g11 = row[ci];
                    if (isValue(g01) && isValue(g11)) {
                        // All four points found, so interpolate the value.
                        return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
                    }
                }
            }
            return null;
        };

        /**
         * @returns {Boolean} true if the specified value is not null and not undefined.
         */
        var isValue = function isValue(x) {
            return x !== null && x !== undefined;
        };

        /**
         * @returns {Number} returns remainder of floored division, i.e., floor(a / n). Useful for consistent modulo
         *          of negative numbers. See http://en.wikipedia.org/wiki/Modulo_operation.
         */
        var floorMod = function floorMod(a, n) {
            return a - n * Math.floor(a / n);
        };

        /**
         * @returns {Number} the value x clamped to the range [low, high].
         */
        var isMobile = function isMobile() {
            return (/android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i.test(navigator.userAgent)
            );
        };

        /**
         * Calculate distortion of the wind vector caused by the shape of the projection at point (x, y). The wind
         * vector is modified in place and returned by this function.
         */
        var distort = function distort(projection, λ, φ, x, y, scale, wind, windy) {
            var u = wind[0] * scale;
            var v = wind[1] * scale;
            var d = distortion(projection, λ, φ, x, y, windy);

            // Scale distortion vectors by u and v, then add.
            wind[0] = d[0] * u + d[2] * v;
            wind[1] = d[1] * u + d[3] * v;
            return wind;
        };

        var distortion = function distortion(projection, λ, φ, x, y, windy) {
            var τ = 2 * Math.PI;
            var H = Math.pow(10, -5.2);
            var hλ = λ < 0 ? H : -H;
            var hφ = φ < 0 ? H : -H;

            var pλ = project(φ, λ + hλ, windy);
            var pφ = project(φ + hφ, λ, windy);

            // Meridian scale factor (see Snyder, equation 4-3), where R = 1. This handles issue where length of 1º λ
            // changes depending on φ. Without this, there is a pinching effect at the poles.
            var k = Math.cos(φ / 360 * τ);
            return [(pλ[0] - x) / hλ / k, (pλ[1] - y) / hλ / k, (pφ[0] - x) / hφ, (pφ[1] - y) / hφ];
        };

        var createField = function createField(columns, bounds, callback) {
            /**
             * @returns {Array} wind vector [u, v, magnitude] at the point (x, y), or [NaN, NaN, null] if wind
             *          is undefined at that point.
             */
            function field(x, y) {
                var column = columns[Math.round(x)];
                return column && column[Math.round(y)] || NULL_WIND_VECTOR;
            }

            // Frees the massive "columns" array for GC. Without this, the array is leaked (in Chrome) each time a new
            // field is interpolated because the field closure's context is leaked, for reasons that defy explanation.
            field.release = function() {
                columns = [];
            };

            field.randomize = function(o) {
                // UNDONE: this method is terrible
                var x, y;
                var safetyNet = 0;
                do {
                    x = Math.round(Math.floor(Math.random() * bounds.width) + bounds.x);
                    y = Math.round(Math.floor(Math.random() * bounds.height) + bounds.y);
                } while (field(x, y)[2] === null && safetyNet++ < 30);
                o.x = x;
                o.y = y;
                return o;
            };

            callback(bounds, field);
        };

        var buildBounds = function buildBounds(bounds, width, height) {
            var upperLeft = bounds[0];
            var lowerRight = bounds[1];
            var x = Math.round(upperLeft[0]); // Math.max(Math.floor(upperLeft[0], 0), 0);
            var y = Math.max(Math.floor(upperLeft[1], 0), 0);
            var xMax = Math.min(Math.ceil(lowerRight[0], width), width - 1);
            var yMax = Math.min(Math.ceil(lowerRight[1], height), height - 1);
            return { x: x, y: y, xMax: width, yMax: yMax, width: width, height: height };
        };

        var deg2rad = function deg2rad(deg) {
            return deg / 180 * Math.PI;
        };

        var rad2deg = function rad2deg(ang) {
            return ang / (Math.PI / 180.0);
        };

        var invert = function invert(x, y, windy) {
            var mapLonDelta = windy.east - windy.west;
            var worldMapRadius = windy.width / rad2deg(mapLonDelta) * 360 / (2 * Math.PI);
            var mapOffsetY = worldMapRadius / 2 * Math.log((1 + Math.sin(windy.south)) / (1 - Math.sin(windy.south)));
            var equatorY = windy.height + mapOffsetY;
            var a = (equatorY - y) / worldMapRadius;

            var lat = 180 / Math.PI * (2 * Math.atan(Math.exp(a)) - Math.PI / 2);
            var lon = rad2deg(windy.west) + x / windy.width * rad2deg(mapLonDelta);
            return [lon, lat];
        };

        var mercY = function mercY(lat) {
            return Math.log(Math.tan(lat / 2 + Math.PI / 4));
        };

        var project = function project(lat, lon, windy) {
            // both in radians, use deg2rad if neccessary
            var ymin = mercY(windy.south);
            var ymax = mercY(windy.north);
            var xFactor = windy.width / (windy.east - windy.west);
            var yFactor = windy.height / (ymax - ymin);

            var y = mercY(deg2rad(lat));
            var x = (deg2rad(lon) - windy.west) * xFactor;
            var y = (ymax - y) * yFactor; // y points south
            return [x, y];
        };

        var interpolateField = function interpolateField(grid, bounds, extent, callback) {
            var projection = {};
            var mapArea = (extent.south - extent.north) * (extent.west - extent.east);
            var velocityScale = VELOCITY_SCALE * Math.pow(mapArea, 0.4);

            var columns = [];
            var x = bounds.x;

            function interpolateColumn(x) {
                var column = [];
                for (var y = bounds.y; y <= bounds.yMax; y += 2) {
                    var coord = invert(x, y, extent);
                    if (coord) {
                        var λ = coord[0];
                        var φ = coord[1];
                        if (isFinite(λ)) {
                            var wind = grid.interpolate(λ, φ);
                            if (wind) {
                                wind = distort(projection, λ, φ, x, y, velocityScale, wind, extent);
                                column[y + 1] = column[y] = wind;
                            }
                        }
                    }
                }
                columns[x + 1] = columns[x] = column;
            }

            (function batchInterpolate() {
                var start = Date.now();
                while (x < bounds.width) {
                    interpolateColumn(x);
                    x += 2;
                    if (Date.now() - start > 1000) {
                        // MAX_TASK_TIME) {
                        setTimeout(batchInterpolate, 25);
                        return;
                    }
                }
                createField(columns, bounds, callback);
            })();
        };

        var animationLoop;
        var animate = function animate(bounds, field) {
            function windIntensityColorScale(min, max) {
                colorScale.indexFor = function(m) {
                    // map velocity speed to a style
                    return Math.max(0, Math.min(colorScale.length - 1, Math.round((m - min) / (max - min) * (colorScale.length - 1))));
                };
                return colorScale;
            }

            var buckets = [];
            var colorStyles;
            if (!(typeof colorScale === 'function')) {
                colorStyles = windIntensityColorScale(MIN_VELOCITY_INTENSITY, MAX_VELOCITY_INTENSITY);
                buckets = colorStyles.map(function() {
                    return [];
                });
            }

            var particleCount = Math.round(bounds.width * bounds.height * PARTICLE_MULTIPLIER);
            if (isMobile()) {
                particleCount *= PARTICLE_REDUCTION;
            }

            var fadeFillStyle = 'rgba(0, 0, 0, 0.97)';

            var particles = [];
            for (var i = 0; i < particleCount; i++) {
                particles.push(field.randomize({ age: Math.floor(Math.random() * MAX_PARTICLE_AGE) + 0 }));
            }

            function evolve() {
                if (colorStyles) {
                    buckets.forEach(function(bucket) {
                        bucket.length = 0;
                    });
                } else {
                    buckets = [];
                }

                particles.forEach(function(particle) {
                    if (particle.age > MAX_PARTICLE_AGE) {
                        field.randomize(particle).age = 0;
                    }
                    var x = particle.x;
                    var y = particle.y;
                    var v = field(x, y); // vector at current position
                    var m = v[2];
                    if (m === null) {
                        particle.age = MAX_PARTICLE_AGE; // particle has escaped the grid, never to return...
                    } else {
                        var xt = x + v[0];
                        var yt = y + v[1];
                        if (field(xt, yt)[2] !== null) {
                            // Path from (x,y) to (xt,yt) is visible, so add this particle to the appropriate draw bucket.
                            particle.xt = xt;
                            particle.yt = yt;
                            particle.v = m;
                            if (colorStyles) {
                                buckets[colorStyles.indexFor(m)].push(particle);
                            } else {
                                buckets.push(particle);
                            }
                        } else {
                            // Particle isn't visible, but it still moves through the field.
                            particle.x = xt;
                            particle.y = yt;
                        }
                    }
                    particle.age += 1;
                });
            }

            var g = params.canvas.getContext('2d');
            g.lineWidth = PARTICLE_LINE_WIDTH;
            g.fillStyle = fadeFillStyle;
            g.globalAlpha = 0.6;

            function draw() {
                // Fade existing particle trails.
                var prev = 'lighter';
                g.globalCompositeOperation = 'destination-in';
                g.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
                g.globalCompositeOperation = prev;
                g.globalAlpha = 0.9;

                // Draw new particle trails.
                if (colorStyles) {
                    buckets.forEach(function(bucket, i) {
                        if (bucket.length > 0) {
                            g.beginPath();
                            g.strokeStyle = colorStyles[i];
                            bucket.forEach(function(particle) {
                                g.moveTo(particle.x, particle.y);
                                g.lineTo(particle.xt, particle.yt);
                                particle.x = particle.xt;
                                particle.y = particle.yt;
                            });
                            g.stroke();
                        }
                    });
                } else {
                    buckets.forEach(function(particle) {
                        g.beginPath();
                        g.strokeStyle = colorScale(particle.v);
                        g.moveTo(particle.x, particle.y);
                        g.lineTo(particle.xt, particle.yt);
                        particle.x = particle.xt;
                        particle.y = particle.yt;
                        g.stroke();
                    });
                }
            }

            var then = Date.now();
            (function frame() {
                animationLoop = requestAnimationFrame(frame);
                var now = Date.now();
                var delta = now - then;
                if (delta > FRAME_TIME) {
                    then = now - delta % FRAME_TIME;
                    evolve();
                    draw();
                }
            })();
        };

        var start = function start(bounds, width, height, extent) {
            var mapBounds = {
                south: deg2rad(extent[0][1]),
                north: deg2rad(extent[1][1]),
                east: deg2rad(extent[1][0]),
                west: deg2rad(extent[0][0]),
                width: width,
                height: height
            };
            stop();

            // build grid
            buildGrid(gridData, function(grid) {
                // interpolateField
                interpolateField(grid, buildBounds(bounds, width, height), mapBounds, function(bounds, field) {
                    // animate the canvas with random points
                    windy.field = field;
                    animate(bounds, field);
                });
            });
        };

        var stop = function stop() {
            if (windy.field) windy.field.release();
            if (animationLoop) cancelAnimationFrame(animationLoop);
        };

        var windy = {
            params: params,
            start: start,
            stop: stop,
            createField: createField,
            interpolatePoint: interpolate,
            setData: setData
        };

        return windy;
    };

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }

    var NoTranslateCanvas = L.Canvas.extend({
        options: {
            padding: 0,
            pane: 'markerPane'
        },
        _update: function() {
            if (this._map._animatingZoom && this._bounds) {
                return;
            }

            this._drawnLayers = {};

            L.Renderer.prototype._update.call(this);

            var b = this._bounds;
            var container = this._container;
            var size = b.getSize();
            var m = L.Browser.retina ? 2 : 1;

            L.DomUtil.setPosition(container, b.min);

            // set canvas size (also clearing it); use double size on retina
            container.width = m * size.x;
            container.height = m * size.y;
            container.style.width = size.x + 'px';
            container.style.height = size.y + 'px';

            // if (L.Browser.retina) {
            //    this._ctx.scale(2, 2);
            //    this._ctx.translate(-b.min.x, -b.min.y);
            // }

            // translate so we use the same path coordinates after canvas element moves
            // this._ctx.translate(-b.min.x, -b.min.y);
        }
    });
    var noTranslateCanvas = function(options) {
        return L.Browser.canvas ? new NoTranslateCanvas(options) : null;
    };

    /**
     *  @class GridValueLayer
     *  @aka L.cqkj.GridValueLayer
     *  @inherits L.Rectangle
     *
     *  格点值图层。继承至`L.Rectangle`。
     *  @example
     *  ```js
     * var appMap = L.cqkj.initMap("map",{}};
     * var gridLayer = L.cqkj.gridValueLayer({valueColor:'#444'});
     * appMap.loadLayer(gridLayer,1);
     * ```
     */
    var GridValueLayer = L.Rectangle.extend({
        // @section
        // @aka GridValueLayer options
        options: {
            // @option renderer: Renderer = noTranslateCanvas()
            // 渲染器
            renderer: noTranslateCanvas(),
            // @option valueColor: String = '#222'
            // 格点值字体颜色
            valueColor: '#222',
            // @option font: String = '12px sans-serif'
            // 格点值字体设置，相同于canvas的字体设置。
            font: '12px sans-serif',
            // @option distanceScale: Number = 1
            // 格点值的疏密程度。随着值得增大越稀疏
            distanceScale: 1,
            // @option gridValueVisible: Boolean = true
            // 格点是否可见
            gridValueVisible: true,
            // @option gridValueVisible: Boolean = true
            // 格点的缺失值。缺失值不显示。 所以在裁剪的时候很有用。后台裁剪的时候将边界之外的点都设置成格点的缺失值。
            missingValue: -9999
        },
        // @property data: Object; 格点值数据。
        data: null,

        initialize: function(options) {
            L.setOptions(this, options);
        },
        onAdd: function() {
            this._renderer = this._map.getRenderer(this);
            this._reset();
        },
        onRemove: function() {
            if (this._map.hasLayer(this._renderer)) {
                this._map.removeLayer(this._renderer);
            }
        },
        // @method setData(data: Object)
        // 设置格点数据。
        setData: function(data) {
            this._setData(data);
            this._buildGrid();
            this._reset();
        },

        reDraw: function() {
            this._buildGrid();
            this._reset();
        },

        _setData: function(data) {
            this.data = data;
            data.missingValue && (this.missingValue = data.missingValue);
        },

        _getItem: function(i) {
            return this.data.data[i];
        },

        _buildGrid: function() {
            this.grid = [];
            var p = 0;
            for (var j = 0; j < this.data.latsize; j++) {
                var row = [];
                for (var i = 0; i < this.data.lonsize; i++, p++) {
                    row[i] = this._getItem(p);
                }
                row.push(row[0]);
                this.grid[j] = row;
            }
        },
        // @method getEvents():Object
        // 获取事件。
        getEvents: function() {
            return {
                moveend: this._update
            };
        },

        _update: function() {
            var _self = this;
            if (this.grid && this._map) {
                setTimeout(function() {
                    _self.clearRenderer();
                    _self._draw();
                }, 0);
            }
        },

        _reset: function() {
            this._update();
        },
        // @method clearRenderer()
        // 清空渲染器。
        clearRenderer: function() {
            var size = this._renderer._bounds.getSize();
            if (this._renderer._ctx) {
                this._renderer._ctx.clearRect(0, 0, size.x, size.y);
            }
        },
        // @method clear()
        // 清空数据并清空渲染器。
        clear: function() {
            this.data = null;
            this.clearRenderer();
        },

        _draw: function() {
            if (!this.data) {
                return;
            }
            var x0 = this.data.startlon;
            var y0 = this.data.startlat;
            var dx = this.data.nlon;
            var dy = this.data.nlat;
            var lx = this.data.lonsize;
            var ly = this.data.latsize;

            var currentBound = this._map.getBounds();
            var lon1 = currentBound.getWest();
            var lat1 = currentBound.getSouth();
            var lon2 = currentBound.getEast();
            var lat2 = currentBound.getNorth();
            var start_j = Math.floor((lon1 - x0) / dx) > 0 && Math.floor((lon1 - x0) / dx) < lx ? Math.floor((lon1 - x0) / dx) : 0;
            var end_j = Math.ceil((lon2 - x0) / dx) > 0 && Math.ceil((lon2 - x0) / dx) < lx ? Math.ceil((lon2 - x0) / dx) : lx;
            var start_i = Math.floor((lat1 - y0) / dy) > 0 && Math.floor((lat1 - y0) / dy) < ly ? Math.floor((lat1 - y0) / dy) : 0;
            var end_i = Math.ceil((lat2 - y0) / dy) > 0 && Math.ceil((lat2 - y0) / dy) < ly ? Math.ceil((lat2 - y0) / dy) : ly;

            // Tip:因经度间隔、纬度间隔(即nlon、nlat)一般一样
            var p1 = this._map.latLngToLayerPoint(L.latLng(y0, x0));
            var p2 = this._map.latLngToLayerPoint(L.latLng(y0, x0 + dx));
            var d = p1.distanceTo(p2);
            d = d / this.options.distanceScale;
            var xi = d > (lx - 1) * dx ? 1 : Math.ceil((lx - 1) * dx / d);
            var m = L.Browser.retina ? 2 : 1;
            for (var i = start_i; i < end_i; i += xi) {
                var row = this.grid[i];
                for (var j = start_j; j < end_j; j += xi) {
                    var value = row[j];
                    if (value == this.missingValue) {
                        continue;
                    }
                    var latLng = L.latLng(y0 + dy * i, x0 + dx * j);
                    var p = this._map.latLngToContainerPoint(latLng);
                    p.x *= m;
                    p.y *= m;
                    this._drawText(value, p);
                }
            }
        },

        _drawText: function(value, p) {
            var ctx = this._renderer._ctx;
            if (!ctx) return;
            ctx.fillStyle = this.options.valueColor;
            ctx.strokeStyle = '#fbfbfb';
            ctx.font = this.options.font;
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(255, 255, 255, 1)';
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.shadowBlur = 1;
            if (this.options.gridValueVisible) {
                ctx.fillText(value, p.x, p.y + 5);
            }
        }
    });
// @factory L.cqkj.gridValueLayer(options?: GridValueLayer options)
// 创建格点值图层。options，设置项，继承 L.Rectangle 的options.
    var gridValueLayer = function(options) {
        return new GridValueLayer(options);
    };
    GridValueLayer.prototype._containsPoint = function(p) {
        return true;
    };

    /**
     *  @class WindUtil
     *  @aka L.cqkj.WindUtil
     *
     *  数据相关的工具类。
     */
    function WindUtil() {
    }

// m/s
    WindUtil.getwindlevelms = function(windV) {
        var windlevel = 1;
        if (windV < 1.6) {
            windlevel = 1;
        } else if (windV < 3.4) {
            windlevel = 2;
        } else if (windV < 5.5) {
            windlevel = 3;
        } else if (windV < 8.0) {
            windlevel = 4;
        } else if (windV < 10.8) {
            windlevel = 5;
        } else if (windV < 13.9) {
            windlevel = 6;
        } else if (windV < 17.2) {
            windlevel = 7;
        } else if (windV < 20.8) {
            windlevel = 8;
        } else if (windV < 24.5) {
            windlevel = 9;
        } else if (windV < 28.5) {
            windlevel = 10;
        } else if (windV < 32.6) {
            windlevel = 11;
        } else {
            windlevel = 12;
        }
        return windlevel;
    };
// 公里每小时
    WindUtil.getwindlevelkmh = function(windspeed) {
        var windlevel = 0;
        if (windspeed < 1) {
            windlevel = 0;
        } else if (windspeed <= 5) {
            windlevel = 1;
        } else if (windspeed <= 11) {
            windlevel = 2;
        } else if (windspeed <= 19) {
            windlevel = 3;
        } else if (windspeed <= 28) {
            windlevel = 4;
        } else if (windspeed <= 38) {
            windlevel = 5;
        } else if (windspeed <= 49) {
            windlevel = 6;
        } else if (windspeed <= 61) {
            windlevel = 7;
        } else if (windspeed <= 74) {
            windlevel = 8;
        } else if (windspeed <= 88) {
            windlevel = 9;
        } else if (windspeed <= 102) {
            windlevel = 10;
        } else if (windspeed <= 117) {
            windlevel = 11;
        } else if (windspeed <= 133) {
            windlevel = 12;
        } else if (windspeed <= 149) {
            windlevel = 13;
        } else if (windspeed <= 166) {
            windlevel = 14;
        } else if (windspeed <= 183) {
            windlevel = 15;
        } else if (windspeed <= 201) {
            windlevel = 16;
        } else if (windspeed <= 220) {
            windlevel = 17;
        } else {
            windlevel = 18;
        }

        return windlevel;
    };
    /*
     * 根据风向角获取风向
     */
    WindUtil.getWindDirectionDetail = function(windangle) {
        var windstr = '';
        if (windangle <= 11.25 || windangle > 348.75) {
            windstr = '北风';
        } else if (windangle > 11.25 && windangle <= 33.75) {
            windstr = '北东北风';
        } else if (windangle > 33.75 && windangle <= 56.25) {
            windstr = '东北风';
        } else if (windangle > 56.25 && windangle <= 78.75) {
            windstr = '东东北风';
        } else if (windangle > 78.75 && windangle <= 101.25) {
            windstr = '东风';
        } else if (windangle > 101.25 && windangle <= 123.75) {
            windstr = '东东南风';
        } else if (windangle > 123.75 && windangle <= 146.25) {
            windstr = '东南风';
        } else if (windangle > 146.25 && windangle <= 168.75) {
            windstr = '南东南风';
        } else if (windangle > 168.75 && windangle <= 191.25) {
            windstr = '南风';
        } else if (windangle > 191.25 && windangle <= 213.75) {
            windstr = '南西南风';
        } else if (windangle > 213.75 && windangle <= 236.25) {
            windstr = '西南风';
        } else if (windangle > 236.25 && windangle <= 258.75) {
            windstr = '西西南风';
        } else if (windangle > 258.75 && windangle <= 281.25) {
            windstr = '西风';
        } else if (windangle > 281.25 && windangle <= 303.75) {
            windstr = '西西北风';
        } else if (windangle > 303.75 && windangle <= 326.25) {
            windstr = '西北风';
        } else if (windangle > 326.25 && windangle <= 348.75) {
            windstr = '北西北风';
        }
        return windstr;
    };

    /**
     *  @class WindGridLayer
     *  @aka L.cqkj.WindGridLayer
     *  @inherits L.Rectangle
     *
     *  格点值图层。继承至`L.Rectangle`。
     *  @example
     *  ```js
     * var appMap = L.cqkj.initMap("map",{}};
     * var windGridLayer = L.cqkj.windGridLayer({valueColor:'#444'});
     * appMap.loadLayer(windGridLayer,1);
     * ```
     */
    var WindGridLayer = L.Rectangle.extend({
        // @section
        // @aka WindGridLayer options
        options: {
            // @option renderer: Renderer = noTranslateCanvas()
            // 渲染器
            renderer: noTranslateCanvas(),
            // @option distanceScale: Number = 1
            // 格点值的疏密程度。随着值得增大越稀疏
            distanceScale: 1,
            // @option gridValueVisible: Boolean = true
            // 格点是否可见
            gridValueVisible: true,
            // @option gridValueVisible: Boolean = true
            // 格点的缺失值。缺失值不显示。 所以在裁剪的时候很有用。后台裁剪的时候将边界之外的点都设置成格点的缺失值。
            missingValue: -9999
        },
        // @property data: Object; 格点值数据。
        data: null,

        initialize: function(options) {
            L.setOptions(this, options);
        },
        onAdd: function() {
            this._renderer = this._map.getRenderer(this);
            this._reset();
        },
        onRemove: function() {
            if (this._map.hasLayer(this._renderer)) {
                this._map.removeLayer(this._renderer);
            }
        },
        // @method setData(data: Object)
        // 设置格点数据。
        setData: function(data) {
            this._setData(data);
            this._buildGrid();
            this._reset();
        },

        reDraw: function() {
            this._buildGrid();
            this._reset();
        },

        _setData: function(data) {
            this.data = data;
            data.missingValue && (this.missingValue = data.missingValue);
        },

        _getItem: function(i) {
            return this.data.data[i];
        },

        _buildGrid: function() {
            this.grid = [];
            var p = 0;
            for (var j = 0; j < this.data.latsize; j++) {
                var row = [];
                for (var i = 0; i < this.data.lonsize; i++, p++) {
                    row[i] = this._getItem(p);
                }
                row.push(row[0]);
                this.grid[j] = row;
            }
        },
        // @method getEvents():Object
        // 获取事件。
        getEvents: function() {
            return {
                moveend: this._update
            };
        },

        setWindGridLayerVisible: function(visible) {
            this.options.gridValueVisible = visible;
            this._update();
        },

        _update: function() {
            if (this.grid && this._map) {
                this.clearRenderer();
                this._draw();
            }
        },

        _reset: function() {
            this._update();
        },
        // @method clearRenderer()
        // 清空渲染器。
        clearRenderer: function() {
            var size = this._renderer._bounds.getSize();
            this._renderer._ctx.clearRect(0, 0, size.x, size.y);
        },
        // @method clear()
        // 清空数据并清空渲染器。
        clear: function() {
            this.data = null;
            this.clearRenderer();
        },

        _draw: function() {
            if (!this.data) {
                return;
            }
            var x0 = this.data.startlon;
            var y0 = this.data.startlat;
            var dx = this.data.nlon;
            var dy = this.data.nlat;
            var lx = this.data.lonsize;
            var ly = this.data.latsize;

            var currentBound = this._map.getBounds();
            var lon1 = currentBound.getWest();
            var lat1 = currentBound.getSouth();
            var lon2 = currentBound.getEast();
            var lat2 = currentBound.getNorth();
            var start_j = Math.floor((lon1 - x0) / dx) > 0 && Math.floor((lon1 - x0) / dx) < lx ? Math.floor((lon1 - x0) / dx) : 0;
            var end_j = Math.ceil((lon2 - x0) / dx) > 0 && Math.ceil((lon2 - x0) / dx) < lx ? Math.ceil((lon2 - x0) / dx) : lx;
            var start_i = Math.floor((lat1 - y0) / dy) > 0 && Math.floor((lat1 - y0) / dy) < ly ? Math.floor((lat1 - y0) / dy) : 0;
            var end_i = Math.ceil((lat2 - y0) / dy) > 0 && Math.ceil((lat2 - y0) / dy) < ly ? Math.ceil((lat2 - y0) / dy) : ly;

            // Tip:因经度间隔、纬度间隔(即nlon、nlat)一般一样
            var p1 = this._map.latLngToLayerPoint(L.latLng(y0, x0));
            var p2 = this._map.latLngToLayerPoint(L.latLng(y0, x0 + dx));
            var d = p1.distanceTo(p2);
            d = d / this.options.distanceScale;
            var xi = d > (lx - 1) * dx ? 1 : Math.ceil((lx - 1) * dx / d);
            var m = L.Browser.retina ? 2 : 1;
            for (var i = start_i; i < end_i; i += xi) {
                var row = this.grid[i];
                for (var j = start_j; j < end_j; j += xi) {
                    var value = row[j];
                    var windData = value.split('_');
                    if ((+windData[0]) == this.missingValue) {
                        continue;
                    }
                    var latLng = L.latLng(y0 + dy * i, x0 + dx * j);
                    var p = this._map.latLngToContainerPoint(latLng);
                    p.x *= m;
                    p.y *= m;
                    this._drawImage(value, p);
                }
            }
        },

        _drawImage: function(value, p) {
            var ctx = this._renderer._ctx;
            if (!ctx) return;
            if (this.options.gridValueVisible) {
                var windData = value.split('_');
                var windLevel = WindUtil.getwindlevelms(+windData[0]);
                var img = document.createElement('img');
                img.onload = function() {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((+windData[1] + 90) * Math.PI / 180);
                    ctx.drawImage(img, -12, -12);
                    ctx.restore();
                    img = undefined;
                };
                img.src = this._getImg(windLevel);
            }
        },
        _getImg: function(windlevel) {
            var imgSrc;
            switch (windlevel) {
                case 0: {
                    imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NkYwRDJGNTkwRjcwMTFFNzlCOTU4N0RBMTM3Mzg0MTEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NkYwRDJGNUEwRjcwMTFFNzlCOTU4N0RBMTM3Mzg0MTEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2RjBEMkY1NzBGNzAxMUU3OUI5NTg3REExMzczODQxMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2RjBEMkY1ODBGNzAxMUU3OUI5NTg3REExMzczODQxMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ptxg6ckAAAA3SURBVHjaYvz//z8DLQETA43BqAWjFoxawMDACMTgrAzM0YyjQTRqwUjPB0PXgtE6ecAtAAgwAKjzDCGKyDYEAAAAAElFTkSuQmCC';// 和一级一样
                    break;
                }
                case 1: {
                    imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NkYwRDJGNTkwRjcwMTFFNzlCOTU4N0RBMTM3Mzg0MTEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NkYwRDJGNUEwRjcwMTFFNzlCOTU4N0RBMTM3Mzg0MTEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2RjBEMkY1NzBGNzAxMUU3OUI5NTg3REExMzczODQxMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2RjBEMkY1ODBGNzAxMUU3OUI5NTg3REExMzczODQxMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ptxg6ckAAAA3SURBVHjaYvz//z8DLQETA43BqAWjFoxawMDACMTgrAzM0YyjQTRqwUjPB0PXgtE6ecAtAAgwAKjzDCGKyDYEAAAAAElFTkSuQmCC';
                    break;
                }
                case 2: {
                    imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDBGMzFGMjIwRjZGMTFFN0E3NjE5RjdGQTc5RDkxOUYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDBGMzFGMjMwRjZGMTFFN0E3NjE5RjdGQTc5RDkxOUYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0MEYzMUYyMDBGNkYxMUU3QTc2MTlGN0ZBNzlEOTE5RiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0MEYzMUYyMTBGNkYxMUU3QTc2MTlGN0ZBNzlEOTE5RiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtGrRIIAAAA4SURBVHjaYvz//z8DLQETA43B0LeAEYjBkQCMC8bRIBq1YNSCUQtGLaC0NB26PhitkwfcAoAAAwDbCgsjSxUuRQAAAABJRU5ErkJggg==';
                    break;
                }
                case 3: {
                    imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTgwRkZFMzEwRjZGMTFFN0FEM0VBMzA1N0IwQUExNDYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTgwRkZFMzIwRjZGMTFFN0FEM0VBMzA1N0IwQUExNDYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFODBGRkUyRjBGNkYxMUU3QUQzRUEzMDU3QjBBQTE0NiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFODBGRkUzMDBGNkYxMUU3QUQzRUEzMDU3QjBBQTE0NiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PokchQ0AAAA+SURBVHjaYvz//z8DLQETA43B0LeAEYjBkQCMC8bRIBq1gLoWMDIy/gfh0SAatWAklaZD1wejdfKAWwAQYABQew0nqIkjKQAAAABJRU5ErkJggg==';
                    break;
                }
                case 4: {
                    imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTNGRjI3RTYwRjZGMTFFN0FEQTFDN0I1QTE1MzJEOEEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTNGRjI3RTcwRjZGMTFFN0FEQTFDN0I1QTE1MzJEOEEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFM0ZGMjdFNDBGNkYxMUU3QURBMUM3QjVBMTUzMkQ4QSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFM0ZGMjdFNTBGNkYxMUU3QURBMUM3QjVBMTUzMkQ4QSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ptk3msQAAAA+SURBVHjaYvz//z8DLQETA43B0LeAEYjBkQCMC0YUCUZGrOKjcTBqwagFoxaMWoCvNB26FozWyQNuAUCAAQCINBAhqkgIoQAAAABJRU5ErkJggg==';
                    break;
                }
                case 5: {
                    imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjUxQkEzMzAwRjZGMTFFNzg0NDU5NDI4RDZDN0YwQTAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjUxQkEzMzEwRjZGMTFFNzg0NDU5NDI4RDZDN0YwQTAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGNTFCQTMyRTBGNkYxMUU3ODQ0NTk0MjhENkM3RjBBMCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNTFCQTMyRjBGNkYxMUU3ODQ0NTk0MjhENkM3RjBBMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pgl4KOYAAABLSURBVHjaYvr//z8DLTETA43BMLCAkZHxPwijS+ASH4FBNGoB1S0gNXWNxsGoBUPJAlj6Rk/nxIrjwrT3AbDeZKQlHk1FBAFAgAEA/bSn6THLoB0AAAAASUVORK5CYII=';
                    break;
                }
                case 6: {
                    imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDI2MUFBOTEwRjcwMTFFNzkyOThCRjVFQ0FBMDlBMjUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDI2MUFBOTIwRjcwMTFFNzkyOThCRjVFQ0FBMDlBMjUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowMjYxQUE4RjBGNzAxMUU3OTI5OEJGNUVDQUEwOUEyNSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowMjYxQUE5MDBGNzAxMUU3OTI5OEJGNUVDQUEwOUEyNSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvCitPsAAABHSURBVHjaYvr//z8DLTETA43BMLCAkZHxPwijS5AqPoyDaNSCUQtGLRi1gAQLYKUkemlJrDguTHsfAOtNRlri0VREEAAEGACTF6fpvkHQbAAAAABJRU5ErkJggg==';
                    break;
                }
                case 7: {
                    imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTJFREFCRTUwRjcwMTFFNzhBMDY4RkNCNkQ4NkQ0QUIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTJFREFCRTYwRjcwMTFFNzhBMDY4RkNCNkQ4NkQ0QUIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxMkVEQUJFMzBGNzAxMUU3OEEwNjhGQ0I2RDg2RDRBQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxMkVEQUJFNDBGNzAxMUU3OEEwNjhGQ0I2RDg2RDRBQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pq1GSa8AAAA5SURBVHjaYvz//z8DLQHjqAUELQBisA1AixhRJBgZqSM+asGoBaMWjFowoiygeXE9WqMNXwsAAgwA+Mv51cALmfYAAAAASUVORK5CYII=';
                    break;
                }
                case 8: {
                    imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OUFFQzYzN0EwRjcwMTFFN0IxQTc4REJBN0U4QTJFRDgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OUFFQzYzN0IwRjcwMTFFN0IxQTc4REJBN0U4QTJFRDgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5QUVDNjM3ODBGNzAxMUU3QjFBNzhEQkE3RThBMkVEOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5QUVDNjM3OTBGNzAxMUU3QjFBNzhEQkE3RThBMkVEOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnwHCccAAAD5SURBVHja3NWvikJBFMfxGUVBEAxiNG2xGBexbl0wmU02i5tMgphkg018C4Ns8RX2CUwiWCyCRfD/9XvgCCKGi3cGxAOfMnDv786cw51YEATGp5jxXP4DrLWfqCIDI1xXoAbIhH7oiR7U0UDSVw8SaKKCuI+AGbLooewjoI01PtBHwXWTU2hhgyPGyEVt8m2AVFq/fo8dfnXNWYBUHhPdhezm59FkRQmQKuJf15f4vp+sqAFSX5jjhKmGOg2QY6lhhTP+9PicBRidrK42XXYyuk6WqwCj/6chDtiiI8EuA+4na4FS2AAb4uUvfuGwDevTG9zJvgMuAgwAznDyrIVnXhsAAAAASUVORK5CYII=';
                    break;
                }
                case 9: {
                    imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDkxMDc1OUYwRjcyMTFFN0FFRURFRjdDMkQ2RkNEQ0YiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDkxMDc1QTAwRjcyMTFFN0FFRURFRjdDMkQ2RkNEQ0YiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0OTEwNzU5RDBGNzIxMUU3QUVFREVGN0MyRDZGQ0RDRiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0OTEwNzU5RTBGNzIxMUU3QUVFREVGN0MyRDZGQ0RDRiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrJKd/0AAADmSURBVHjaYvz//z8DLQHj0LcAiE2BWB6IdwPxR5AgtS39D8VTgZifaE1ARxCDkS34CcRVQMxGKwv+AfErIA4BYmZaWHAHiP9CaRtaWBAJxG+h7FNArEFtCziBuByIvwLxHyDeBMSi1LQABHiAuA+If0EjvQsqhpHqyLUABGSBeCfUFyDfFKKlLIotAAFdaDyAxF8AsTdSyqKKBSDgBMQPoCnrBtRSqloACpY4aMoC5ZEt0OCjmgUM0JTVBI10kE/WUdsCBmj5NB2IfwPxD1pYgJ6ySLKAkQjDKa4P/o9WmcPbAoAAAwApwg9nJ7iVCwAAAABJRU5ErkJggg==';
                    break;
                }
                case 10: {
                    imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MkRBRDg3MjcwRjcxMTFFNzgyODJDM0E5QjJCQzZDMzMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MkRBRDg3MjgwRjcxMTFFNzgyODJDM0E5QjJCQzZDMzMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyREFEODcyNTBGNzExMUU3ODI4MkMzQTlCMkJDNkMzMyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyREFEODcyNjBGNzExMUU3ODI4MkMzQTlCMkJDNkMzMyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvrG7rUAAADmSURBVHja7JWtCgJBFIVnFARB2GS0W4w2k9W6xeI7mASj0WAT38IgFl/BJzAYjCIYBf/Hc+GEZdOI96LBAx+7DMt+3Ll3d3wIwVmm4IxjL/DeN0EKEuAE7QQyBUns89K7GLKCCxiCkpXgCQ4gBUULwRY8eG1ZCLrgyPs1qGsLymAATuAOFqCqKZBUwARc2fQx19QEkhpYsQqppp+brI8Fkgb7IOt70MlMlopA0gY7TtaGUlWBbEuPkyXfyJLbpyZwnKwRmy6VzLUFjv+nGbiBs4UgP1lvCXzEy3/7wPH/M/nrgpcAAwBY9AccyHOQoQAAAABJRU5ErkJggg==';
                    break;
                }
                case 11: {
                    imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MkJDRjUzNEMwRjcyMTFFN0JBNjZDNjJBMUZDRUJDRDAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MkJDRjUzNEQwRjcyMTFFN0JBNjZDNjJBMUZDRUJDRDAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyQkNGNTM0QTBGNzIxMUU3QkE2NkM2MkExRkNFQkNEMCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyQkNGNTM0QjBGNzIxMUU3QkE2NkM2MkExRkNFQkNEMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PukUWFkAAADnSURBVHjaYvz//z8DLQHj0LcAiE2BWB6IdwPxR5AgtS39D8VTgZifWPUgRxCDkS34CcRVQMxGKwv+AfErIA4BYmZaWHAHiP9CaRtaWBAJxG+h7FNArEFtCziBuByIvwLxHyDeBMSi1LQABHiAuA+If0EjvQsqRtACPOIoFoCALBDvhPoC5JtCtJRFsQUgoAuNB5D4CyD2RkpZVLEABJyA+AE0Zd2AWkpVC0DBEgdNWaA8sgUafFSzgAGaspqgkQ7yyTpqW8AALZ+mA/FvIP5BCwvQUxZJFjASYTjF9cH/0SpzeFsAEGAAakH7bAlQ3mQAAAAASUVORK5CYII=';
                    break;
                }
                case 12: {
                    imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M0U3Q0MzMzYwRjcxMTFFN0JEQTdGOENFMjdFMTFGQjIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6M0U3Q0MzMzcwRjcxMTFFN0JEQTdGOENFMjdFMTFGQjIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozRTdDQzMzNDBGNzExMUU3QkRBN0Y4Q0UyN0UxMUZCMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozRTdDQzMzNTBGNzExMUU3QkRBN0Y4Q0UyN0UxMUZCMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnHzyBwAAADlSURBVHjaYvz//z8DLQHj0LcAiE2BWB6IdwPxR5AgtS39D8VTgZifWPUgRyBjPOJwC34CcRUQs9HKgn9A/AqIQ4CYmRYW3AHiv1DahhYWRALxWyj7FBBrUNsCTiAuB+KvQPwHiDcBsSg1LQABHiDuA+Jf0EjvgopRzQIQkAXinVBfgHxTiJayKLYABHSh8QASfwHE3kgpiyoWgIATED+ApqwbUEupagEoWOKgKQuUR7ZAg49qFjBAU1YTNNJBPllHbQsYoOXTdCD+DcQ/aGEBesoiyQJGIgynuD74P1plDm8LAAIMAN1144R1X+ogAAAAAElFTkSuQmCC';
                    break;
                }
                default: {
                    imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M0U3Q0MzMzYwRjcxMTFFN0JEQTdGOENFMjdFMTFGQjIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6M0U3Q0MzMzcwRjcxMTFFN0JEQTdGOENFMjdFMTFGQjIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozRTdDQzMzNDBGNzExMUU3QkRBN0Y4Q0UyN0UxMUZCMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozRTdDQzMzNTBGNzExMUU3QkRBN0Y4Q0UyN0UxMUZCMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnHzyBwAAADlSURBVHjaYvz//z8DLQHj0LcAiE2BWB6IdwPxR5AgtS39D8VTgZifWPUgRyBjPOJwC34CcRUQs9HKgn9A/AqIQ4CYmRYW3AHiv1DahhYWRALxWyj7FBBrUNsCTiAuB+KvQPwHiDcBsSg1LQABHiDuA+Jf0EjvgopRzQIQkAXinVBfgHxTiJayKLYABHSh8QASfwHE3kgpiyoWgIATED+ApqwbUEupagEoWOKgKQuUR7ZAg49qFjBAU1YTNNJBPllHbQsYoOXTdCD+DcQ/aGEBesoiyQJGIgynuD74P1plDm8LAAIMAN1144R1X+ogAAAAAElFTkSuQmCC';
                }
            }
            return imgSrc;
        }
    });
// @factory L.cqkj.windGridLayer(options?: WindGridLayer options)
// 创建格点值图层。options，设置项，继承 L.Rectangle 的options.
    var windGridLayer = function(options) {
        return new WindGridLayer(options);
    };

    /**
     *  @class DataUtil
     *  @aka L.cqkj.DataUtil
     *
     *  数据相关的工具类。
     */
    function DataUtil() {
    }

    /**
     * object clone 浅克隆
     * @param object
     * @returns {*}
     */
    DataUtil.clone = function(object) {
        if (typeof (object) !== 'object' || object == null) return object;
        var newObj = {};
        for (var s in object) {
            newObj[s] = object[s];
        }
        return newObj;
    };
    /**
     * object deepClone 深度克隆
     * @param obj
     * @returns {*}
     */
    DataUtil.deepClone = function(obj) {
        var result;
        var oClass = this.isClass(obj);
        // 确定result的类型
        if (oClass === 'Object') {
            result = {};
        } else if (oClass === 'Array') {
            result = [];
        } else {
            return obj;
        }
        for (var key in obj) {
            var copy = obj[key];
            if (this.isClass(copy) == 'Object') {
                result[key] = this.deepClone(copy);// 递归调用
                // result[key] = arguments.callee(copy);//严格模式不能用
            } else if (this.isClass(copy) == 'Array') {
                result[key] = this.deepClone(copy);
                // result[key] = arguments.callee(copy);
            } else {
                result[key] = obj[key];
            }
        }
        return result;
    };
// 返回传递给他的任意对象的类
    DataUtil.isClass = function(o) {
        if (o === null) return 'Null';
        if (o === undefined) return 'Undefined';
        return Object.prototype.toString.call(o).slice(8, -1);
    };

    /**
     * object deepMerge 对象深度合并    将obj2合并到obj1
     * @param obj1    对象1
     * @param obj2    对象2
     * @returns {*} 返回obj1
     */
    DataUtil.deepMerge = function(obj1, obj2) {
        if (Object.prototype.toString.call(obj1) === '[object Object]' && Object.prototype.toString.call(obj2) === '[object Object]') {
            for (var prop2 in obj2) { // obj1无值,都有取obj2
                if (!obj1[prop2]) {
                    obj1[prop2] = obj2[prop2];
                } else { // 递归赋值
                    obj1[prop2] = this.deepMerge(obj1[prop2], obj2[prop2]);
                }
            }
        } else if (Object.prototype.toString.call(obj1) === '[object Array]' && Object.prototype.toString.call(obj2) === '[object Array]') {
            // 两个都是数组，进行合并
            obj1 = obj1.concat(obj2);
        } else { // 其他情况，取obj2的值
            obj1 = obj2;
        }
        return obj1;
    };

    /**
     *  @class ColorUtil
     *  @aka L.cqkj.ColorUtil
     *
     *  颜色相关的工具类。
     */
    function ColorUtil() {
    }

    /**
     * Convert rgb value to hex value.
     * rgb值转十六进制值
     * @param r
     * @param g
     * @param b
     * @returns {string} eg:'#00ff00'
     */
    ColorUtil.rgbToHex = function(r, g, b) {
        var s = ((r << 16) | (g << 8) | b).toString(16);
        while (s.length < 6) {
            s = '0' + s;
        }
        return '#' + s;
    };

    ColorUtil.toHexColor = function(num) {
        var s = num.toString(16);
        while (s.length < 6) {
            s = '0' + s;
        }
        return '#' + s;
    };

    ColorUtil.asColorStyle = function(r, g, b, a) {
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    };

    /**
     * 十六进制值转rgba值
     * @param sColor
     * @param returnType 0:RGB(0,0,0)||1:[0,0,0]
     * @returns {*}
     */
    ColorUtil.colorToRgb = function(sColor, returnType) {
        sColor = sColor.toLowerCase();
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        if (sColor && reg.test(sColor)) {
            if (sColor.length === 4) {
                var sColorNew = '#';
                for (var i = 1; i < 4; i += 1) {
                    sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                }
                sColor = sColorNew;
            }
            // 处理六位的颜色值
            var sColorChange = [];
            for (var i = 1; i < 7; i += 2) {
                sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
            }
            if (returnType == 0) {
                return 'RGB(' + sColorChange.join(',') + ')';
            } else if (returnType == 1) {
                return sColorChange;
            }
        } else {
            return sColor;
        }
    };
    /**
     * Creates a color scale composed of the specified segments. Segments is an array of two-element arrays of the
     * form [value, color], where value is the point along the scale and color is the [r, g, b] color at that point.
     * For example, the following creates a scale that smoothly transitions from red to green to blue along the
     * points 0.5, 1.0, and 3.5:
     *
     *     [ [ 0.5, [255, 0, 0] ],
     *       [ 1.0, [0, 255, 0] ],
     *       [ 3.5, [0, 0, 255] ] ]
     *
     * @param segments array of color segments
     * @returns {Function} a function(point, alpha) that returns the color [r, g, b, alpha] for the given point.
     */
    ColorUtil.segmentedColorScale = function(segments) {
        var points = [];
        var interpolators = [];
        var ranges = [];
        for (var i = 0; i < segments.length - 1; i++) {
            points.push(segments[i + 1][0]);
            interpolators.push(colorInterpolator(segments[i][1], segments[i + 1][1]));
            ranges.push([segments[i][0], segments[i + 1][0]]);
        }

        return function(point, alpha) {
            var i;
            for (i = 0; i < points.length - 1; i++) {
                if (point <= points[i]) {
                    break;
                }
            }
            var range = ranges[i];
            return interpolators[i](proportion(point, range[0], range[1]), alpha);
        };
    };

    /**
     *  @class IsolineLayer
     *  @aka L.cqkj.IsolineLayer
     *  @inherits L.LayerGroup
     *
     *  等值线图层。继承至`L.LayerGroup`。
     *  @example
     *  ```js
     * var appMap = L.cqkj.initMap("map";
     * var isolineLayer = L.cqkj.isolineLayer();
     * appMap.loadLayer(isolineLayer,1);
     * ```
     */
    var IsolineLayer = L.LayerGroup.extend({
        // @section
        // @aka IsolineLayer options
        // 设置继承至`L.LayerGroup` ,`Path`
        options: {
            // @option stroke: Boolean = true
            // 等值线是否显示
            stroke: true,
            // @option color: String = '#ff0000'
            // 等值线颜色
            color: '#ff0000',
            // @option weight: Number = 1
            // 等值线宽度
            weight: 1,
            // @option opacity: Number = 1
            // 等值线透明度
            opacity: 1,
            fill: false
        },

        initialize: function(options) {
            this._layers = {};
            L.setOptions(this, options);
        },

        setData: function(lineItems) {
            this.clearLayers();
            for (var i = 0; i < lineItems.length; i++) {
                var lineItem = lineItems[i];
                var options = DataUtil.clone(this.options);
                options.color = ColorUtil.toHexColor(lineItem.linecolor);
                options.linevalue = lineItem.linevalue;
                options.active = true;
                L.polyline(lineItem.points, options).addTo(this);
            }
        },

        // @method everyMarker(fun: Function)
        // 回调函数。可以获得每一个Marker。
        updateLines: function() {
            for (var s in this._layers) {
                var m = this._layers[s];
                if (m.options.active) {
                    m.options.stroke = this.options.stroke;
                    m.setStyle(m.options);
                    m.redraw();
                }
            }
        },

        // @method everyMarker(fun: Function)
        // 回调函数。可以获得每一个polyline。
        everyPolyline: function(fun) {
            for (var s in this._layers) {
                var m = this._layers[s];
                fun(m);
            }
        },
        setPolylineDefault: function() {
            this.everyPolyline(function(line) {
                line.options.active = true;
                line.setStyle({
                    stroke: true
                });
            });
        },

        // @method setLineVisible(visible: Boolean)
        // 设置等值线是否显示。
        setLineVisible: function(visible) {
            this.options.stroke = visible;
            this.updateLines();
        }

    });
// @factory L.cqkj.isolineLayer(options?: IsolineLayer options)
// 创建等值线等值面图层。options，设置项，继承 `L.LayerGroup` 、`Path` 的options.
    var isolineLayer = function(options) {
        return new IsolineLayer(options);
    };

    var PolygonUnion = L.Polygon.extend({
        options: {
            renderer: L.svg(),
            maskGeoJson: null,
            pointerEvents: 'none'
        },

        line: null,

        initialize: function(latlngs, options) {
            L.setOptions(this, options);
            this._latlngs = latlngs;
            this.line = d3.line();
        },
        _project: function() {
            this._rings = '';
            this._projectLatlngs(this._latlngs);
        },
        // recursively turns latlngs into a set of rings with projected coordinates
        _projectLatlngs: function(latlngs) {
            for (var i = 0; i < latlngs.length; i++) {
                /*            var planeType = latlngs[i].subplanetype;
                 var interpolateType;
                 if (planeType == 0)
                 interpolateType = 'linear';
                 else if (planeType == 1)
                 interpolateType = 'basis';
                 else
                 interpolateType = 'basis-closed';
                 this.line.interpolate(interpolateType);
                 this.line = d3.interpolateBasis(this.line);*/
                var items = latlngs[i].pointitems;
                var ring = [];
                for (var j = 0; j < items.length; j++) {
                    var p = this._map.latLngToLayerPoint(items[j]);
                    ring[j] = [p.x, p.y];
                }
                var d = this.line(ring);
                // 去除第一个Move点后MoveTo的点
                /*            if (i != 0 && planeType != 3 && d.charAt(0) == 'M') {
                 d = d.slice(1);
                 while (d.charCodeAt(0) < 65) {//Tip:数字和','的Unicode编码均小于65
                 d = d.slice(1);
                 }
                 }*/
                this._rings += d;
            }
        },

        _updatePath: function() {
            this._renderer._setPath(this, this._rings);
        },

        _updateStyle: function() {
            this._renderer._updateStyle(this);
        }
    });

    var polygonUnion = function(latlngs, options) {
        return new PolygonUnion(latlngs, options);
    };

    /**
     *  @class IsosurfaceLayer
     *  @aka L.cqkj.IsosurfaceLayer
     *  @inherits L.LayerGroup
     *
     *  等值面和等值线图层。继承至`L.LayerGroup`。
     *  @example
     *  ```js
     * var appMap = L.cqkj.initMap("map";
     * var isosurfaceLayer = L.cqkj.isosurfaceLayer();
     * appMap.loadLayer(isosurfaceLayer,1);
     * ```
     */
    var IsosurfaceLayer = L.LayerGroup.extend({
        // @section
        // @aka IsosurfaceLayer options
        // 设置继承至`L.LayerGroup` ,`Path`
        options: {
            // @option stroke: Boolean = false
            // 等值面边界是否显示
            stroke: false,
            // @option fill: Boolean = true
            // 是否显示等值面
            fill: true,
            // @option fillOpacity: Number = 1
            // 等值面透明度
            fillOpacity: 1
        },

        initialize: function(options) {
            this._layers = {};
            L.setOptions(this, options);
        },
        // @method setData(data: Object)
        // 设置等值面数据。
        setData: function(data) {
            if (this._map) {
                this.clearLayers();
                for (var i = 0; i < data.length; i++) {
                    var o = data[i];
                    var options = DataUtil.clone(this.options);
                    options.fillColor = ColorUtil.toHexColor(o.planecolor);
                    if (options.fillColor === '#ffffff') {
                        options.fillOpacity = 0;
                    }
                    options.active = true;
                    options.planevalue = o.planevalue;
                    polygonUnion(o.subplaneitems, options).addTo(this);
                }
            }
        },
        // @method everyMarker(fun: Function)
        // 回调函数。可以获得每一个polygon。
        everyMarker: function(fun) {
            for (var s in this._layers) {
                var m = this._layers[s];
                if (m.options.active === true) {
                    m.options.fill = this.options.fill;
                    m.options.stroke = this.options.stroke;
                    fun(m);
                }
            }
        },
        // @method everyPolygon(fun: Function)
        // 回调函数。可以获得每一个polygon。
        everyPolygon: function(fun) {
            for (var s in this._layers) {
                var m = this._layers[s];
                fun(m);
            }
        },
        setPolygonDefault: function() {
            this.everyPolygon(function(polygon) {
                polygon.options.active = true;
                polygon.setStyle({
                    fill: true
                });
            });
        },
        // @method setFillVisible(visible: Boolean)
        // 设置等值面是否显示。
        setFillVisible: function(visible) {
            this.options.fill = visible;
            this.everyMarker(this._updateStyle);
        },
        _updateStyle: function(geo) {
            if (geo instanceof PolygonUnion) {
                geo._updateStyle();
            }
        }
    });
// @factory L.cqkj.isosurfaceLayer(options?: IsosurfaceLayer options)
// 创建等值线等值面图层。options，设置项，继承 `L.LayerGroup` 、`Path` 的options.
    var isosurfaceLayer = function(options) {
        return new IsosurfaceLayer(options);
    };

    /**
     *  @class PlpLayer
     *  @aka L.cqkj.PlpLayer
     *  @inherits L.LayerGroup
     *
     *  创建包括等值面等值线格点的综合图层。继承至`L.LayerGroup`。
     *  @example
     *  ```js
     * var appMap = L.cqkj.initMap("map",{}};
     * var plpLayer = L.cqkj.plpLayer({gridDistanceScale: 10, fillOpacity: 1});
     * plpLayer.setData(data);
     * appMap.loadLayer(plpLayer,1);
     * ```
     */
    var PlpLayer = L.LayerGroup.extend({
        // @section
        // @aka PlpLayer options
        options: {
            line: true,
            lineOptions: {
                stroke: true,
                weight: 1,
                opacity: 1
            },
            // @option fill: Boolean = true
            // 是否显示等值面填充
            polygon: true,
            polygonOptions: {
                // @option stroke: Boolean = false
                // 是否显示等值面边界
                stroke: false,
                fill: true,
                // @option fillOpacity: Number = 0.8
                // 等值面的透明度
                fillOpacity: 0.8,
                renderer: L.svg()
            },
            // @option grid: Boolean = true
            // 是否显示格点
            grid: true,
            gridOptions: {
                // @option valueColor: String = '#444'
                // 格点值字体颜色
                valueColor: '#444',
                // @option font: String = '12px sans-serif'
                // 格点值字体设置，相同于canvas的字体设置。
                font: '12px sans-serif',
                // @option distanceScale: Number = 1
                // 格点值的疏密程度。随着值得增大越稀疏
                distanceScale: 1
            }
        },
        // @property isosurfaceLayer: L.cqkj.IsosurfaceLayer; 等值面图层。
        isosurfaceLayer: null,

        initialize: function(options) {
            this._layers = {};
            // 合并设置配置项
            this.options = DataUtil.deepMerge(this.options, options);

            // 等值面
            if (this.options.polygon) {
                this.isosurfaceLayer = isosurfaceLayer(this.options.polygonOptions);
                this.addLayer(this.isosurfaceLayer);
            }
            // 等值线
            if (this.options.line) {
                this.isolineLayer = isolineLayer(this.options.lineOptions);
                this.addLayer(this.isolineLayer);
            }
            // 格点
            if (this.options.grid) {
                this.gridLayer = gridValueLayer(this.options.gridOptions);
                this.addLayer(this.gridLayer);
            }
        },
        // @method setData(data: Object)
        // 设置数据（包括等值面、等值线、等值线标注和格点数据）。
        setData: function(data) {
            data.planeitems && this.isosurfaceLayer && this.isosurfaceLayer.setData(data.planeitems);
            // 等值线图层
            data.lineItems && this.isolineLayer && this.isolineLayer.setData(data.lineItems);
            // 设置格点数据
            data.data && this.gridLayer && this.gridLayer.setData(data);
        },
        // @method clear()
        // 清空所有图层的数据。
        clear: function() {
            this.isosurfaceLayer && this.isosurfaceLayer.clearLayers();
            this.isolineLayer && this.isolineLayer.clearLayers();
            this.gridLayer && this.gridLayer.clear();
        },
        // @method setFillVisible(visible:Boolean)
        // 设置是否显示等值面图层。
        setFillVisible: function(visible) {
            if (this.isosurfaceLayer) {
                this.isosurfaceLayer.setFillVisible(visible);
            } else {
                throw Error('等值面图层不存在，setFillVisible方法执行无效。');
            }
        },
        // @method setLineVisible(visible:Boolean)
        // 设置是否显示等值线。
        setLineVisible: function(visible) {
            if (this.isolineLayer) {
                this.isolineLayer.setLineVisible(visible);
            } else {
                throw Error('等值线图层不存在，setLineVisible方法执行无效。');
            }
        },
        // @method setGridVisible(visible:Boolean)
        // 设置是否显示格点图层。
        setGridVisible: function(visible) {
            if (this.gridLayer) {
                this.gridLayer.options.gridValueVisible = visible;
                this.gridLayer._update();
            } else {
                throw Error('格点图层不存在，setGridVisible方法执行无效。');
            }
        },
        // @method setGridDistanceScale(value:Number)
        // 设置格点的疏密度。
        setGridDistanceScale: function(value) {
            if (this.gridLayer) {
                this.gridLayer.options.distanceScale = value;
                this.gridLayer._update();
            } else {
                throw Error('格点图层不存在，setGridDistanceScale方法执行无效。');
            }
        }
    });
// @factory L.cqkj.plpLayer(options?: PlpLayer options)
// 创建包括等值面等值线格点的综合图层。options，设置项，继承L.LayerGroup 的options.
    var plpLayer = function(options) {
        return new PlpLayer(options);
    };

    /**
     *  @class StationMarkerLayer
     *  @aka L.cqkj.StationMarkerLayer
     *  @inherits L.LayerGroup
     *
     *  等值线图层。继承至`L.LayerGroup`。
     *  @example
     *  ```js
     * var appMap = L.cqkj.initMap("map";
     * var stationMarkerLayer = L.cqkj.stationMarkerLayer();
     * appMap.loadLayer(stationMarkerLayer,1);
     * ```
     */
    var StationMarkerLayer = L.LayerGroup.extend({
        // @section
        // @aka StationMarkerLayer options
        // 设置继承至`L.LayerGroup`
        options: {},

        initialize: function(options) {
            this._layers = {};
            L.setOptions(this, options);
        },
        setData: function(datas, className, htmlTemplete) {
            var _self = this;
            this.clearLayers();
            if (datas) {
                for (var i = 0; i < datas.length; i++) {
                    var data = datas[i];
                    var htmlStr = L.Util.template(htmlTemplete, data);
                    var divIcon = L.divIcon({
                        html: htmlStr,
                        className: className
                    });
                    var marker = L.marker([data.lat, data.lng], {
                        icon: divIcon,
                        data: data
                    }).on('click', function(e) {
                        _self.fire('click', { data: e.target.options.data });
                    }).on('mouseover', function(e) {
                        _self.fire('mouseover', { data: e.target.options.data });
                    }).on('mouseout', function(e) {
                        _self.fire('mouseout', { data: e.target.options.data });
                    }).addTo(this);
                    /* if(popupHtmlTemplete){
                     marker.bindTooltip(popupHtmlTemplete,{className:popupClassName,direction:"top"});
                     }*/
                }
            } else {
                throw new Error('datas不存在');
            }
            console.log(this._layers);
        }

    });
// @factory L.cqkj.isolineLayer(options?: IsolineLayer options)
// 创建等值线等值面图层。options，设置项，继承 `L.LayerGroup` 、`Path` 的options.
    var stationMarkerLayer = function(options) {
        return new StationMarkerLayer(options);
    };

    var isMSIE8 = !('getComputedStyle' in window && typeof window.getComputedStyle === 'function');

    function extensions(parentClass) {
        return {

            initialize: function(arg1, arg2) {
                var options;
                this._originalLayers = [];
                this._visibleLayers = [];
                this._staticLayers = [];
                this._rbush = [];
                this._cachedRelativeBoxes = [];

                this._rbush = null;
                if (parentClass === L.GeoJSON) {
                    parentClass.prototype.initialize.call(this, arg1, arg2);
                    options = arg2;
                } else {
                    parentClass.prototype.initialize.call(this, arg1);
                    options = arg1;
                }
                this._margin = options.margin || 0;
            },

            addLayer: function(layer) {
                if (!('options' in layer) || !('icon' in layer.options)) {
                    this._staticLayers.push(layer);
                    parentClass.prototype.addLayer.call(this, layer);
                    return;
                }

                this._originalLayers.push(layer);
                if (this._map) {
                    this._maybeAddLayerToRBush(layer);
                }
            },

            removeLayer: function(layer) {
                this._rbush.remove(this._cachedRelativeBoxes[layer._leaflet_id]);
                delete this._cachedRelativeBoxes[layer._leaflet_id];
                parentClass.prototype.removeLayer.call(this, layer);
                var i;

                i = this._originalLayers.indexOf(layer);
                if (i !== -1) {
                    this._originalLayers.splice(i, 1);
                }

                i = this._visibleLayers.indexOf(layer);
                if (i !== -1) {
                    this._visibleLayers.splice(i, 1);
                }

                i = this._staticLayers.indexOf(layer);
                if (i !== -1) {
                    this._staticLayers.splice(i, 1);
                }
            },

            clearLayers: function() {
                this._rbush = rbush();
                this._originalLayers = [];
                this._visibleLayers = [];
                this._staticLayers = [];
                this._cachedRelativeBoxes = [];
                parentClass.prototype.clearLayers.call(this);
            },

            onAdd: function(map) {
                this._map = map;

                for (var i in this._staticLayers) {
                    map.addLayer(this._staticLayers[i]);
                }

                this._onMoveEnd();
                map.on('moveend', this._onMoveEnd, this);
            },

            onRemove: function(map) {
                for (var i in this._staticLayers) {
                    map.removeLayer(this._staticLayers[i]);
                }
                map.off('moveend', this._onMoveEnd, this);
                parentClass.prototype.onRemove.call(this, map);
            },

            _maybeAddLayerToRBush: function(layer) {
                var z = this._map.getZoom();
                var bush = this._rbush;

                var boxes = this._cachedRelativeBoxes[layer._leaflet_id];
                var visible = false;
                if (!boxes) {
                    // Add the layer to the map so it's instantiated on the DOM,
                    //   in order to fetch its position and size.
                    parentClass.prototype.addLayer.call(this, layer);
                    var visible = true;
// 			var htmlElement = layer._icon;
                    var box = this._getIconBox(layer._icon);
                    boxes = this._getRelativeBoxes(layer._icon.children, box);
                    boxes.push(box);
                    this._cachedRelativeBoxes[layer._leaflet_id] = boxes;
                }

                boxes = this._positionBoxes(this._map.latLngToLayerPoint(layer.getLatLng()), boxes);

                var collision = false;
                for (var i = 0; i < boxes.length && !collision; i++) {
                    collision = bush.search(boxes[i]).length > 0;
                }

                if (!collision) {
                    if (!visible) {
                        parentClass.prototype.addLayer.call(this, layer);
                    }
                    this._visibleLayers.push(layer);
                    bush.load(boxes);
                } else {
                    parentClass.prototype.removeLayer.call(this, layer);
                }
            },

            // Returns a plain array with the relative dimensions of a L.Icon, based
            //   on the computed values from iconSize and iconAnchor.
            _getIconBox: function(el) {
                if (isMSIE8) {
                    // Fallback for MSIE8, will most probably fail on edge cases
                    return [0, 0, el.offsetWidth, el.offsetHeight];
                }

                var styles = window.getComputedStyle(el);

                // getComputedStyle() should return values already in pixels, so using parseInt()
                //   is not as much as a hack as it seems to be.

                return [
                    parseInt(styles.marginLeft),
                    parseInt(styles.marginTop),
                    parseInt(styles.marginLeft) + parseInt(styles.width),
                    parseInt(styles.marginTop) + parseInt(styles.height)
                ];
            },

            // Much like _getIconBox, but works for positioned HTML elements, based on offsetWidth/offsetHeight.
            _getRelativeBoxes: function(els, baseBox) {
                var boxes = [];
                for (var i = 0; i < els.length; i++) {
                    var el = els[i];
                    var box = [
                        el.offsetLeft,
                        el.offsetTop,
                        el.offsetLeft + el.offsetWidth,
                        el.offsetTop + el.offsetHeight
                    ];
                    box = this._offsetBoxes(box, baseBox);
                    boxes.push(box);

                    if (el.children.length) {
                        var parentBox = baseBox;
                        if (!isMSIE8) {
                            var positionStyle = window.getComputedStyle(el).position;
                            if (positionStyle === 'absolute' || positionStyle === 'relative') {
                                parentBox = box;
                            }
                        }
                        boxes = boxes.concat(this._getRelativeBoxes(el.children, parentBox));
                    }
                }
                return boxes;
            },

            _offsetBoxes: function(a, b) {
                return [
                    a[0] + b[0],
                    a[1] + b[1],
                    a[2] + b[0],
                    a[3] + b[1]
                ];
            },

            // Adds the coordinate of the layer (in pixels / map canvas units) to each box coordinate.
            _positionBoxes: function(offset, boxes) {
                var newBoxes = [];	// Must be careful to not overwrite references to the original ones.
                for (var i = 0; i < boxes.length; i++) {
                    newBoxes.push(this._positionBox(offset, boxes[i]));
                }
                return newBoxes;
            },

            _positionBox: function(offset, box) {
                return [
                    box[0] + offset.x - this._margin,
                    box[1] + offset.y - this._margin,
                    box[2] + offset.x + this._margin,
                    box[3] + offset.y + this._margin
                ];
            },

            _onMoveEnd: function() {
                for (var i = 0; i < this._visibleLayers.length; i++) {
                    parentClass.prototype.removeLayer.call(this, this._visibleLayers[i]);
                }

                this._rbush = rbush();
                var bound = this._map.getBounds();
                for (var i = 0; i < this._originalLayers.length; i++) {
                    if (bound.contains(this._originalLayers[i].getLatLng())) {
                        this._maybeAddLayerToRBush(this._originalLayers[i]);
                    }
                }
            }
        };
    }

    var LayerGroupCollision = L.LayerGroup.extend(extensions(L.LayerGroup));
    var FeatureGroupCollision = L.FeatureGroup.extend(extensions(L.FeatureGroup));
    var GeoJSONCollision = L.GeoJSON.extend(extensions(L.GeoJSON));

    var layergroupcollision = function(options) {
        return new LayerGroupCollision(options || {});
    };

    var featuregroupcollision = function(options) {
        return new FeatureGroupCollision(options || {});
    };

    var geojsoncollision = function(geojson, options) {
        return new GeoJSONCollision(geojson, options || {});
    };

    /**
     *  @class BaseLayers
     *  @aka L.cqkj.BaseLayers
     *
     *  创建底图切换控件 继承至 L.Control。
     *  @example
     *  ```js
     *  var basemaps = [
     L.cqkj.webTileMapLayer('TianDiTu.Common.Map', {id: "TianDiTu.Common.Map_0"}),
     L.cqkj.webTileMapLayer('TianDiTu.Satellite.Map', {id: "TianDiTu.Satellite.Map_0",}),
     L.cqkj.webTileMapLayer('TianDiTu.Terrain.Map', {id: "TianDiTu.Terrain.Map_0"}),
     ];
     var baseLayersControl = L.cqkj.baseLayers({
            basemaps: basemaps,
            position: 'topright',
            tileX: 0,
            tileY: 0,
            tileZ: 1
            });
     map.addControl(baseLayersControl);
     * ```
     */
    var BaseLayers = L.Control.extend({
        /**
         * @section
         * @aka BaseLayers options
         * @option basemaps: Array = []
         * 要切换的图层的数组
         * @option tileX: Number = 0
         * 瓦片X的金字塔索引
         * @option tileY: Number = 0
         * 瓦片Y的金字塔索引
         * @option tileZ: Number = 0
         * 瓦片金字塔级别
         */
        _map: null,
        includes: L.Evented ? L.Evented.prototype : L.Mixin.Event,
        options: {
            position: 'bottomright',
            tileX: 0,
            tileY: 0,
            tileZ: 0,
            layers: []
        },
        basemap: null,
        onAdd: function(map) {
            this._map = map;
            var container = L.DomUtil.create('div', 'basemaps leaflet-control closed');

            // disable events
            L.DomEvent.disableClickPropagation(container);
            if (!L.Browser.touch) {
                L.DomEvent.disableScrollPropagation(container);
            }

            this.options.basemaps.forEach(function(d, i) {
                var basemapClass = 'basemap';

                if (i === 0) {
                    this.basemap = d;
                    this._map.addLayer(d);
                    basemapClass += ' alt active';
                }
                /*            else if (i === 1) {
                 basemapClass += ' active'
                 }*/

                var coords = { x: this.options.tileX, y: this.options.tileY };
                var url = L.Util.template(d._url, L.extend({
                    s: d._getSubdomain(coords),
                    x: coords.x,
                    y: d.options.tms ? d._globalTileRange.max.y - coords.y : coords.y,
                    z: this.options.tileZ
                }, d.options));

                if (d instanceof L.TileLayer.WMS) {
                    // d may not yet be initialized, yet functions below expect ._map to be set
                    d._map = map;

                    // unfortunately, calling d.getTileUrl() does not work due to scope issues
                    // have to replicate some of the logic from L.TileLayer.WMS

                    // adapted from L.TileLayer.WMS::onAdd
                    var crs = d.options.crs || map.options.crs;
                    var wmsParams = L.extend({}, d.wmsParams);
                    var wmsVersion = parseFloat(wmsParams.version);
                    var projectionKey = wmsVersion >= 1.3 ? 'crs' : 'srs';
                    wmsParams[projectionKey] = crs.code;

                    // adapted from L.TileLayer.WMS::getTileUrl
                    var coords2 = L.point(coords);
                    coords2.z = this.options.tileZ;
                    var tileBounds = d._tileCoordsToBounds(coords2);
                    var nw = crs.project(tileBounds.getNorthWest());
                    var se = crs.project(tileBounds.getSouthEast());
                    var bbox = (wmsVersion >= 1.3 && crs === L.CRS.EPSG4326
                        ? [se.y, nw.x, nw.y, se.x]
                        : [nw.x, se.y, se.x, nw.y]).join(',');

                    url += L.Util.getParamString(wmsParams, url, d.options.uppercase) +
                        (d.options.uppercase ? '&BBOX=' : '&bbox=') + bbox;
                }

                var basemapNode = L.DomUtil.create('div', basemapClass, container);
                var imgNode = L.DomUtil.create('img', null, basemapNode);
                imgNode.src = url;
                if (d.options && d.options.label) {
                    imgNode.title = d.options.label;
                }

                L.DomEvent.on(basemapNode, 'click', function() {
                    // if different, remove previous basemap, and add new one
                    if (d != this.basemap) {
                        map.removeLayer(this.basemap);
                        map.addLayer(d);
                        d.bringToBack();
                        map.fire('baselayerchange', d);
                        this.basemap = d;

                        L.DomUtil.removeClass(container.getElementsByClassName('basemap active')[0], 'active');
                        L.DomUtil.addClass(basemapNode, 'active');

                        var altIdx = (i) % this.options.basemaps.length;
                        L.DomUtil.removeClass(container.getElementsByClassName('basemap alt')[0], 'alt');
                        L.DomUtil.addClass(container.getElementsByClassName('basemap')[altIdx], 'alt');
                    }
                }, this);
            }, this);

            if (this.options.basemaps.length > 2) {
                L.DomEvent.on(container, 'mouseenter', function() {
                    L.DomUtil.removeClass(container, 'closed');
                }, this);

                L.DomEvent.on(container, 'mouseleave', function() {
                    L.DomUtil.addClass(container, 'closed');
                }, this);
            }

            this._container = container;
            return this._container;
        }
    });
// @factory L.cqkj.baseLayers(options?: BaseLayers options)
// 创建底图切换控件。options，设置项，继承 L.Control 的options.
    var baseLayers = function(options) {
        return new BaseLayers(options);
    };

    var Scale = L.Control.extend({
        options: {
            position: 'bottomleft',
            maxWidth: 150,
            metric: !0,
            imperial: !1,
            updateWhenIdle: !1
        },
        onAdd: function(t) {
            this._map = t;
            var e = 'leaflet-control-better-scale';
            var i = L.DomUtil.create('div', e);
            var n = this.options;
            var s = L.DomUtil.create('div', e + '-ruler', i);
            L.DomUtil.create('div', e + '-ruler-block ' + e + '-upper-first-piece', s), L.DomUtil.create('div', e + '-ruler-block ' + e + '-upper-second-piece', s), L.DomUtil.create('div', e + '-ruler-block ' + e + '-lower-first-piece', s), L.DomUtil.create('div', e + '-ruler-block ' + e + '-lower-second-piece', s);
            return this._addScales(n, e, i), this.ScaleContainer = i, t.on(n.updateWhenIdle ? 'moveend' : 'move', this._update, this), t.whenReady(this._update, this), i;
        },
        onRemove: function(t) {
            t.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
        },
        _addScales: function(t, e, i) {
            this._iScale = L.DomUtil.create('div', e + '-label-div', i), this._iScaleLabel = L.DomUtil.create('div', e + '-label', this._iScale), this._iScaleFirstNumber = L.DomUtil.create('div', e + '-label ' + e + '-first-number', this._iScale), this._iScaleSecondNumber = L.DomUtil.create('div', e + '-label ' + e + '-second-number', this._iScale);
        },
        _update: function() {
            var t = this._map.getBounds();
            var e = t.getCenter().lat;
            var i = 6378137 * Math.PI * Math.cos(e * Math.PI / 180);
            var n = i * (t.getNorthEast().lng - t.getSouthWest().lng) / 180;
            var o = this._map.getSize();
            var s = this.options;
            var a = 0;
            o.x > 0 && (a = n * (s.maxWidth / o.x)), this._updateScales(s, a);
        },
        _updateScales: function(t, e) {
            t.metric && e && this._updateMetric(e), t.imperial && e && this._updateImperial(e);
        },
        _updateMetric_old: function(t) {
            var e = this._getRoundNum(t);
            this._iScale.style.width = this._getScaleWidth(e / t) + 'px', this._iScaleLabel.innerHTML = e < 1e3 ? e + ' m' : e / 1e3 + ' km';
        },
        _updateMetric: function(t) {
            var e;
            var i;
            var n;
            var o;
            var s;
            var a = t;
            var r = this._iScaleFirstNumber;
            var h = this._iScaleSecondNumber;
            var l = this._iScale;
            var u = this._iScaleLabel;
            u.innerHTML = '0', a > 500 ? (e = a / 1000, i = this._getRoundNum(e), o = this._getRoundNum(e / 2), l.style.width = this._getScaleWidth(i / e) + 'px', r.innerHTML = o, h.innerHTML = i + 'km') : (n = this._getRoundNum(a), s = this._getRoundNum(a / 2), l.style.width = this._getScaleWidth(n / a) + 'px', r.innerHTML = s, h.innerHTML = n + 'm');
        },
        _updateImperial: function(t) {
            var e;
            var i;
            var n;
            var o;
            var s;
            var a = 3.2808399 * t;
            var r = this._iScaleFirstNumber;
            var h = this._iScaleSecondNumber;
            var l = this._iScale;
            var u = this._iScaleLabel;
            u.innerHTML = '0', a > 2640 ? (e = a / 5280, i = this._getRoundNum(e), o = this._getRoundNum(e / 2), l.style.width = this._getScaleWidth(i / e) + 'px', r.innerHTML = o, h.innerHTML = i + 'mi') : (n = this._getRoundNum(a), s = this._getRoundNum(a / 2), l.style.width = this._getScaleWidth(n / a) + 'px', r.innerHTML = s, h.innerHTML = n + 'ft');
        },
        _getScaleWidth: function(t) {
            return Math.round(this.options.maxWidth * t) - 10;
        },
        _getRoundNum: function(t) {
            if (t >= 2) {
                var e = Math.pow(10, (Math.floor(t) + '').length - 1);
                var i = t / e;
                return i = i >= 10 ? 10 : i >= 5 ? 5 : i >= 3 ? 3 : i >= 2 ? 2 : 1, e * i;
            }
            return (Math.round(100 * t) / 100).toFixed(1);
        }
    });

    var scale = function(options) {
        return new Scale(options);
    };

    var Util = {
        isExistFileOnServer: function(filePath) {
            var xmlhttp;
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            } else {
                xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
            }
            xmlhttp.open('GET', filePath, false);
            xmlhttp.send();
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) return true;
                else if (xmlhttp.status == 404) return false;
                else return false;
            }
        },
        tileFileUrlFormat: function(numStr, n) {
            var len = numStr.length;
            while (len < n) {
                numStr = '0' + numStr;
                len++;
            }
            return numStr;
        },
        contain: function(p, poly) {
            var px = p[0];
            var py = p[1];
            var flag = false;
            for (var i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
                var sx = poly[i][0];
                var sy = poly[i][1];
                var tx = poly[j][0];
                var ty = poly[j][1];
                // 点与多边形顶点重合
                if ((sx === px && sy === py) || (tx === px && ty === py)) {
                    return true;
                }
                // 判断线段两端点是否在射线两侧
                if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
                    // 线段上与射线 Y 坐标相同的点的 X 坐标
                    var x = sx + (py - sy) * (tx - sx) / (ty - sy);
                    // 点在多边形的边上
                    if (x === px) {
                        return true;
                    }
                    // 射线穿过多边形的边界
                    if (x > px) {
                        flag = !flag;
                    }
                }
            }
            // 射线穿过多边形边界的次数为奇数时点在多边形内
            return flag;
        },
        floatAdd: function(arg1, arg2) {
            var r1, r2, m, c;
            try {
                r1 = arg1.toString().split('.')[1].length;
            } catch (e) {
                r1 = 0;
            }
            try {
                r2 = arg2.toString().split('.')[1].length;
            } catch (e) {
                r2 = 0;
            }
            c = Math.abs(r1 - r2);
            m = Math.pow(10, Math.max(r1, r2));
            if (c > 0) {
                var cm = Math.pow(10, c);
                if (r1 > r2) {
                    arg1 = Number(arg1.toString().replace('.', ''));
                    arg2 = Number(arg2.toString().replace('.', '')) * cm;
                } else {
                    arg1 = Number(arg1.toString().replace('.', '')) * cm;
                    arg2 = Number(arg2.toString().replace('.', ''));
                }
            } else {
                arg1 = Number(arg1.toString().replace('.', ''));
                arg2 = Number(arg2.toString().replace('.', ''));
            }
            return (arg1 + arg2) / m;
        }
    };

    var CoordinateUtil = {
        PI: 3.14159265358979324,
        x_pi: 3.14159265358979324 * 3000.0 / 180.0,
        Convert_GCJ02_To_BD09: function(lat, lng) {
            var x = lng;
            var y = lat;
            var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.x_pi);
            var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.x_pi);
            lng = z * Math.cos(theta) + 0.0065;
            lat = z * Math.sin(theta) + 0.006;
            return [lat, lng];
        },
        Convert_BD09_To_GCJ02: function(lat, lng) {
            var x = lng - 0.0065;
            var y = lat - 0.006;
            var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi);
            var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi);
            lng = z * Math.cos(theta);
            lat = z * Math.sin(theta);
            return [lat, lng];
        },
        delta: function(lat, lon) {
            var a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
            var ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
            var dLat = this.transformLat(lon - 105.0, lat - 35.0);
            var dLon = this.transformLon(lon - 105.0, lat - 35.0);
            var radLat = lat / 180.0 * this.PI;
            var magic = Math.sin(radLat);
            magic = 1 - ee * magic * magic;
            var sqrtMagic = Math.sqrt(magic);
            dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * this.PI);
            dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * this.PI);
            return { 'lat': dLat, 'lon': dLon };
        },

        // WGS-84 to GCJ-02
        gcj_encrypt: function(wgsLat, wgsLon) {
            if (this.outOfChina(wgsLat, wgsLon)) {
                return { 'lat': wgsLat, 'lon': wgsLon };
            }

            var d = this.delta(wgsLat, wgsLon);
            return { 'lat': wgsLat + d.lat, 'lon': wgsLon + d.lon };
        },
        // GCJ-02 to WGS-84
        gcj_decrypt: function(gcjLat, gcjLon) {
            if (this.outOfChina(gcjLat, gcjLon)) {
                return { 'lat': gcjLat, 'lon': gcjLon };
            }

            var d = this.delta(gcjLat, gcjLon);
            return { 'lat': gcjLat - d.lat, 'lon': gcjLon - d.lon };
        },
        // GCJ-02 to WGS-84 exactly
        gcj_decrypt_exact: function(gcjLat, gcjLon) {
            var initDelta = 0.01;
            var threshold = 0.000000001;
            var dLat = initDelta;
            var dLon = initDelta;
            var mLat = gcjLat - dLat;
            var mLon = gcjLon - dLon;
            var pLat = gcjLat + dLat;
            var pLon = gcjLon + dLon;
            var wgsLat;
            var wgsLon;
            var i = 0;
            while (1) {
                wgsLat = (mLat + pLat) / 2;
                wgsLon = (mLon + pLon) / 2;
                var tmp = this.gcj_encrypt(wgsLat, wgsLon);
                dLat = tmp.lat - gcjLat;
                dLon = tmp.lon - gcjLon;
                if ((Math.abs(dLat) < threshold) && (Math.abs(dLon) < threshold)) {
                    break;
                }

                if (dLat > 0) pLat = wgsLat; else mLat = wgsLat;
                if (dLon > 0) pLon = wgsLon; else mLon = wgsLon;

                if (++i > 10000) break;
            }
            return { 'lat': wgsLat, 'lon': wgsLon };
        },
        // GCJ-02 to BD-09
        bd_encrypt: function(gcjLat, gcjLon) {
            var x = gcjLon;
            var y = gcjLat;
            var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.x_pi);
            var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.x_pi);
            var bdLon = z * Math.cos(theta) + 0.0065;
            var bdLat = z * Math.sin(theta) + 0.006;
            return { 'lat': bdLat, 'lon': bdLon };
        },
        // BD-09 to GCJ-02
        bd_decrypt: function(bdLat, bdLon) {
            var x = bdLon - 0.0065;
            var y = bdLat - 0.006;
            var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi);
            var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi);
            var gcjLon = z * Math.cos(theta);
            var gcjLat = z * Math.sin(theta);
            return { 'lat': gcjLat, 'lon': gcjLon };
        },
        // BD09=>WGS84 百度坐标系=>gps坐标系
        bd092WGS: function(glat, glon) {
            var latlon = this.bd_decrypt(glat, glon);
            return this.gcj_decrypt(latlon.lat, latlon.lon);
        },
        // WGS84=》BD09   gps坐标系=>百度坐标系
        wgs2BD09: function(wgLat, wgLon) {
            var latlon = this.gcj_encrypt(wgLat, wgLon);
            return this.bd_encrypt(latlon.lat, latlon.lon);
        },
        // WGS-84经纬度坐标 to Web mercator web墨卡托坐标
        // mercatorLat -> y mercatorLon -> x
        mercator_encrypt: function(wgsLat, wgsLon) {
            var x = wgsLon * 20037508.34 / 180.0;
            var y = Math.log(Math.tan((90.0 + wgsLat) * this.PI / 360.0)) / (this.PI / 180.0);
            y = y * 20037508.34 / 180.0;
            return { 'lat': y, 'lon': x };
        },
        // Web mercator to WGS-84
        // mercatorLat -> y mercatorLon -> x
        mercator_decrypt: function(mercatorLat, mercatorLon) {
            var x = mercatorLon / 20037508.34 * 180.0;
            var y = mercatorLat / 20037508.34 * 180.0;
            y = 180 / this.PI * (2 * Math.atan(Math.exp(y * this.PI / 180.0)) - this.PI / 2);
            return { 'lat': y, 'lon': x };
        },
        // two point's distance
        distance: function(latA, lonA, latB, lonB) {
            var earthR = 6371000.0;
            var x = Math.cos(latA * this.PI / 180.0) * Math.cos(latB * this.PI / 180.0) * Math.cos((lonA - lonB) * this.PI / 180);
            var y = Math.sin(latA * this.PI / 180.0) * Math.sin(latB * this.PI / 180.0);
            var s = x + y;
            if (s > 1) s = 1;
            if (s < -1) s = -1;
            var alpha = Math.acos(s);
            var distance = alpha * earthR;
            return distance;
        },
        outOfChina: function(lat, lon) {
            if (lon < 72.004 || lon > 137.8347) {
                return true;
            }
            if (lat < 0.8293 || lat > 55.8271) {
                return true;
            }
            return false;
        },
        transformLat: function(x, y) {
            var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
            ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) * 2.0 / 3.0;
            ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y * this.PI / 30.0)) * 2.0 / 3.0;
            return ret;
        },
        transformLon: function(x, y) {
            var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
            ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) * 2.0 / 3.0;
            ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x / 30.0 * this.PI)) * 2.0 / 3.0;
            return ret;
        }
    };

    function MathUtil() {
    }

    MathUtil.toFixed = function(value, num) {
        return MathUtil.dotNum(value) > num ? value.toFixed(num) : value;
    };

    MathUtil.dotNum = function(value) {
        value = String(value);
        var start = value.indexOf('.');
        return start == -1 ? 0 : value.substring(start + 1).length;
    };

    window.L.cqkj = exports;

    exports.VERSION = version;
    exports.initMap = initMap;
    exports.InitMap = InitMap;
    exports.webTileMapLayer = webTileMapLayer;
    exports.WebTileMapLayer = WebTileMapLayer;
    exports.fileTileMapLayer = fileTileMapLayer;
    exports.FileTileMapLayer = FileTileMapLayer;
    exports.imageLayer = imageLayer;
    exports.ImageLayer = ImageLayer;
    exports.windCanvasLayer = windCanvasLayer;
    exports.WindCanvasLayer = WindCanvasLayer;
    exports.windFlowLayer = windFlowLayer;
    exports.WindFlowLayer = WindFlowLayer;
    exports.noTranslateCanvas = noTranslateCanvas;
    exports.NoTranslateCanvas = NoTranslateCanvas;
    exports.gridValueLayer = gridValueLayer;
    exports.GridValueLayer = GridValueLayer;
    exports.windGridLayer = windGridLayer;
    exports.WindGridLayer = WindGridLayer;
    exports.isolineLayer = isolineLayer;
    exports.IsolineLayer = IsolineLayer;
    exports.isosurfaceLayer = isosurfaceLayer;
    exports.IsosurfaceLayer = IsosurfaceLayer;
    exports.plpLayer = plpLayer;
    exports.PlpLayer = PlpLayer;
    exports.stationMarkerLayer = stationMarkerLayer;
    exports.StationMarkerLayer = StationMarkerLayer;
    exports.layergroupcollision = layergroupcollision;
    exports.featuregroupcollision = featuregroupcollision;
    exports.geojsoncollision = geojsoncollision;
    exports.LayerGroupCollision = LayerGroupCollision;
    exports.FeatureGroupCollision = FeatureGroupCollision;
    exports.GeoJSONCollision = GeoJSONCollision;
    exports.polygonUnion = polygonUnion;
    exports.PolygonUnion = PolygonUnion;
    exports.baseLayers = baseLayers;
    exports.BaseLayers = BaseLayers;
    exports.scale = scale;
    exports.Scale = Scale;
    exports.Util = Util;
    exports.CoordinateUtil = CoordinateUtil;
    exports.ColorUtil = ColorUtil;
    exports.DataUtil = DataUtil;
    exports.WindUtil = WindUtil;
    exports.MathUtil = MathUtil;
}));
// # sourceMappingURL=weatherlayers-src-0.1.0.js.map
