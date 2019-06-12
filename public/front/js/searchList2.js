$(function() {

  // 功能1: 获取地址栏参数赋值给 input
  var key = getSearch("key");
  $('.search_input').val( key );
  render();

  // 功能2: 点击搜索按钮, 实现搜索功能
  $('.search_btn').click(function() {
    var key = $('.search_input').val(); // 获取搜索关键字
    if ( key.trim() === "" ) {
      mui.toast("请输入搜索关键字");
      return;
    }
    render();

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
  $('.lt_sort a[data-type]').click(function() {
    if ( $(this).hasClass("current") ) {
      // 切换箭头方向
      $(this).find("i").toggleClass("fa-angle-down").toggleClass("fa-angle-up");
    }
    else {
      // 没有 current, 给自己加上, 并排他
      $(this).addClass("current").siblings().removeClass("current");
    }

    render();
  })



  // 整个页面的核心方法 render
  // 在 render 方法中, 处理了所有的参数
  function render() {
    $('.lt_product').html('<div class="loading"></div>');

    var params = {};
    // 1. 必传的 3 个参数
    params.proName = $('.search_input').val();
    params.page = 1;
    params.pageSize = 100;

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
          var htmlStr = template("productTpl", info );
          $('.lt_product').html( htmlStr );
        }
      })
    }, 500 );

  }

});