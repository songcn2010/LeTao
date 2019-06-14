$(function() {
  var currentPage = 1;  // 当前页
  var pageSize = 2;    // 每页多少条

  // 整个页面的核心方法 render
  // 在 render 方法中, 处理了所有的参数, 发送请求, 获取数据
  function render( callback ) {
    //$('.lt_product').html('<div class="loading"></div>');

    var params = {};
    // 1. 必传的 3 个参数
    params.proName = $('.search_input').val();
    params.page = currentPage;
    params.pageSize = pageSize;

    // 2. 两个可传可不传的参数
    //    (1) 通过判断有没有高亮元素, 决定是否需要排序
    //    (2) 通过箭头方向判断, 升序还是降序  1升序，2降序
    var $current = $('.lt_sort a.current');
    if ( $current.length > 0 ) {
      // 有高亮的, 需要进行排序
      var sortName = $current.data("type");
      var sortValue = $current.find("i").hasClass("fa-angle-down") ? 2 : 1;
      params[ sortName ] = sortValue;
    }

    setTimeout(function() {
      $.ajax({
        type: "get",
        url: "/product/queryProduct",
        data: params,
        dataType: "json",
        success: function( info ) {
          console.log( info );
          // 真正拿到数据后执行的操作, 通过callback函数传递进来了
          callback && callback( info );
        }
      })
    }, 500 );

  }



  // 功能1: 获取地址栏参数赋值给 input
  var key = getSearch("key");
  $('.search_input').val( key );
  // render();


  // 配置下拉刷新和上拉加载注意点:
  // 下拉刷新是对原有数据的覆盖, 执行的是 html 方法
  // 上拉加载时在原有结构的基础上进行追加, 追加到后面, 执行的是 append 方法

  mui.init({
    // 配置pullRefresh
    pullRefresh : {
      container:".mui-scroll-wrapper", //下拉刷新容器标识，querySelector能定位的css选择器均可
      // 配置下拉刷新
      down : {
        // 配置一进入页面, 就自动下拉刷新一次
        auto: true,
        callback : function(){
          console.log( "发送 ajax 请求, 进行页面渲染" );

          // 加载第一页的数据
          currentPage = 1;

          // 拿到数据后, 需要执行的方法是不一样的, 所以通过回调函数的方式, 传进去执行
          render(function( info ) {
            var htmlStr = template("productTpl", info );
            $('.lt_product').html( htmlStr );

            // ajax 回来之后, 需要结束下拉刷新, 让内容回滚顶部
            // 注意: api 做了更新, mui文档上还没更新上(小坑)
            //      要使用原型上的 endPulldownToRefresh 方法来结束 下拉刷新
            mui('.mui-scroll-wrapper').pullRefresh().endPulldownToRefresh();


            // 第一页数据被重新加载之后, 又有数据可以进行上拉加载了, 需要启用上拉加载
            mui(".mui-scroll-wrapper").pullRefresh().enablePullupToRefresh();
          });
        }
      },

      // 配置上拉加载
      up : {
        callback: function() {
          console.log( "执行了上拉加载" );
          // 需要加载下一页的数据, 更新当前页
          currentPage++;
          render(function( info ) {
            var htmlStr = template("productTpl", info );
            $('.lt_product').append( htmlStr );

            // 当数据回来之后, 需要结束上拉加载
            // endPullupToRefresh(boolean) 结束上拉加载
            // 1. 如果传 true, 没有更多数据, 会显示提示语句, 会自动禁用上拉加载, 防止发送无效的ajax
            // 2. 如果传 false, 还有更多数据
            if ( info.data.length === 0 ) {
              // 没有更多数据了, 显示提示语句
              mui(".mui-scroll-wrapper").pullRefresh().endPullupToRefresh( true );
            }
            else {
              // 还有数据, 正常结束上拉加载
              mui(".mui-scroll-wrapper").pullRefresh().endPullupToRefresh( false );
            }

          });
        }
      }
    }
  });




  // 功能2: 点击搜索按钮, 实现搜索功能
  $('.search_btn').click(function() {
    var key = $('.search_input').val(); // 获取搜索关键字
    if ( key.trim() === "" ) {
      mui.toast("请输入搜索关键字");
      return;
    }

    // 执行一次下拉刷新即可, 在下拉刷新回调中, 会进行页面渲染
    // 调用 pulldownLoading 执行下拉刷新
    mui(".mui-scroll-wrapper").pullRefresh().pulldownLoading()

    // 有搜索内容, 需要添加到本地存储中
    var history = localStorage.getItem("search_list") || '[]'; // jsonStr
    var arr = JSON.parse( history ); // 转成数组

    // 要求:
    // 1. 不能重复
    var index = arr.indexOf( key );
    if ( index != -1 ) {
      // 删除对应重复项
      arr.splice( index, 1 );
    }
    // 2. 不能超过 10
    if ( arr.length >= 10 ) {
      // 删除最后一项
      arr.pop();
    }

    // 往数组最前面追加
    arr.unshift( key );
    // 转成 json, 存到本地
    localStorage.setItem( "search_list", JSON.stringify( arr ) );
  })



  // 功能3: 添加排序功能(点击切换类即可)
  // (1) 自己有current, 切换箭头方向
  // (2) 自己没有current, 给自己加上, 让其他的移除 current

  // mui 认为在下拉刷新和上拉加载容器中, 使用 click 会有 300ms延迟的话, 性能方面不足
  // 禁用了默认的 a 标签的 click 事件, 需要绑定 tap 事件
  // http://ask.dcloud.net.cn/question/8646 文档说明地址

  $('.lt_sort a[data-type]').on("tap", function() {
    if ( $(this).hasClass("current") ) {
      // 切换箭头方向
      $(this).find("i").toggleClass("fa-angle-down").toggleClass("fa-angle-up");
    }
    else {
      // 没有 current, 给自己加上, 并排他
      $(this).addClass("current").siblings().removeClass("current");
    }

    // 执行一次下拉刷新即可
    mui('.mui-scroll-wrapper').pullRefresh().pulldownLoading();
  });



  // 功能4: 点击每个商品实现页面跳转, 注册点击事件, 通过事件委托注册, 注册 tap 事件
  $('.lt_product').on("tap", "a", function() {
    var id = $(this).data("id");
    location.href = "product.html?productId=" + id;
  });



});