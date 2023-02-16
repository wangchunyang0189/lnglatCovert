<template>
  <el-form ref="form" :model="form" label-width="200px" label-position="right" class="covert">
    <el-form-item label="转换前坐标系">
      <el-select v-model="form.before" style="width:450px">
        <el-option v-for="option in beforeOptions" :label="option.label" :value="option.value" :key="option.value"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="转换后坐标系">
      <el-select v-model="form.after" style="width:450px">
        <el-option v-for="option in afterOptions" :label="option.label" :value="option.value" :key="option.value"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="要转换的坐标json文件">
      <el-upload class="upload-demo" ref="upload" action="" :limit="1" :on-change="fileChange" :auto-upload="false">
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <div slot="tip" class="el-upload__tip">只能上传json文件</div>
      </el-upload>
    </el-form-item>
    <el-button :disabled="!form.json" @click="submit">开始编译</el-button>
  </el-form>
</template>
<script>
import {
  bd09ll_to_gcj02,
  gcj02_to_bd09ll,
  wgs84_to_gcj02,
  gcj02_to_wgs84,
  bd09mc_to_bd09ll,
  bd09ll_to_bd09mc
} from '../utils/covert.js';

import { exportJson } from '../utils/file.js';
export default {
  data() {
    return {
      beforeOptions: [
        {
          label: '火星坐标，即高德地图、腾讯地图和MapABC等地图使用的坐标',
          value: 'gcj02'
        },
        { label: '百度地图采用的经纬度坐标', value: 'bd09ll' },
        { label: '百度地图采用的墨卡托平面坐标', value: 'bd09mc' }
      ],
      afterOptions: [
        {
          label: '火星坐标，即高德地图、腾讯地图和MapABC等地图使用的坐标',
          value: 'gcj02'
        },
        { label: '百度地图采用的经纬度坐标', value: 'bd09ll' },
        { label: '百度地图采用的墨卡托平面坐标', value: 'bd09mc' }
      ],
      fileList: [],
      form: {
        before: 'gcj02',
        after: 'bd09mc',
        json: null
      },
      name: ''
    };
  },
  methods: {
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    fileChange(file) {
      if (!file.raw || file.raw.type !== 'application/json') {
        return false;
      } else {
        this.name = file.name.replace(/\.json$/, '');
        const fr = new FileReader();
        fr.readAsText(file.raw);
        fr.onload = () => {
          const that = this;
          try {
            that.form.json = fr.result;
          } catch (err) {
            alert(err);
          }
        };
      }
    },
    submit() {
      const { before, after, json } = this.form;
      if (before === after) {
        this.$message.warning('转换前后坐标系不能一样');
        return;
      }
      const data = this.formatJSON(before, after, JSON.parse(json));
      exportJson(`${this.name}-${after}.json`, data);
    },
    formatJSON(before, after, json) {
      const funcs = [];
      if (before === 'gcj02' && after === 'bd09ll') {
        funcs.push(gcj02_to_bd09ll);
      } else if (before === 'gcj02' && after === 'bd09mc') {
        funcs.push(gcj02_to_bd09ll, bd09ll_to_bd09mc);
      } else if (before === 'bd09ll' && after === 'gcj02') {
        funcs.push(bd09ll_to_gcj02);
      } else if (before === 'bd09ll' && after === 'bd09mc') {
        funcs.push(bd09ll_to_bd09mc);
      } else if (before === 'bd09mc' && after === 'gcj02') {
        funcs.push(bd09mc_to_bd09ll, bd09ll_to_gcj02);
      } else if (before === 'bd09mc' && after === 'bd09ll') {
        funcs.push(bd09mc_to_bd09ll);
      } else {
        this.$message.warning(`暂不支持${before}转${after}`);
        return;
      }
      // 用于找到经纬度在哪个层级
      // json.map((coordinate) => {
      //   let [x, y] = coordinate;
      //   for (const func of funcs) {
      //     [x, y] = func(x, y);
      //   }
      //   coordinate = [x, y];
      // });

      json.features.map((item) => {
        const length = item.geometry.coordinates.length;
        const time = 200;
        let distance = 0,
          lastPoint = null,
          firstPoint = null;
        item.geometry.coordinates.map((coordinate, index) => {
          let [x, y] = coordinate;
          for (const func of funcs) {
            [x, y] = func(x, y);
          }

          if (index === 0) {
            firstPoint = { x, y };
          } else if (index > 0) {
            const aa = Math.sqrt(
              (x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2
            );
            // console.log(index, aa);
            distance += aa;
          }
          lastPoint = { x, y };

          item.geometry.coordinates[index] = [x, y];
          item.properties = {
            count: 30
          };
        });
        distance += Math.sqrt(
          (lastPoint.x - firstPoint.x) ^ (2 + (lastPoint.y - firstPoint.y)) ^ 2
        );
        let dis = 0;
        item.geometry.coordinates.map((coordinate, index) => {
          const [x, y] = coordinate;
          if (index === 0) {
            item.geometry.coordinates[index] = [x, y, 1, 0];
          } else {
            dis += Math.sqrt((x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2);
            const time = parseInt((200 * dis) / distance);
            item.geometry.coordinates[index] = [x, y, 1, time];
          }
          lastPoint = { x, y };
        });
      });
      return json;
    }
  }
};
</script>
<style scoped>
::v-deep .el-form-item .el-form-item__content {
  display: flex;
}
</style>