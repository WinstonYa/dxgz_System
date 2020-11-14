<template>
  <div class="container">
    <ul class="left-container" :style="curHeight">
      <li v-for="(item, index) in deviceLists" :key="index" @click="changeDevice(item.facId, index)" class="deviceLi">
        {{ item.facName }}
      </li>
    </ul>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="数据概览" name="first" :style="curHeight2" class="tabs-scrollbar">
        <el-row>
          <el-col :span="17">
            <div class="tag">
              <el-tag>更新时间：{{ deviceData.dataTime }}</el-tag>
              <el-tag>设备ID号：{{ singelDevice.facId }}</el-tag>
            </div>
            <div class="element-container">
              <el-card class="card-container" v-for="(item, index) in deviceEle" :key="index" :style="randomRgb()">
                <div class="card-img">
                  <img :src="getImgUrl(item)">
                </div>
                <div class="card-text">
                  <span class="element-name">{{ getEleName(item) }}</span>
                  <div class="element-data">{{ getEleData(index, item) + getEleUnit(item) }}</div>
                </div>
              </el-card>
            </div>
          </el-col>
          <el-col :span="7">
            <div class="img-box">
              <el-image :src="imgUrl"></el-image>
              <div class="img-text">
                <div class="img-text-left">
                  <span>设备名称：{{ singelDevice.facName }}</span>
                  <span>设备ID号：{{ singelDevice.facId }}</span>
                </div>
                <div class="img-text-right">
                  <el-upload action="#"
                    :http-request="httpRequest"
                    :show-file-list="false"
                    :before-upload="beforeAvatarUpload">
                    <el-button size="small" type="primary">点击上传设备封面</el-button>
                  </el-upload>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="预警控制" name="second" :style="curHeight2" class="tabs-scrollbar" v-if="isShow">
        <div style="display: flex;justify-content: space-between;">
          <div style="display: flex;flex-direction: column">
            <!-- 继电器 -->
            <div class="relay-container">
              <el-card class="card-container" v-for="(item, index) in deviceRelay" :key="index" v-show="item !== '0'">
                <div class="card-img">
                  <img :src="getImgUrl(item)">
                </div>
                <div class="card-text">
                  <span class="relay-name">{{ getRelayName(item, index) }}</span>
                  <el-switch
                    class="relay-status"
                    v-model="relayData"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    @change="changeRealyStatus(index, relayData)">
                  </el-switch>
                </div>
              </el-card>
            </div>
            <!-- 继电器扩展 -->
            <div class="relay-container">
              <el-card class="card-container" v-for="(item, index) in deviceRelayExtend" :key="index" v-show="item !== '0'">
                <div class="card-img">
                  <img :src="getImgUrl(item)">
                </div>
                <div class="card-text">
                  <span class="relay-name">{{ getRelayExtendName(item, index) }}</span>
                  <el-switch
                    class="relay-status"
                    v-model="relayData"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    @change="changeRealyExtendStatus(index, relayData)">
                  </el-switch>
                </div>
              </el-card>
            </div>
          </div>
          <div style="width: 450px; margin-right: 20px;">
            <el-divider content-position="left">控制日志</el-divider>
            <el-table :data="controlLog" class="single-page">
              <el-table-column prop="createTime" label="日期" align="center" width="140"></el-table-column>
              <el-table-column prop="id" label="ID" align="center" min-width="80"></el-table-column>
              <el-table-column prop="num" label="编号" align="center" width="50"></el-table-column>
              <el-table-column label="状态" align="center" width="60">
                <template slot-scope="scope">
                  <el-tag size="mini" type="primary" v-if="scope.row.state">闭合</el-tag>
                  <el-tag size="mini" type="warning" v-else>断开</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="结果" align="center" width="60">
                <template slot-scope="scope">
                  <el-tag size="mini" type="success" v-if="scope.row.result">成功</el-tag>
                  <el-tag size="mini" type="danger" v-else>失败</el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              class="single-page"
              @current-change="handleCurrentChange"
              :current-page.sync="currentPage"
              :page-size="5"
              layout="total, prev, pager, next"
              :total="total">
            </el-pagination>
            <el-divider content-position="left">信号强度日志</el-divider>
            <el-table :data="lorasignalLog" class="single-page" border>
              <el-table-column prop="createTime" label="日期" align="center" width="140"></el-table-column>
              <el-table-column prop="facId" label="ID" align="center" width="80"></el-table-column>
              <el-table-column prop="num" label="编号" align="center" width="50"></el-table-column>
              <el-table-column prop="rssi" label="信号强度" align="center" width="50"></el-table-column>
              <el-table-column prop="snr" label="信噪比" align="center" width="60"></el-table-column>
              <el-table-column label="结果" align="center" width="60">
                <template slot-scope="scope">
                  <el-tag size="mini" type="success" v-if="scope.row.result">成功</el-tag>
                  <el-tag size="mini" type="danger" v-else>失败</el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              class="single-page"
              @current-change="handleCurrentChange2"
              :current-page.sync="currentPage2"
              :page-size="5"
              layout="total, prev, pager, next"
              :total="total2">
            </el-pagination>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="视频监控" name="third" :style="curHeight2" class="tabs-scrollbar" v-if="isShow2">
        <el-row>
          <el-col :span="18">
            <div class="video-container"></div>
          </el-col>
          <el-col :span="6">
            <el-row style="min-width: 340px;">
              <el-col :span="14" style="min-width: 200px;">
                <el-row>
                  <el-tooltip class="item" effect="dark" content="按住向左上移动" placement="top-start">
                    <el-button class="iconfont icon-zuoshang" style="height: 60px;"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="按住向上移动" placement="top">
                    <el-button class="iconfont icon-shangshengshangjiantouxiangshangzhangmianxing" style="height: 60px;"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="按住向右上移动" placement="top-end">
                    <el-button class="iconfont icon-youshang" style="height: 60px;"></el-button>
                  </el-tooltip>
                </el-row>
                <el-row>
                  <el-tooltip class="item" effect="dark" content="按住向左移动" placement="left">
                    <el-button class="iconfont icon-zuojiantouxiangzuofanhuimianxing" style="height: 60px; margin-top: 10px;"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="加载视频" placement="top">
                    <el-button type="primary" class="iconfont icon-shuaxin" style="height: 60px;"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="按住向右移动" placement="right">
                    <el-button class="iconfont icon-youjiantouxiangyouqianwangmianxing" style="height: 60px;"></el-button>
                  </el-tooltip>
                </el-row>
                <el-row>
                  <el-tooltip class="item" effect="dark" content="按住向左下移动" placement="bottom-start">
                    <el-button class="iconfont icon-zuoxia" style="height: 60px; margin-top: 10px;"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="按住向下移动" placement="bottom">
                    <el-button class="iconfont icon-xiajiangxiajiantouxiangxiadiemianxing" style="height: 60px;"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="按住向右下移动" placement="bottom-end">
                    <el-button class="iconfont icon-youxia" style="height: 60px;"></el-button>
                  </el-tooltip>
                </el-row>
              </el-col>
              <el-col :span="10" style="min-width: 130px;">
                <el-row>
                  <el-tooltip class="item" effect="dark" content="按住拉近焦距" placement="top-start">
                    <el-button class="iconfont icon-layuanjiaoju" style="height: 60px"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="按住拉远焦距" placement="top-end">
                    <el-button class="iconfont icon-lajinjiaoju" style="height: 60px"></el-button>
                  </el-tooltip>
                </el-row>
                <el-row>
                  <el-tooltip class="item" effect="dark" content="按住放大" placement="top">
                    <el-button class="iconfont icon-fangda1111" style="height: 60px; margin-top: 10px;"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="按住缩小" placement="top">
                    <el-button class="iconfont icon-suoxiao" style="height: 60px;"></el-button>
                  </el-tooltip>
                </el-row>
                <el-row>
                  <el-tooltip class="item" effect="dark" content="点击水平翻转图像" placement="bottom-start">
                    <el-button class="iconfont icon-icon-test" style="height: 60px; margin-top: 10px;"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="点击垂直翻转图像" placement="bottom-end">
                    <el-button class="iconfont icon-icon-test-copy" style="height: 60px;"></el-button>
                  </el-tooltip>
                </el-row>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-tooltip class="item" effect="dark" content="点击抓拍" placement="right">
                  <el-button type="primary" class="iconfont icon-zhuapai" style="margin: 20px 0 0 20px;"></el-button>
                </el-tooltip>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="图片抓拍" name="fourth" :style="curHeight2" class="tabs-scrollbar" v-if="isShow2">
        <div>
          <span style="margin-right: 10px;">分辨率</span>
          <el-select size="small" v-model="pixel" placeholder="请选择" style="width: 150px;">
            <el-option
              v-for="item in pixelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <span style="margin-right: 10px;margin-left: 30px;">压缩比</span>
          <el-select size="small" v-model="compressionRatio" placeholder="请选择" style="width: 80px;">
            <el-option
              v-for="item in compressionRatioOptions"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
          <el-button size="small" type="primary" style="margin-left: 20px;" @click="photo">抓拍</el-button>
          <span style="margin-right: 10px;margin-left: 30px;">焦距</span>
          <el-input-number size="small" v-model="focalLength" :min="0" :max="100"></el-input-number>
          <el-button size="small" type="primary" style="margin-left: 20px;" @click="photo2">变焦</el-button>
        </div>
        <div class="photo-container">
          <el-card class="photo" v-for="(item, index) in photoList" :key="index">
            <div class="card-img">
              <img :src="item.url">
            </div>
            <div class="card-text">
              <div class="element-name">
                <el-tag type="primary" size="mini">{{ item.name }}</el-tag>
                <el-button size="mini" type="primary" class="el-icon-edit" circle @click="editPhoto(item)"></el-button>
              </div>
              <div class="element-data">
                <el-tag type="primary" size="mini">{{ item.createTime }}</el-tag>
                <el-button size="mini" type="danger" class="el-icon-delete" circle @click="deletePhoto(item.id)"></el-button>
              </div>
            </div>
          </el-card>
          <el-pagination
            background
            @current-change="handleCurrentChange4"
            :current-page.sync="currentPage4"
            :page-size="5"
            layout="total, prev, pager, next, jumper"
            :total="total4">
          </el-pagination>
        </div>
      </el-tab-pane>
  </el-tabs>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 设备列表
      deviceLists: [],
      // 单个设备数据
      singelDevice: {},
      // 设备数据
      deviceData: [],
      // 继电器数据
      relayData: 0,
      // 设备要素
      deviceEle: [],
      // 设备继电器
      deviceRelay: [],
      // 设备继电器
      deviceRelayExtend: [],
      // 设备继电器名称
      deviceRelayName: [],
      // 要素信息
      eleList: [],
      // 继电器信息
      relayList: [],
      // 控制日志
      controlLog: [],
      // 信号强度日志
      lorasignalLog: [],
      // 抓拍照片
      photoList: [],
      // 活跃tab栏
      activeName: 'first',
      // 默认数据栏
      defaultIndex: 0,
      // 默认设备id
      defaultDeviceId: 0,
      // 定时器
      intervelTime: '',
      // 设备图片url
      imgUrl: '',
      // 分辨率
      pixel: 5,
      pixelOptions:[
        { label: '480*270', value: 30 },
        { label: '640*360', value: 31 },
        { label: '640*480', value: 5 },
        { label: '800*450', value: 32 },
        { label: '800*600', value: 7 },
        { label: '960*540', value: 33 },
        { label: '1024*576', value: 34 },
        { label: '1024*768', value: 8 },
        { label: '1280*720', value: 15 },
        { label: '1280*720', value: 35 },
        { label: '1280*800', value: 9 },
        { label: '1280*960', value: 6 },
        { label: '1280*1024', value: 17 },
        { label: '1600*1024', value: 10 },
        { label: '1600*1200', value: 11 },
        { label: '1920*1080', value: 16 }
      ],
      // 压缩比
      compressionRatio: 5,
      compressionRatioOptions: [1, 2, 3, 4, 5],
      // 焦距
      focalLength: 50,
      // 当前页
      currentPage: 1,
      currentPage2: 1,
      currentPage3: 1,
      currentPage4: 1,
      total: 0,
      total2: 0,
      total3: 0,
      total4: 0,
      // 页面高度自适应
      curHeight: {
        height: '',
        overflow: 'auto'
      },
      curHeight2: {
        height: '',
        overflow: 'auto'
      },
      // 没有这项隐藏
      isShow: true,
      isShow2: true
    }
  },
  created() {
    this.$changeHttp();
    this.getAllDevice();
    clearInterval(this.intervelTime);
    this.intervelTime = null;
    this.setTimer();
    this.getAllEle();
		this.setHeight();
    window.onresize = () => {
			this.setHeight();
		}
  },
  destroyed() {
    // 每次离开当前界面时，清除定时器
    clearInterval(this.intervelTime);
    this.intervelTime = null;
  },
  methods: {
    // 定时器
    setTimer() {
      if(this.intervelTime == null) {
        this.intervelTime = setInterval( () => {
          this.getDataByDeviceId(this.defaultDeviceId, this.defaultIndex); 
        }, 60000);
      }
    },
    // tab栏切换
    handleClick(tab) {
      if(tab.name === 'second') {
        this.getAllRelay();
        this.getControlLog();
        this.getLorasignalLog();
      } else if(tab.name === 'third') {
        console.log(tab.name);
      } else if(tab.name === 'fourth') {
        this.getAllPhoto();
      }
    },
    // 换页
    handleCurrentChange(val){
      this.currentPage = val;
      this.getControlLog();
    },
    handleCurrentChange2(val){
      this.currentPage2 = val;
      this.getLorasignalLog();
    },
    handleCurrentChange4(val){
      this.currentPage4 = val;
      this.getAllPhoto();
    },
    // 获取控制日志
    async getControlLog() {
      const { data: res } = await this.$http.get('controllog/' + this.defaultDeviceId, {
        params:{
          pageNum: this.currentPage,
          pageSize: 5
        }
      });
      if(!res) return this.$message.error('获取控制日志失败！');
      this.controlLog = res.list;
      this.total = res.total;
    },
    // 获取信号强度日志
    async getLorasignalLog() {
      const { data: res } = await this.$http.get('lorasignallog/' + this.defaultDeviceId, {
        params:{
          pageNum: this.currentPage2,
          pageSize: 5
        }
      });
      if(!res) return this.$message.error('获取信号强度日志失败！');
      this.lorasignalLog = res.list;
      this.total2 = res.total;
    },
    // 获取当前账号下的所有设备
    async getAllDevice() {
      const { data: res } = await this.$http.get('user/' + window.sessionStorage.getItem('username'));
      if(!res) return this.$message.error('获取设备失败！');
      this.deviceLists = res.devices;
      // console.log(this.deviceLists);
      setTimeout(() => {
        this.changeDevice(this.deviceLists[0].facId, this.defaultIndex);
      }, 0);
    },
    // 获取全部要素信息
    async getAllEle() {
      const { data: res } = await this.$http.get('element');
      if(!res) return this.$message.error('获取要素失败！');
      this.eleList = res;
    },
    // 获取全部继电器信息
    async getAllRelay() {
      const { data: res } = await this.$http.get('relay');
      if(!res) return this.$message.error('获取要素失败！');
      this.relayList = res;
    },
    // 获取全部照片
    async getAllPhoto() {
      const { data: res } = await this.$http.get('photo/' + this.defaultDeviceId, {
        params:{
          type: 0,
          pageNum: this.currentPage4,
          pageSize: 8
        }
      });
      if(!res) return this.$message.error('获取照片失败！');
      this.photoList = res.list;
      this.total4 = res.total;
    },
    // 抓拍
    async photo() {
      const { data: res } = await this.$http.post('photo', {
        deviceId: this.defaultDeviceId,
        pixel: this.pixel,
        compressionRatio: this.compressionRatio
      });
      if(!res) return this.$message.error('抓拍失败，请检查设备是否在线！');
      this.getAllPhoto();
    },
    // 变焦
    async photo2() {
      const { data: res } = await this.$http.post('photo', {
        deviceId: this.defaultDeviceId,
        focalLength: this.focalLength
      });
      if(!res) return this.$message.error('变焦失败！');
      this.getAllPhoto();
    },
    // 修改抓拍照片名字
    editPhoto(item) {
      this.$prompt('请输入图片名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: item.name
      }).then(async ({ value }) => {
        item.name = value;
        const { data: res } = await this.$http.put('photo/'+ item.id, item);
        if(!res) return this.$message.error('修改失败！');
        this.getAllPhoto();
        this.$message.success('修改成功！');
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消修改'
        });       
      });
    },
    // 删除抓拍照片
    deletePhoto(id) {
      this.$confirm('此操作将永久删除该图片, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(async () => {
				const { data: res } = await this.$http.delete('photo/'+ id);
				if(!res) {
					return this.$message({
						duration: 2000,
						type: 'error',
						message: '删除图片失败！'
					});
				}
				this.getAllPhoto();
			}).catch(() => {
				this.$message({
					duration: 1000,
					type: 'info',
					message: '已取消操作'
				});          
			});
    },
    // 获取单个设备信息
    async getSingelDevice(deviceId) {
      this.deviceEle = [];
      this.deviceRelay = [];
      this.deviceRelayName = [];
      this.deviceRelayExtend = [];
      this.deviceRelayExtendName = [];
      const { data: res } = await this.$http.get('device/' + deviceId);
      if(!res) return this.$message.error('获取单个设备信息失败！');
      this.singelDevice = res;
      // console.log(res);
      this.deviceEle = this.filterData(res.eleNum.split('/'), 100);
      let tmpDeviceRelay = this.filterData(res.relayNum.split('/'), 0);
      this.deviceRelay = res.relayNum.split('/');
      this.deviceRelayName = res.relayName.split('/');
      if(res.relayExtend) {
        this.deviceRelayExtend = res.relayExtendNum.split('/');
        this.deviceRelayExtendName = res.relayExtendName.split('/');
      }
      if(tmpDeviceRelay.length === 0 && this.deviceRelayExtend.length === 0) {
        this.isShow = false;
      } else {
        this.isShow = true;
      }
      if(!res.photo) {
        this.isShow2 = false;
      } else {
        this.isShow2 = true;
      }
      // 使用时间戳及时刷新更新后图片
      this.imgUrl = res.coverUrl + '?' + new Date().getTime();
    },
    // 点击切换设备
    changeDevice(deviceId, index) {
      let lis = document.getElementsByClassName('deviceLi');
      for(let i=0; i<lis.length; i++) {
        lis[i].classList.remove('activeLi');
        if(index === i) {
          lis[i].classList.add('activeLi');
          this.defaultIndex = index;
          this.defaultDeviceId = deviceId;
          this.activeName = 'first';
        }
      }
      this.getDataByDeviceId(deviceId);
    },
    // 根据设备id获取数据
    async getDataByDeviceId(deviceId) {
      const { data: res } = await this.$http.get('data/' + deviceId );
      if(!res) return this.$message.error('获取设备失败！');
      this.deviceData = res;
      // console.log(this.deviceData);
      this.getSingelDevice(deviceId);
    },
    // 更改继电器状态
    async changeRealyStatus(relayNum, relayState) {
      const { data: res } = await this.$http.post('relay', {
        deviceId: this.defaultDeviceId,
        relayNum,
        relayState
      });
      if(!res) return this.$message.error('控制失败！');
      this.getDataByDeviceId(this.defaultDeviceId);
    },
    // 更改继电器扩展状态
    async changeRealyExtendStatus(relayNums, relayStates) {
      const { data: res } = await this.$http.post('relay/extend', {
        params: {
          deviceId: this.defaultDeviceId,
          relayNums: relayNums + 32,
          relayStates
        }
      });
      if(!res) return this.$message.error('更改继电器扩展状态失败！');
    },
    // 设定高度
		setHeight() {
      let h = document.documentElement.clientHeight || document.body.clientHeight;
      this.curHeight.height = h - 100 + 'px';
      this.curHeight2.height = h - 160 + 'px';
    },
    // 拼接图片url
    getImgUrl(item) {
      if(item != 100 && item != 0) {
        return require('../../assets/img/' + item + '.png');
      }
    },
    // 获取要素名称
    getEleName(index) {
      for(let i=0;i<this.eleList.length; i++) {
        if(index == this.eleList[i].index) {
          return this.eleList[i].name;
        }
      }
    },
    // 获取继电器名称
    getRelayName(item, index) {
      if(this.deviceRelayName[index] === '-') {
        for(let i=0;i<this.relayList.length; i++) {
          if(item == this.relayList[i].index) {
            return this.relayList[i].name;
          }
        }
      } else {
        return this.deviceRelayName[index];
      }
    },
    // 获取继电器扩展名称
    getRelayExtendName(item, index) {
      if(this.deviceRelayExtendName[index] === '-') {
        for(let i=0;i<this.relayList.length; i++) {
          if(item == this.relayList[i].index) {
            return this.relayList[i].name;
          }
        }
      } else {
        return this.deviceRelayExtendName[index];
      }
    },
    // 获取要素单位
    getEleUnit(index) {
      for(let i=0;i<this.eleList.length; i++) {
        if(index == this.eleList[i].index) {
          return ' ' + this.eleList[i].unit;
        }
      }
    },
    // 获取要素数据
    getEleData(index, item) {
      let name = `e${index + 1}`;
      if(this.deviceData[name] !== 32767) {
        for(let i=0;i<this.eleList.length; i++) {
          if(item == this.eleList[i].index) {
            return this.deviceData[name] * (this.eleList[i].prec * 10000) / 10000;
          }
        }
      } else {
        return '------'
      }
    },
    // 获取继电器数据
    getRelayData(index, item) {
      let name = `j${index + 1}`;
      if(this.deviceData[name] !== 32767) {
        for(let i=0;i<this.eleList.length; i++) {
          if(item == this.eleList[i].index) {
            return this.deviceData[name] * (this.eleList[i].prec * 10000) / 10000;
          }
        }
      } else {
        return '------'
      }
    },
    // 要素数据过滤
    filterData(arr, value) {
      let tmpArr = [];
      for(let item of arr) {
        if(item != value) {
          tmpArr.push(item)
        }
      }
      return tmpArr;
    },
    // 随机背景颜色
    randomRgb() {
      let R = Math.floor(Math.random() * 125 + 20);
      let G = Math.floor(Math.random() * 235 + 20);
      let B = Math.floor(Math.random() * 255);
      return {
        background: 'rgb(' + R + ',' + G + ',' + B + ')'
      };
    },
    // 图片上传
		async httpRequest(data) {
      // 创建文件读取对象
      let rd = new FileReader();
			let file = data.file;
      // 文件读取装换为base64类型
      rd.readAsDataURL(file);
      let fd = new FormData();
      fd.append('file', file);
      fd.append('deviceId', this.defaultDeviceId);
      const { data: result } = await this.$http.post('device/upload', fd);
      if(!result) return this.$message.error('设备封面上传失败！');
      this.getSingelDevice(this.defaultDeviceId); 
    },
    // 上传图片验证
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isPNG = file.type === 'png';
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isJPG && !isPNG) {
        this.$message.error('上传头像图片只能是 JPG或PNG 格式!');
      }
      if (!isLt5M) {
        this.$message.error('上传头像图片大小不能超过 5MB!');
      }
      return (isJPG || isPNG) && isLt5M;
    }
  }
}
</script>

