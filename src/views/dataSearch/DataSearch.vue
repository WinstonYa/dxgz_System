<template>
  <div class="container">
    <div class="container-group">
      <ul :style="curHeight">
        <li v-for="(item, index) in groupLists" :key="index" @click="changeGroup(item.id, index)" class="group-li">
          {{ item.name }}
        </li>
      </ul>
    </div>
    <div class="container-data">
      <div class="data-head">
        <el-select v-model="params.interval" placeholder="请选择">
					<el-option
						v-for="item in intervalOptions"
						:key="item.value"
						:label="item.label"
						:value="item.value">
					</el-option>
				</el-select>
        <el-date-picker
          v-model="timeValue"
          type="datetimerange"
          value-format="yyyy-MM-dd hh:mm:ss"
          :picker-options="pickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          align="left"
          :default-time="['00:00:00', '23:59:59']"
          @change="changeStatus">
        </el-date-picker>
        <el-button class="el-icon-search" type="primary" @click="searchData" :disabled="isDisabled">检索</el-button>
        <el-button class="el-icon-download" type="primary" @click="downloadData" :loading="downloading">导出</el-button>
      </div>
      <div class="data-main">
        <el-table :data="contents" border stripe fit class="table-scroll-bar" :style="curHeight2">
          <el-table-column v-for="(item, index) in contentsTitle" :key="index" :label="item" align="center">
            <template scope="scope">
              <span>{{scope.row[index]}}</span>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { exportToExcel } from "../../assets/js/tool";
