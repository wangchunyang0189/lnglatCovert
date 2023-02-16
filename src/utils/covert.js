const X_PI = (Math.PI * 3000.0) / 180.0;

function bd09ll_to_gcj02(bd_lng, bd_lat) {
  const x = bd_lng - 0.0065;
  const y = bd_lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
  const gg_lng = z * Math.cos(theta);
  const gg_lat = z * Math.sin(theta);
  return [gg_lng, gg_lat];
}

function gcj02_to_bd09ll(x, y) {
  const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
  const theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
  const bd_lng = z * Math.cos(theta) + 0.0065;
  const bd_lat = z * Math.sin(theta) + 0.006;
  return [bd_lng, bd_lat];
}

const ee = 0.00669342162296594323;

function wgs84_to_gcj02(wgLon, wgLat) {
  if (outOfChina(wgLon, wgLat)) {
    return [wgLon, wgLat];
  }
  var dLat = transformLat(wgLon - 105.0, wgLat - 35.0);
  var dLon = transformLon(wgLon - 105.0, wgLat - 35.0);
  var radLat = (wgLat / 180.0) * Math.PI;
  var magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  var sqrtMagic = Math.sqrt(magic);
  dLat =
    (dLat * 180.0) / (((6378245.0 * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
  dLon =
    (dLon * 180.0) / ((6378245.0 / sqrtMagic) * Math.cos(radLat) * Math.PI);
  return [wgLon, wgLat];
}
/*判断是否在国内，不在国内则不做偏移*/
function outOfChina(lon, lat) {
  if ((lon < 72.004 || lon > 137.8347) && (lat < 0.8293 || lat > 55.8271)) {
    return true;
  } else {
    return false;
  }
}
function transformLat(x, y) {
  var ret =
    -100.0 +
    2.0 * x +
    3.0 * y +
    0.2 * y * y +
    0.1 * x * y +
    0.2 * Math.sqrt(Math.abs(x));
  ret +=
    ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin((y / 3.0) * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((160.0 * Math.sin((y / 12.0) * Math.PI) +
      320 * Math.sin((y * Math.PI) / 30.0)) *
      2.0) /
    3.0;
  return ret;
}

function transformLon(x, y) {
  var ret =
    300.0 +
    x +
    2.0 * y +
    0.1 * x * x +
    0.1 * x * y +
    0.1 * Math.sqrt(Math.abs(x));
  ret +=
    ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin((x / 3.0) * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((150.0 * Math.sin((x / 12.0) * Math.PI) +
      300.0 * Math.sin((x / 30.0) * Math.PI)) *
      2.0) /
    3.0;
  return ret;
}

function gcj02_to_wgs84(gcjLon, gcjLat) {
  let d = delta(gcjLat, gcjLon);
  return [gcjLat - d.lat, gcjLon - d.lon];
}

function delta(lat, lon) {
  let a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
  let ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
  let dLat = transformLat(lon - 105.0, lat - 35.0);
  let dLon = transformLon(lon - 105.0, lat - 35.0);
  let radLat = (lat / 180.0) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  let sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
  dLon = (dLon * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * Math.PI);
  return {
    lat: dLat,
    lon: dLon
  };
}

function lonlat_to_mercator(lon, lat) {
  var x = (lon * 20037508.34) / 180;
  var y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
  y = (y * 20037508.34) / 180;
  return [x, y];
}

function mercator_to_lonlat(mcX, mcY) {
  var x = (mcX / 20037508.34) * 180;
  var y = (mcY / 20037508.34) * 180;
  y =
    (180 / Math.PI) *
    (2 * Math.atan(Math.exp((y * Math.PI) / 180)) - Math.PI / 2);
  return [x, y];
}

const MCBAND = [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0];
const MC2LL = [
  [
    1.410526172116255e-8, 0.00000898305509648872, -1.9939833816331,
    200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339,
    2.57121317296198, -0.03801003308653, 17337981.2
  ],
  [
    -7.435856389565537e-9, 0.000008983055097726239, -0.78625201886289,
    96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737,
    -16.50741931063887, 2.28786674699375, 10260144.86
  ],
  [
    -3.030883460898826e-8, 0.00000898305509983578, 0.30071316287616,
    59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908,
    -3.29883767235584, 0.32710905363475, 6856817.37
  ],
  [
    -1.981981304930552e-8, 0.000008983055099779535, 0.03278182852591,
    40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263,
    0.12923347998204, -0.04625736007561, 4482777.06
  ],
  [
    3.09191371068437e-9, 0.000008983055096812155, 0.00006995724062,
    23.10934304144901, -0.00023663490511, -0.6321817810242, -0.00663494467273,
    0.03430082397953, -0.00466043876332, 2555164.4
  ],
  [
    2.890871144776878e-9, 0.000008983055095805407, -3.068298e-8,
    7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596,
    0.00010322952773, -0.00000323890364, 826088.5
  ]
];
function convertor(cC, cD) {
  if (!cC || !cD) {
    return null;
  }
  let T = cD[0] + cD[1] * Math.abs(cC.x);
  const cB = Math.abs(cC.y) / cD[9];
  let cE =
    cD[2] +
    cD[3] * cB +
    cD[4] * cB * cB +
    cD[5] * cB * cB * cB +
    cD[6] * cB * cB * cB * cB +
    cD[7] * cB * cB * cB * cB * cB +
    cD[8] * cB * cB * cB * cB * cB * cB;
  T *= cC.x < 0 ? -1 : 1;
  cE *= cC.y < 0 ? -1 : 1;
  return [T, cE];
}

function bd09mc_to_bd09ll(x, y) {
  const cC = {
    x: Math.abs(x),
    y: Math.abs(y)
  };
  let cE;
  for (let cD = 0, len = MCBAND.length; cD < len; cD++) {
    if (cC.y >= MCBAND[cD]) {
      cE = MC2LL[cD];
      break;
    }
  }
  const T = convertor({ x, y }, cE);
  return T;
}

const LLBAND = [75, 60, 45, 30, 15, 0];
const LL2MC = [
  [
    -0.0015702102444, 111320.7020616939, 1704480524535203, -10338987376042340,
    26112667856603880, -35149669176653700, 26595700718403920,
    -10725012454188240, 1800819912950474, 82.5
  ],
  [
    0.0008277824516172526, 111320.7020463578, 647795574.6671607,
    -4082003173.641316, 10774905663.51142, -15171875531.51559,
    12053065338.62167, -5124939663.577472, 913311935.9512032, 67.5
  ],
  [
    0.00337398766765, 111320.7020202162, 4481351.045890365, -23393751.19931662,
    79682215.47186455, -115964993.2797253, 97236711.15602145,
    -43661946.33752821, 8477230.501135234, 52.5
  ],
  [
    0.00220636496208, 111320.7020209128, 51751.86112841131, 3796837.749470245,
    992013.7397791013, -1221952.21711287, 1340652.697009075, -620943.6990984312,
    144416.9293806241, 37.5
  ],
  [
    -0.0003441963504368392, 111320.7020576856, 278.2353980772752,
    2485758.690035394, 6070.750963243378, 54821.18345352118, 9540.606633304236,
    -2710.55326746645, 1405.483844121726, 22.5
  ],
  [
    -0.0003218135878613132, 111320.7020701615, 0.00369383431289,
    823725.6402795718, 0.46104986909093, 2351.343141331292, 1.58060784298199,
    8.77738589078284, 0.37238884252424, 7.45
  ]
];
function getRange(cC, cB, T) {
  if (cB != null) {
    cC = Math.max(cC, cB);
  }
  if (T != null) {
    cC = Math.min(cC, T);
  }
  return cC;
}
function getLoop(cC, cB, T) {
  while (cC > T) {
    cC -= T - cB;
  }
  while (cC < cB) {
    cC += T - cB;
  }
  return cC;
}

function bd09ll_to_bd09mc(x, y) {
  const T = { x, y };
  let cD, cC, len;
  T.x = getLoop(T.x, -180, 180);
  T.y = getRange(T.y, -74, 74);
  const cB = T;
  for (cC = 0, len = LLBAND.length; cC < len; cC++) {
    if (cB.y >= LLBAND[cC]) {
      cD = LL2MC[cC];
      break;
    }
  }
  if (!cD) {
    for (cC = LLBAND.length - 1; cC >= 0; cC--) {
      if (cB.y <= -LLBAND[cC]) {
        cD = LL2MC[cC];
        break;
      }
    }
  }
  const cE = convertor(T, cD);
  return cE;
}

export {
  bd09ll_to_gcj02,
  gcj02_to_bd09ll,
  wgs84_to_gcj02,
  gcj02_to_wgs84,
  lonlat_to_mercator,
  mercator_to_lonlat,
  bd09mc_to_bd09ll,
  bd09ll_to_bd09mc
};