<style lang="less" scoped>
  // 容器样式
  .container {
    width: 100%;
    height: 100%;
    display: flex;
  }

  // 侧边设备栏
  .left-container {
    width: 140px;
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: center;

    // 设备栏样式
    li {
      width: 100%;
      padding: 10px 0;
      font-size: 14px;
      color: #606266;
      border-bottom: 1px solid #e1e1e1;
      cursor: pointer;
    }

    // 活跃设备栏样式
    .activeLi {
      background-color: rgb(45, 183, 245);
      color: #fff;
      border: 0;
    }
  }
  // 隐藏滚动条
  .left-container::-webkit-scrollbar {
    width: 0 !important;
    height: 0;
  }
  // 修改滚动条样式
  .tabs-scrollbar::-webkit-scrollbar {
    width: 6px !important;
    height: 10px;
  }
  //滑块部分
  .tabs-scrollbar::-webkit-scrollbar-thumb {
    height: 50%;
    border-radius: 5px;
    background-color: #bbbfca;
  }

  // 右边设备数据栏样式
  .el-tabs {
    width: 100%;
    margin-left: 15px;
  }

  // 检验项数据卡样式
  .element-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;

    .card-container {
      width: 240px;
      height: 100px;
      box-shadow: none;
      margin: 10px;
      display: flex;
      justify-content: center;
      align-items: center;

      // 卡片图片样式
      .card-img {
        width: 64px;
        height: 64px;
        float: left;

        img {
          width: 100%;
          height: 100%;
        }
      }

      // 卡片数据样式
      .card-text {
        width: 136px;
        height: 64px;
        float: left;
        color: #fff;
        text-align: center;

        .element-name {
          font-size: 16px;
        }

        .element-data {
          font-size: 18px;
          margin-top: 15px;
        }
      }
    }
  }

  // 设备图片样式
  .img-box {
    width: 100%;
    height: 550px;
    padding: 0 20px;
    box-sizing: border-box;

    .el-image {
      width: 100%;
      height: 500px;
    }

    .img-text {
      width: 100%;
      height: 42px;
      font-size: 16px;
      color: #303133;
      position: relative;

      .img-text-left {
        margin-left: 10px;

        span {
          display: block;
        }
      }

      .img-text-right {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);

        .el-input {
          border-radius: 50px;
        }
      }
    }
  }

  // 设备继电器数据卡样式
  .relay-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;

    .card-container {
      width: 240px;
      height: 100px;
      box-shadow: none;
      margin: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #dae1e2;

      // 卡片图片样式
      .card-img {
        width: 64px;
        height: 64px;
        float: left;

        img {
          width: 100%;
          height: 100%;
        }
      }

      // 卡片数据样式
      .card-text {
        width: 136px;
        height: 64px;
        float: left;
        color: #303133;
        text-align: center;

        .relay-name {
          display: block;
          font-size: 16px;
        }

        .relay-status {
          margin-top: 10px;
        }
      }
    }
  }

  // 抓拍图片样式
  .photo-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;

    .photo {
      width: 300px;
      height: 270px;
      text-align: left;
      // padding: 0;
      margin: 10px;

      .card-img img {
        width: 300px;
        height: 200px;
      }

      .card-text {
        width: 272px;
        height: 70px;
        margin-left: 14px;

        .el-button {
          float: right;
        }

        .element-name {
          width: 100%;
          height: 30px;
          float: left;
        }

        .element-data {
          width: 100%;
          height: 30px;
          float: left;
        }
      }
    }
  }

  // element默认样式更改
  .tag .el-tag {
    margin-left: 20px;
  }
</style>

<style lang="less">
  .single-page {
    font-size: 12px;

    .el-pager li{
      font-size: 12px;
    }
  }

  .photo .el-card__body {
    padding: 0;
  }
</style>