export default {
  data() {
    return {
      // 分组列表
      groupLists: [],
      // 传感器列表
      sensorLists: [],
      // 当前分组id
      defaultGroupId: 0,
      // 当前分组索引
      defaultIndex: 0,
      // 页面高度自适应
      curHeight: {
        height: '',
        overflow: 'auto'
      },
      curHeight2: {
        height: '',
        overflow: 'auto'
      },
      // 日期选择
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      // 选择的日期的值
      timeValue: [],
      // 数据查询参数
      params: {
        startTime: null,
        endTime: null,
        interval: '1',
        pageNum: null,
        pageSize: null,
        sort: 'DESC'
      },
      params2: {
        startTime: null,
        endTime: null,
        interval: '1'
      },
      // 数据间隔
      intervalOptions: [
        { label: '1分钟', value: '1' },
        { label: '2分钟', value: '2' },
        { label: '5分钟', value: '5' },
        { label: '10分钟', value: '10' },
        { label: '30分钟', value: '30' },
        { label: '1小时', value: '60' },
        { label: '4小时', value: '240' },
        { label: '6小时', value: '360' },
        { label: '12小时', value: '720' },
        { label: '24小时', value: '1440' }
      ],
      // 分页
			currentPage: 1,
			pageSize: 20,
      total: 0,
      // 分组全部数据
      groupAllData: [],
      // 待下载分组全部数据
      downloadGroupAllData: [],
      // table表头名称
      contentsTitle: [],
      // table数据
      contents: [],
      // 待下载table数据
      downLoadcontents: [],
      // 设备id数组
      deviceIdArr: [],
      // 递归结束标志
      flagIndex: 0,
      flagIndex2: 0,
      flagIndex3: 0,
      // 一个分组中的所有要素
      allEleArr: [],
      // 没选时间禁用
      isDisabled: true,
      // 下载等待
      downloading: false
    }
  },
  created() {
    this.getAllGroup();
    // let end = new Date();
    // let start = new Date();
    // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
    // this.timeValue.push(start);
    // this.timeValue.push(end);
    this.setHeight();
    window.onresize = () => {
			this.setHeight();
		}
  },
  methods: {
    // 设定高度
		setHeight() {
      let h = document.documentElement.clientHeight || document.body.clientHeight;
      this.curHeight.height = h - 100 + 'px';
      this.curHeight2.height = h - 212 + 'px';
    },
    // 获取全部分组
    async getAllGroup() {
      this.$changeHttp('zsxt');
      const { data: res } = await this.$http.get('zsSys/DeviceGroup/pageByCId', {
        params: {
          creatorId: window.sessionStorage.getItem('userId')
        }
      });
      if (res.status !== 200) return this.$message.error('获取全部分组失败!');
      this.groupLists = res.data.rows;
      setTimeout(() => {
        if(this.groupLists){
          this.changeGroup(this.groupLists[0].id, this.defaultIndex);
        }
      }, 0);
    },
    // 根据分组id获取传感器信息
    async getSensorByGroupId(groupId) {
      this.$changeHttp('zsxt');
      const { data: res } = await this.$http.get('zsSys/DeviceSensor/pageByGId', {
        params: {
          groupId
        }
      });
      if (res.status !== 200) return this.$message.error('获取传感器数据失败!');
      this.sensorLists = res.data.rows;
      this.total = 0;
      // 获取一个分组下的所有设备
      this.deviceIdArr = [];
      this.sensorLists.map((item) => {
        this.deviceIdArr.push(item.facId);
      });
      // 去重
      this.deviceIdArr = [...new Set(this.deviceIdArr)];
      // 获取一个分组下的全部传感器
      this.contentsTitle = [];
      this.allEleArr = [];
      this.contentsTitle.push('日期');
      this.contentsTitle.push('设备Id');
      this.sensorLists.map((item) => {
        if(item.type === 1) {
          this.contentsTitle.push(`${item.name}(${item.unit})`);
          this.allEleArr.push(item);
        }
      })
      this.searchData();
    },
    // 根据设备id获取数据
    async getDataByDeviceId(flagIndex, deviceId) {
      if(flagIndex < this.deviceIdArr.length) {
        this.$changeHttp();
        this.params.startTime = this.timeValue ? this.timeValue[0] : null;
        this.params.endTime = this.timeValue ? this.timeValue[1] : null;
        this.params.pageNum = this.currentPage;
        this.params.pageSize = this.pageSize;
        const { data: res } = await this.$http.get('datas/' + deviceId, { params: this.params });
        if(!res) return this.$message.error('获取数据失败！');
        let tmpObj = {};
        tmpObj.facId = this.deviceIdArr[this.flagIndex];
        tmpObj.data = res;
        this.groupAllData.push(tmpObj);
        this.flagIndex++;
        this.getDataByDeviceId(this.flagIndex, this.deviceIdArr[this.flagIndex]);
      } else {
        let tmpData = [];
        this.contents = [];
        this.groupAllData.map((groupAllData) => {
          groupAllData.data.map((data) => {
            tmpData = [];
            tmpData.push(data.dataTime);
            tmpData.push(groupAllData.facId);
            this.allEleArr.map((allEleArr) => {
              if(allEleArr.facId === groupAllData.facId) {
                tmpData.push(data[allEleArr.facPass] == 32767 ? '-' : (data[allEleArr.facPass] * (allEleArr.preC * 10000) / 10000));
              } else {
                tmpData.push('-');
              }
            })
            this.contents.push(tmpData);
          })
        });
        return false
      }
    },
    // 获取总数
    async getCountByDeviceId(flagIndex, deviceId) {
      if(flagIndex < this.deviceIdArr.length) {
        this.$changeHttp();
        this.params2.startTime = this.timeValue ? this.timeValue[0] : null;
        this.params2.endTime = this.timeValue ? this.timeValue[1] : null;
        this.params2.interval = this.params.interval;
        const { data: res } = await this.$http.get('datas/' + deviceId + '/count', { params: this.params2 });
        this.total = this.total > res ? this.total : res;
        this.flagIndex2++;
        this.getCountByDeviceId(this.flagIndex2, this.deviceIdArr[this.flagIndex2]);
      } else {
        return false
      }
    },
    // 点击切换分组
    changeGroup(groupId, index) {
      let lis = document.getElementsByClassName('group-li');
      for(let i=0; i<lis.length; i++) {
        lis[i].classList.remove('activeLi');
        if(index === i) {
          lis[i].classList.add('activeLi');
          this.defaultIndex = index;
          this.defaultGroupId = groupId;
          this.timeValue = [];
          this.isDisabled = true;
          this.params.interval = '1';
        }
      }
      this.getSensorByGroupId(groupId);
    },
    // 查询数据
    searchData() {
      this.groupAllData = [];
      this.total = 0;
      this.currentPage = 1;
      this.flagIndex = 0;
      this.flagIndex2 = 0;
      this.getDataByDeviceId(this.flagIndex, this.deviceIdArr[this.flagIndex]);
      this.getCountByDeviceId(this.flagIndex2, this.deviceIdArr[this.flagIndex]);
    },
    // 每页多少条
		handleSizeChange(val) {
			this.pageSize = val;
			this.searchData();
		},
		// 当前页
    handleCurrentChange(val) {
			this.currentPage = val;
      this.groupAllData = [];
      this.flagIndex = 0;
      this.getDataByDeviceId(this.flagIndex, this.deviceIdArr[this.flagIndex]);
    },
    // 有选时间时取消禁用
    changeStatus() {
      if(this.timeValue && this.timeValue.length !== 0) {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
      }
    },
    // 获取下载数据
    async getDownloadData(flagIndex, deviceId) {
      if(flagIndex < this.deviceIdArr.length) {
        this.$changeHttp();
        const { data: res } = await this.$http.get('datas/' + deviceId, {
          params: {
            startTime: this.timeValue ? this.timeValue[0] : null,
            endTime: this.timeValue ? this.timeValue[1] : null,
            interval: this.params.interval,
            pageNum: 1,
            pageSize: this.total,
            sort: 'DESC'
          }
        });
        if(!res) return this.$message.error('获取数据失败！');
        let tmpObj = {};
        tmpObj.facId = this.deviceIdArr[this.flagIndex3];
        tmpObj.data = res;
        this.downloadGroupAllData.push(tmpObj);
        this.flagIndex3++;
        this.getDownloadData(this.flagIndex3, this.deviceIdArr[this.flagIndex3]);
      } else {
        let tmpData = [];
        this.downLoadcontents = [];
        this.downloadGroupAllData.map((downloadGroupAllData) => {
          downloadGroupAllData.data.map((data) => {
            tmpData = [];
            tmpData.push(data.dataTime);
            tmpData.push(downloadGroupAllData.facId);
            this.allEleArr.map((allEleArr) => {
              if(allEleArr.facId === downloadGroupAllData.facId) {
                tmpData.push(data[allEleArr.facPass] == 32767 ? '-' : (data[allEleArr.facPass] * (allEleArr.preC * 10000) / 10000));
              } else {
                tmpData.push('-');
              }
            })
            this.downLoadcontents.push(tmpData);
          })
        });
        exportToExcel(this.contentsTitle, this.downLoadcontents, this.groupLists[this.defaultIndex].name);
        this.downloading = false;
        return false
      }
    },
    // 下载导出excel
    downloadData() {
      this.flagIndex3 = 0;
      this.getDownloadData(this.flagIndex3, this.deviceIdArr[this.flagIndex3]);
      this.downloading = true;
    }
  }
}
</script>

