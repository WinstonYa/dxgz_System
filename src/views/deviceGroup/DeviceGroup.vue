<template>
  <div class="container">
    <div class="container-group">
      <el-button size="small" class="el-icon-plus" type="primary" @click="addGroup">新增分组</el-button>
      <el-button size="small" class="el-icon-edit" type="warning" @click="editGroup" style="margin-left: 0;"
        >修改当前分组名称</el-button
      >
      <ul :style="curHeight">
        <li v-for="(item, index) in groupLists" :key="index" @click="changeGroup(item.id, index)" class="group-li">
          <span>{{ item.name }}</span>
          <i class="el-icon-close" @click="deleteGroup(item.id)"></i>
        </li>
      </ul>
    </div>
    <div class="container-sensor">
      <el-button size="small" class="el-icon-plus" type="primary" @click="addSensor">新增传感器</el-button>
      <el-table
        :data="sensorLists"
        border
        stripe
        fit
        highlight-current-row
        :row-style="{ height: '5px' }"
        :cell-style="{ padding: '5px 0' }"
        :height="curHeight2"
      >
        <el-table-column align="center" label="序号" width="60">
          <template slot-scope="scope">
            {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="410">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" plain icon="el-icon-edit-outline" @click="editSensor(scope.row)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="primary"
              plain
              icon="el-icon-setting"
              @click="handleThresholdValueSet(scope.row)"
              >阈值设置</el-button
            >
            <el-button size="mini" type="primary" plain icon="el-icon-message" @click="handleMessageSerive(scope.row)"
              >短信服务</el-button
            >
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteSensor(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
        <el-table-column align="center" label="设备ID">
          <template slot-scope="scope">
            {{ scope.row.facId }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="传感器类型">
          <template slot-scope="scope">
            <span v-if="scope.row.type === 1">要素</span>
            <span v-else-if="scope.row.type === 2">继电器</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="传感器名称">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="设备通道号">
          <template slot-scope="scope">
            {{ scope.row.facPass }}
            <!-- {{ getFacPassName(scope.row.type, scope.row.facPass) }} -->
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
    <el-dialog
      v-cloak
      title="传感器信息"
      center
      @close="closeDialog"
      :visible.sync="dialogShow"
      width="1000px"
      class="row-form"
    >
      <el-form :model="sensorRow" label-width="120px" class="demo-ruleForm" :rules="rules" ref="sensorRow">
        <el-row>
          <el-col :span="12">
            <el-form-item label="设备ID:" prop="facId">
              <el-select v-model="sensorRow.facId" clearable placeholder="请选择设备" @change="changeOptionsByFacId">
                <el-option v-for="item in facIdOptions" :key="item.facId" :label="item.facName" :value="item.facId">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="传感器类型:" prop="type">
              <el-select v-model="sensorRow.type" clearable placeholder="请选择设备" @change="changeFacPassOptions">
                <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="设备通道:" prop="facPass">
              <el-select v-model="sensorRow.facPass" clearable placeholder="请选择设备通道" @change="updateData">
                <el-option
                  v-for="item in facPassOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="item.disabled"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="传感器名称:" prop="name">
              <el-input v-model="sensorRow.name" clearable placeholder="请输入传感器名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <span class="row-btn">
          <el-button size="small" type="info" @click="dialogShow = false">取 消</el-button>
          <el-button size="small" type="success" @click="submitSensor">提 交</el-button>
        </span>
      </el-form>
    </el-dialog>

    <!-- 阈值设置弹出框 -->
    <el-dialog title="阈值设置" :visible.sync="thresholdDialogVisible" width="60%">
      <el-table :data="thresholdTableData" border stripe fit highlight-current-row style="width: 100%">
        <el-table-column align="center" label="传感器通道"> </el-table-column>
        <el-table-column align="center" label="表达式"> </el-table-column>
        <el-table-column align="center" label="阈值"> </el-table-column>
        <el-table-column align="center" label="报警"> </el-table-column>
        <el-table-column align="center" label="短信通知"> </el-table-column>
        <el-table-column align="center" label="拍照"> </el-table-column>
        <el-table-column align="center" label="截图"> </el-table-column>
        <el-table-column align="center" label="操作">
          <el-button size="mini" type="primary" plain icon="el-icon-edit-outline">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="thresholdDialogVisible = false">确定</el-button>
      </span>
    </el-dialog>

    <!-- 短信服务弹出框 -->
    <el-dialog title="短信服务" :visible.sync="messageDialogVisible" width="50%">
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="messageDialogVisible = false">取消</el-button>
        <el-button type="primary" size="mini" @click="messageDialogVisible = false">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Debounce } from '../../assets/js/tool';
export default {
  data() {
    return {
      // 分组列表
      groupLists: [],
      // 传感器列表
      sensorLists: [],
      // 已选择的传感器
      selectedSensor: [],
      // 当前分组id
      defaultGroupId: 0,
      // 当前分组索引
      defaultIndex: 0,
      // 分页
      currentPage: 1,
      pageSize: 20,
      total: 0,
      // 页面高度自适应
      curHeight: {
        height: '',
        overflow: 'auto',
      },
      curHeight2: 0,
      // 修改or新增flag
      flag: '',
      // 对话框
      dialogShow: false,
      //阈值对话框
      thresholdDialogVisible: false,
      //短信服务对话框
      messageDialogVisible: false,
      // 单条传感器信息
      sensorRow: {},
      // 设备Id
      facIdOptions: [],
      // 传感器类型
      typeOptions: [
        { label: '要素', value: 1 },
        { label: '继电器', value: 2 },
      ],
      // 设备通道号
      facPassOptions: [],
      eleFacPassOptions: [],
      relayFacPassOptions: [],
      // 单个设备要素数组
      eleList: [],
      // 要素索引
      eleNumlist: [],
      //阈值数组
      thresholdTableData: [],
      // 验证规则
      rules: {
        facId: [{ required: true, message: '请选择设备', trigger: 'blur' }],
        type: [{ required: true, message: '请选择传感器类型', trigger: 'blur' }],
        facPass: [{ required: true, message: '请选择设备通道', trigger: 'blur' }],
        name: [{ required: true, message: '请输入传感器名称', trigger: 'blur' }],
      },
    };
  },
  created() {
    this.getAllGroup();
    this.getAllDevice();
    this.getAllEle();
    this.setHeight();
    window.onresize = () => {
      this.setHeight();
    };
  },
  methods: {
    // 设定高度
    setHeight() {
      let h = document.documentElement.clientHeight || document.body.clientHeight;
      this.curHeight.height = h - 162 + 'px';
      this.curHeight2 = h - 232;
    },
    // 获取全部分组
    async getAllGroup() {
      this.$changeHttp('zsxt');
      const { data: res } = await this.$http.get('zsSys/DeviceGroup/pageByCId', {
        params: {
          creatorId: window.sessionStorage.getItem('userId'),
        },
      });
      if (res.status !== 200) return this.$message.error('获取全部分组失败!');
      this.groupLists = res.data.rows;
      setTimeout(() => {
        if (this.groupLists) {
          this.changeGroup(this.groupLists[0].id, this.defaultIndex);
        }
      }, 0);
    },
    // 根据分组id获取传感器信息
    async getSensorByGroupId(groupId) {
      this.$changeHttp('zsxt');
      const { data: res } = await this.$http.get('zsSys/DeviceSensor/pageByGId', {
        params: {
          groupId,
          page: this.currentPage,
          limit: this.pageSize,
        },
      });
      if (res.status !== 200) return this.$message.error('获取传感器数据失败!');
      this.sensorLists = res.data.rows;
      this.total = res.data.total;
    },
    // 获取当前用户下的全部设备
    async getAllDevice() {
      this.$changeHttp();
      const { data: res } = await this.$http.get('user/' + window.sessionStorage.getItem('username'));
      if (!res) return this.$message.error('获取设备失败！');
      this.facIdOptions = res.devices;
    },
    // 通过设备id获取要素和继电器信息
    async getDeviceInfo(deviceId) {
      this.$changeHttp();
      const { data: res } = await this.$http.get('device/' + deviceId);
      if (!res) return this.$message.error('获取单个设备信息失败！');
      this.eleFacPassOptions = this.filterData(res.eleName.split('/'), '-', 'e');
      this.eleNumlist = res.eleNum.split('/');
      this.relayFacPassOptions = this.filterData(res.relayName.split('/'), '-', 'j');
    },
    // 获取全部要素信息
    async getAllEle() {
      this.$changeHttp();
      const { data: res } = await this.$http.get('element');
      if (!res) return this.$message.error('获取要素失败！');
      this.eleList = res;
    },
    // 通过设备id获取要素和继电器信息
    changeOptionsByFacId(value) {
      this.sensorRow.type = null;
      this.sensorRow.facPass = null;
      this.facPassOptions = [];
      this.selectedSensor = [];
      for (let item of this.sensorLists) {
        if (value === item.facId) {
          this.selectedSensor.push(item.facPass);
        }
      }
      this.getDeviceInfo(value);
    },
    // 数据过滤
    filterData(arr, value, name) {
      let tmpArr = [];
      let tmpObj = {};
      for (let i = 0; i < arr.length; i++) {
        tmpObj = {};
        // 除去空数据
        if (arr[i] !== value) {
          tmpObj.label = arr[i];
          tmpObj.value = name + (i + 1) + '';
          // 将已选择的数据禁选
          for (let item of this.selectedSensor) {
            if (tmpObj.value === item) {
              tmpObj.disabled = true;
            }
          }
          tmpArr.push(tmpObj);
        }
      }
      return tmpArr;
    },
    // 新增分组
    addGroup() {
      this.$prompt('请输入分组名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '分组名称不能为空',
      })
        .then(async ({ value }) => {
          this.$changeHttp('zsxt');
          const { data: res } = await this.$http.post('zsSys/DeviceGroup', {
            name: value,
            creatorId: window.sessionStorage.getItem('userId'),
          });
          if (res.status !== 200) return this.$message.error('新增失败！');
          this.getAllGroup();
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消新增',
          });
        });
    },
    // 修改分组名称
    editGroup() {
      this.$prompt('请输入分组名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '分组名称不能为空',
        inputPlaceholder: this.groupLists[this.defaultIndex].name,
      })
        .then(async ({ value }) => {
          this.$changeHttp('zsxt');
          const { data: res } = await this.$http.put('zsSys/DeviceGroup', {
            id: this.defaultGroupId,
            name: value,
            creatorId: window.sessionStorage.getItem('userId'),
          });
          if (res.status !== 200) return this.$message.error('修改失败！');
          this.getAllGroup();
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消修改',
          });
        });
    },
    // 删除分组
    deleteGroup(id) {
      this.$confirm('此操作将删除选中的分组, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          this.$changeHttp('zsxt');
          const { data: res } = await this.$http.delete('zsSys/DeviceGroup/' + id);
          if (res.status !== 200) {
            return this.$message({
              duration: 2000,
              type: 'error',
              message: '删除分组失败！',
            });
          }
          this.getAllGroup();
        })
        .catch(() => {
          this.$message({
            duration: 1000,
            type: 'info',
            message: '已取消操作',
          });
        });
    },
    // 点击切换分组
    changeGroup(groupId, index) {
      let lis = document.getElementsByClassName('group-li');
      for (let i = 0; i < lis.length; i++) {
        lis[i].classList.remove('activeLi');
        if (index === i) {
          lis[i].classList.add('activeLi');
          this.defaultIndex = index;
          this.defaultGroupId = groupId;
        }
      }
      this.getSensorByGroupId(groupId);
    },
    // 每页多少条
    handleSizeChange(val) {
      this.pageSize = val;
      this.getSensorByGroupId(this.defaultGroupId);
    },
    // 当前页
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getSensorByGroupId(this.defaultGroupId);
    },
    // 新增传感器
    addSensor() {
      this.flag = 'add';
      this.dialogShow = true;
    },
    //阈值设置
    handleThresholdValueSet(value) {
      this.thresholdDialogVisible = true;
      console.log(value);
    },
    //添加阈值设置
    handleThresholdValue() {},
    handleMessageSerive(value) {
      this.messageDialogVisible = true;
      console.log(value);
    },
    // 编辑传感器
    async editSensor(row) {
      this.sensorRow = row;
      this.selectedSensor = [];
      for (let item of this.sensorLists) {
        if (row.facId === item.facId) {
          this.selectedSensor.push(item.facPass);
        }
      }
      await this.getDeviceInfo(row.facId);
      if (row.type === 1) {
        this.facPassOptions = this.eleFacPassOptions;
      } else if (row.type === 2) {
        this.facPassOptions = this.relayFacPassOptions;
      }
      this.flag = 'edit';
      this.dialogShow = true;
    },
    // 关闭对话框
    closeDialog() {
      this.sensorRow = {};
      this.facPassOptions = [];
      this.eleFacPassOptions = [];
      this.relayFacPassOptions = [];
      this.$refs.sensorRow.clearValidate();
      this.getSensorByGroupId(this.defaultGroupId);
    },
    // 删除传感器
    deleteSensor(id) {
      this.$confirm('此操作将删除选中的传感器, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          this.$changeHttp('zsxt');
          const { data: res } = await this.$http.delete('zsSys/DeviceSensor/' + id);
          if (res.status !== 200) {
            return this.$message({
              duration: 2000,
              type: 'error',
              message: '删除传感器失败！',
            });
          }
          this.getAllGroup();
        })
        .catch(() => {
          this.$message({
            duration: 1000,
            type: 'info',
            message: '已取消操作',
          });
        });
    },
    // 保存传感器信息
    submitSensor: Debounce(function() {
      this.$refs.sensorRow.validate(async (valid) => {
        this.sensorRow.groupId = this.defaultGroupId;
        let index = this.eleNumlist[this.sensorRow.facPass.slice(1) - 1];
        for (let i = 0; i < this.eleList.length; i++) {
          if (index == this.eleList[i].index) {
            this.sensorRow.unit = this.eleList[i].unit;
            this.sensorRow.preC = this.eleList[i].prec;
          }
        }
        if (!valid) return this.$message.error('信息填写不完整，请检查再提交！');
        this.$changeHttp('zsxt');
        if (this.flag === 'add') {
          const { data: res } = await this.$http.post('zsSys/DeviceSensor', this.sensorRow);
          if (res.status !== 200) {
            return this.$message({
              duration: 2000,
              type: 'error',
              message: '新增传感器失败！',
            });
          }
          this.dialogShow = false;
        } else if (this.flag === 'edit') {
          const { data: res } = await this.$http.put('zsSys/DeviceSensor', this.sensorRow);
          if (res.status !== 200) {
            return this.$message({
              duration: 2000,
              type: 'error',
              message: '修改传感器失败！',
            });
          }
          this.dialogShow = false;
        }
        this.getSensorByGroupId(this.defaultGroupId);
      });
    }, 3000),
    // 更改设备通道号选项
    changeFacPassOptions(value) {
      if (value === 1) {
        this.facPassOptions = this.eleFacPassOptions;
      } else if (value === 2) {
        this.facPassOptions = this.relayFacPassOptions;
      }
    },
    // 获取设备通道名称
    getFacPassName(type, value) {
      if (type === 1) {
        for (let i = 0; i < this.eleFacPassOptions.length; i++) {
          if (value === this.eleFacPassOptions[i].value) {
            return this.eleFacPassOptions[i].label;
          }
        }
      } else if (type === 2) {
        for (let i = 0; i < this.relayFacPassOptions.length; i++) {
          if (value === this.relayFacPassOptions[i].value) {
            return this.relayFacPassOptions[i].label;
          }
        }
      }
    },
    // 解决数据层次太多，render函数没有自动更新，需手动强制刷新
    updateData() {
      this.$forceUpdate();
    },
  },
};
</script>

