/**
 * Created by Jepson on 2018/8/23.
 */

$(function() {

  function render() {
    // 1. 一进入页面, 发送 ajax 请求, 获取购物车数据
    //   (1) 用户未登录, 后台返回 error 拦截到登录页
    //   (2) 用户已登录, 后台返回 购物车数据, 进行页面渲染
    setTimeout(function() {
      $.ajax({
        type: "get",
        url: "/cart/queryCart",
        dataType: "json",
        success: function( info ) {
          console.log( info )
          if ( info.error === 400 ) {
            // 未登录
            location.href = "login.html";
            return;
          }

          // 已登录, 可以拿到数据, 通过模板渲染
          // 注意: 拿到的是数组, template方法参数2要求是一个对象, 需要包装
          var htmlStr = template("cartTpl", { arr: info } );
          $('.lt_main .mui-table-view').html( htmlStr );

          // 渲染完成, 需要关闭下拉刷新
          mui(".mui-scroll-wrapper").pullRefresh().endPulldownToRefresh();
        }
      });
    }, 500);
  }


  // 2. 配置下拉刷新
  mui.init({
    pullRefresh : {
      container:".mui-scroll-wrapper", // 下拉刷新容器标识
      down : {
        auto: true, // 一进入页面就下拉刷新一次
        callback: function() {
          console.log( "下拉刷新了" );
          // 发送 ajax 请求, 获取数据, 进行渲染
          render();
        }
      }
    }
  });



  // 3. 删除功能
  // (1) 给删除按钮注册事件, 事件委托, 通过 tap进行注册点击
  // (2) 获取在按钮中存储的 id
  // (3) 发送 ajax 请求, 执行删除操作
  // (4) 页面重新渲染
  $('.lt_main').on("tap", ".btn_del", function() {
    var id = $(this).data("id");
    // 发送请求
    $.ajax({
      type: "get",
      url: "/cart/deleteCart",
      // 后台要求传的 id 参数是一个数组格式
      data: {
        id: [ id ]
      },
      dataType:"json",
      success: function( info ) {
        console.log( info );
        if ( info.success ) {
          // 删除成功
          // 调用一次下拉刷新
          mui(".mui-scroll-wrapper").pullRefresh().pulldownLoading();
        }
      }
    })
  });



  // 4. 编辑功能
  $('.lt_main').on("tap", ".btn_edit", function() {
    // html5 里面有一个 dataset 可以一次性获取所有的 自定义属性
    var obj = this.dataset;
    var id = obj.id;

    // 生成 htmlStr
    var htmlStr = template( "editTpl", obj );

    // mui 将模板中的 \n 换行标记, 解析成 <br> 标签, 就换行了
    // 需要将模板中所有的 \n 去掉
    htmlStr = htmlStr.replace( /\n/g, "" );

    // 弹出确认框
    // 确认框的内容, 支持传递 html 模板
    mui.confirm( htmlStr , "编辑商品", [ "确认", "取消" ], function( e ) {

      if ( e.index === 0 ) {
        // 你点击是的确认按钮,
        // 进行获取尺码, 数量, id, 进行 ajax 提交
        var size = $('.lt_size span.current').text();  // 尺码
        var num = $('.mui-numbox-input').val(); // 数量

        $.ajax({
          type: "post",
          url: "/cart/updateCart",
          data: {
            id: id,
            size: size,
            num: num
          },
          dataType: "json",
          success: function( info ) {
            console.log( info );
            if ( info.success ) {
              // 下拉刷新一次即可
              mui(".mui-scroll-wrapper").pullRefresh().pulldownLoading();
            }
          }
        })

      }


    });


    // 进行数字框初始化
    mui(".mui-numbox").numbox();

  });



  // 5. 让尺码可以被选
  $('body').on("click", ".lt_size span", function() {
    $(this).addClass("current").siblings().removeClass("current");
  })
})