const config = require('../../config');
const demo = require('../../data/demo');
Page({
  data: { report: demo, loading: false, error: '', saved: [], history: [], showHistory: false },
  onLoad() {
    this.setData({saved: wx.getStorageSync('saved') || [], history: wx.getStorageSync('history') || []});
    this.loadReport();
  },
  loadReport() {
    if (!config.reportUrl) return;
    this.setData({loading:true,error:''});
    wx.request({url:config.reportUrl, success:res => {
      const report = res.data;
      if(res.statusCode !== 200 || !report || !Array.isArray(report.projects) || !report.period) {
        this.setData({error:'周报格式无效，当前保留示例内容'}); return;
      }
      const history = [report, ...this.data.history.filter(x => x.period !== report.period)].slice(0,12);
      wx.setStorageSync('history',history);
      this.setData({report,history});
    }, fail:() => this.setData({error:'加载失败，请稍后重试'}), complete:() => this.setData({loading:false})});
  },
  copyRepo(e) {
    const p = this.data.report.projects[e.currentTarget.dataset.index];
    if(!p.url) return wx.showToast({title:'这是演示项目',icon:'none'});
    wx.setClipboardData({data:p.url});
  },
  save(e) {
    const repo = this.data.report.projects[e.currentTarget.dataset.index].repo;
    const saved = this.data.saved.includes(repo) ? this.data.saved.filter(x => x !== repo) : [...this.data.saved,repo];
    wx.setStorageSync('saved',saved); this.setData({saved});
    wx.showToast({title:saved.includes(repo)?'已收藏':'已取消收藏',icon:'none'});
  },
  subscribe() {
    if(!config.subscribeTemplateId) return wx.showModal({title:'推送尚未接通',content:'上线前需要配置微信消息模板与服务端。普通一次性订阅需用户授权，不能保证永久每周推送。',showCancel:false});
    wx.requestSubscribeMessage({tmplIds:[config.subscribeTemplateId],success:res => {
      wx.showToast({title:res[config.subscribeTemplateId] === 'accept'?'已授权微信订阅':'未授权订阅',icon:'none'});
    },fail:() => wx.showToast({title:'订阅失败，请稍后重试',icon:'none'})});
  },
  toggleHistory(){ this.setData({showHistory:!this.data.showHistory}); },
  selectHistory(e){this.setData({report:this.data.history[e.currentTarget.dataset.index],showHistory:false});}
});