<style lang="less" scoped>
// 容器样式
.container {
  width: 100%;
  height: 100%;
  display: flex;

  // 分组
  .container-group {
    width: 18%;
    min-width: 300px;
    height: 100%;
    // background-color: pink;

    // 新增分组样式
    .el-button {
      margin: 10px;
    }

    // 分组栏样式
    ul {
      width: 100%;
      margin: 0;
      padding: 0;
      list-style: none;
      text-align: center;

      .group-li:nth-child(1) {
        border-top: 1px solid #e1e1e1;
      }

      // 单个分组样式
      .group-li {
        width: 100%;
        height: 60px;
        line-height: 60px;
        font-size: 14px;
        color: #606266;
        border-bottom: 1px solid #e1e1e1;
        cursor: pointer;
        position: relative;
        // background-color: green;

        // 字体样式
        span {
          font-weight: 600;
          font-size: 18px;
        }

        // 删除标签样式
        i {
          color: #373a40;
          font-size: 18px;
          font-weight: 600;
          position: absolute;
          right: 2px;
          top: 2px;
        }
      }

      // 活跃分组
      .activeLi {
        background-color: rgb(45, 183, 245);
        color: #fff;
        border: 0;

        i {
          color: #fff;
        }
      }
    }

    // 隐藏滚动条
    ul::-webkit-scrollbar {
      width: 0 !important;
      height: 0;
    }
  }

  // 传感器
  .container-sensor {
    width: 82%;
    height: 100%;
    margin-left: 10px;
    // background-color: skyblue;

    // 新增传感器样式
    .el-button {
      margin: 10px 0;
    }
  }

  // 对话框
  .row-form {
    .el-input,
    .el-select {
      width: 100%;
    }

    .row-btn {
      display: inline-block;
      width: 100%;
      text-align: center;
    }
  }

  // 默认element样式修改
  .el-table {
    margin-top: 0;

    .el-button {
      margin: 5px;
    }
  }

  .el-pagination {
    margin-bottom: 15px;
  }
}
</style>
