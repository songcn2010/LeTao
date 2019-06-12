/**
 * Created by Jepson on 2018/8/22.
 */

$(function() {
  // 注意: 要进行本地存储localStorage的操作, 进行历史记录管理,
  //       需要约定一个键名,  search_list
  //       将来通过 search_list 进行读取或者设置操作

  // 准备假数据: 将下面三行代码, 在控制台执行, 可以添加假数据
  // var arr = [ "耐克", "阿迪", "阿迪王", "耐克王", "新百伦" ];
  // var jsonStr = JSON.stringify( arr );
  // localStorage.setItem( "search_list", jsonStr );



  // 功能1: 列表渲染功能
  // (1) 从本地存储中读取历史记录, 读取的是 jsonStr
  // (2) 转换成数组
  // (3) 通过模板引擎动态渲染
  render();

  // 从本地存储中读取历史记录, 以数组的形式返回
  function getHistory() {
    // 如果没有读取到数据, 默认初始化成一个空数组
    var history = localStorage.getItem("search_list") || '[]';  // jsonStr
    var arr = JSON.parse( history );
    return arr;
  }
  // 读取数组, 进行页面渲染
  function render() {
    var arr = getHistory();
    // template( 模板id, 数据对象 )
    var htmlStr = template( "historyTpl", { arr: arr } );
    $('.lt_history').html( htmlStr );
  }



  // 功能2: 清空历史记录功能
  // (1) 注册事件, 通过事件委托注册
  // (2) 清空历史记录, removeItem
  // (3) 页面重新渲染
  $('.lt_history').on("click", ".btn_empty", function() {

    // 添加 mui 确认框
    // 参数1: 对话框内容  message
    // 参数2: 对话框标题  title
    // 参数3: 按钮文本数组  btnArr
    // 参数4: 回调函数  callback
    mui.confirm("你确认要清空历史记录嘛?", "温馨提示", ["取消", "确认"], function( e ) {
      // e.index 可以获取所点击的按钮的索引
      if ( e.index === 1 ) {
        // 清空记录
        localStorage.removeItem( "search_list" );
        // 重新渲染
        render();
      }
    })

  });


  // 功能3: 删除单条历史记录
  // (1) 注册事件, 通过事件委托
  // (2) 将下标存在删除按钮上, 获取存储的下标
  // (3) 从本地存储中读取数组
  // (4) 通过 下标 从 数组中, 删除对应项   splice
  // (5) 将修改后的数组, 转成jsonStr, 存到本地存储中
  // (6) 页面重新渲染
  $('.lt_history').on("click", ".btn_del", function() {

    // 将外层的 this 指向, 存储在 that 中
    var that = this;

    // 添加确认框
    mui.confirm("你确定要删除该条记录嘛?", "温馨提示", ["取消", "确认"], function( e ) {
      if ( e.index === 1 ) {
        // 用户点击了索引为 1 的确认按钮

        // 获取下标
        var index = $(that).data("index");
        // 获取数组
        var arr = getHistory();
        // 根据下标, 删除数组的对应项
        // splice( 从哪开始, 删除几项, 添加的项1, 添加的项2, ...... );
        arr.splice( index, 1 );

        // 转成 jsonStr, 存到本地存储中
        localStorage.setItem("search_list", JSON.stringify( arr ) );
        // 页面重新渲染
        render();

      }

    })


  });




  // 功能4: 添加历史记录功能
  // (1) 给搜索按钮, 添加点击事件
  // (2) 获取输入框的值
  // (3) 获取本地历史中存的数组
  // (4) 往数组的最前面追加
  // (5) 转成 jsonStr, 将修改后的存储到本地存储中
  // (6) 页面重新渲染

  $('.search_btn').click(function() {

    // 获取搜索关键字
    var key = $('.search_input').val().trim();
    if ( key === "" ) {
      mui.toast("请输入搜索关键字", {
        duration: 2000
      })
      return;
    }

    // 获取数组
    var arr = getHistory();

    // 需求:
    // 1. 如果有重复的, 先将重复的删除, 将这项添加到最前面
    // 2. 长度不能超过 10 个
    var index = arr.indexOf( key );
    if ( index != -1 ) {
      // 说明在数组中可以找到重复的项, 且索引为 index
      arr.splice( index, 1 );
    }
    if ( arr.length >= 10 ) {
      // 删除最后一项
      arr.pop();
    }

    // 往数组最前面追加
    arr.unshift( key );

    // 转成json, 存到本地存储中
    localStorage.setItem( "search_list", JSON.stringify( arr ) );
    // 页面重新渲染
    render();

    // 清空输入框
    $('.search_input').val("");
    // 添加跳转, 跳转到产品列表页
    location.href = "searchList.html?key=" + key;
  })



});
