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
        <el-button class="el-icon-search" type="primary" @click="searchData" :disabled="isDisabled">分析</el-button>
      </div>
      <div id="main" :style="curHeight2"
        v-loading="loading"
        element-loading-text="Echarts加载中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
      </div>
    </div>
  </div>
</template>

<script>
import echarts from "echarts";
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
        pageNum: 1,
        pageSize: 1000,
        sort: 'DESC'
      },
      // 分组全部数据
      groupAllData: [],
      // table表头名称
      contentsTitle: [],
      // table数据
      contents: [],
      // 设备id数组
      deviceIdArr: [],
      // 递归结束标志
      flagIndex: 0,
      // 一个分组中的所有要素
      allEleArr: [],
      // 没选时间禁用
      isDisabled: true,
      // 加载等待
      loading: false,
      // echart实例
      myChart: null,
      // 时间轴数据
      drawXAxixData: []
    }
  },
  created() {
    this.getAllGroup();
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
      this.curHeight2.height = h - 160 + 'px';
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
        this.allEleArr.map((allEleArr) => {
          this.groupAllData.map((groupAllData) => {
            groupAllData.data.map((data) => {
              this.drawXAxixData.push(data.dataTime);
              tmpData = [];
              tmpData.push(data.dataTime);
              tmpData.push(groupAllData.facId);
                if(allEleArr.facId === groupAllData.facId) {
                  tmpData.push(data[allEleArr.facPass] == 32767 ? '-' : (data[allEleArr.facPass] * (allEleArr.preC * 10000) / 10000));
                } else {
                  tmpData.push('-');
                }
              this.contents.push(tmpData);
            })
          });
        });
        this.groupAllData.map((groupAllData) => {
          groupAllData.data.map((data) => {
            this.drawXAxixData.push(data.dataTime);
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
        this.showGraphic();
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
        }
      }
      this.getSensorByGroupId(groupId);
    },
    // 查询数据
    searchData() {
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
    // 绘制图表
    showGraphic() {
      // 基于准备好的dom，初始化echarts实例
      this.myChart = echarts.init(document.getElementById('main'));
      // 配置属性
      let option = {
        grid: {
          left: '70',
          top: '50',
          right: '50',
          bottom: '80'
        },
        toolbox: {
          right: 40,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            animation: false,
            label: {
              backgroundColor: '#505765'
            }
          }
        },
        color: ['#7ea04d', '#1f6f8b'],
        legend: {
          data: this.contentsTitle,
          left: 80,
          top: 10
        },
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 0
          },
          {
            type: 'inside',
            realtime: true,
            start: 0
          }
        ],
        xAxis: [
          {
            type: 'category',
            boundaryGap: true,
            data: this.drawXAxixData
          }
        ],
        yAxis: {},
        series: [
          {
            name: '种植产品',
            type: 'line',
            lineStyle: {
              width: 2,
              color: '#7ea04d'
            },
            label: {
              show: true,
              position: 'top',
              formatter: function(params) {
                return params.value[params.encode.y[0]]+'%'
              }
            },
            symbol: 'circle',
            color: '#7ea04d',
            symbolSize: 8,
            data: this.zzData,
            // 这是让时间刻度缺失的点，数据正常连接不断开
            connectNulls: true
          }
        ]
      };
      // 绘制图表
      this.myChart.setOption(option);
      this.loading = false;
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

        .el-date-editor {
          margin: 10px 10px 10px 0;
        }
      }

      // echarts样式
      #main {
        width: 100%;
        // background-color: pink;
      }

      // 滚动条样式
      #main::-webkit-scrollbar {
        width: 6px !important;
        height: 10px;
      }
      //滑块部分
      #main::-webkit-scrollbar-thumb {
        height: 50%;
        border-radius: 5px;
        background-color: #bbbfca;
      }
    }
  }
</style>