<style lang="less" scoped>
  .container {
    width: 100%;
    height: 100%;
    display: flex;

    // 分组
    .container-group {
      width: 10%;
      min-width: 160px;
      height: 100%;
      // background-color: pink;

      // 分组栏样式
      ul {
        width: 100%;
        margin: 0;
        padding: 0;
        list-style: none;
        text-align: center;

        // 单个分组样式
        .group-li {
          width: 100%;
          height: 40px;
          line-height: 40px;
          font-size: 14px;
          color: #606266;
          border-bottom: 1px solid #e1e1e1;
          cursor: pointer;
          position: relative;
        }

        // 活跃分组
        .activeLi {
          background-color: rgb(45, 183, 245);
          color: #fff;
          border: 0;
        }
      }

      // 隐藏滚动条
      ul::-webkit-scrollbar {
        width: 0 !important;
        height: 0;
      }
    }

    // 数据
    .container-data {
      width: 90%;
      height: 100%;
      margin-left: 10px;
      
      // 查询栏样式
      .data-head {
        width: 100%;

        .el-select {
          width: 100px;
          margin: 10px 10px 0 0;
        }

        .el-button {
          margin-left: 10px;
        }
      }

      // 数据内容样式
      .data-main {
        width: 100%;
        // background-color: pink;

        .el-pagination {
          margin-top: 0;
        }
      }

      // 滚动条样式
      .table-scroll-bar::-webkit-scrollbar {
        width: 6px !important;
        height: 10px;
      }
      //滑块部分
      .table-scroll-bar::-webkit-scrollbar-thumb {
        height: 50%;
        border-radius: 5px;
        background-color: #bbbfca;
      }
    }
  }
</style>