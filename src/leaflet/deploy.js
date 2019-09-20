/**
 * Created by Han on 2019/7/1.
 */
/*eslint-disable*/
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as esri from 'esri-leaflet';
import './index.css';
L.esri = esri;
import * as d3 from 'd3';

window.d3 = d3;
import './plugin/rbush';
import h337 from 'heatmap.js';

window.h337 = h337;
import './plugin/weatherlayers-0.1.0.css';
import './plugin/weatherlayers-src-0.1.0';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.imagePath = '';
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});
export default {
    ...window.L
};
