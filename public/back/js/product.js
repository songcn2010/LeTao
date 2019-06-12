/**
 * Created by Jepson on 2018/8/20.
 */

$(function() {
  var currentPage = 1; // 当前页
  var pageSize = 2; // 每页条数

  // 定义 用来存储已上传图片 的数组
  var picArr = [];

  // 1. 一进入页面, 请求商品数据, 进行页面渲染
  render();

  function render() {
    // 发送请求渲染
    $.ajax({
      type: "get",
      url: "/product/queryProductDetailList",
      data: {
        page: currentPage,
        pageSize: pageSize
      },
      // 后台如果在响应头中, 设置了响应头 Content-Type: application/json;
      // 前端可以省略  dataType: "json"
      // dataType: "json",
      success: function( info ) {
        console.log( info )
        // 通过 template 生成 html 模板
        var htmlStr = template("productTpl", info);
        $('.lt_content tbody').html( htmlStr );


        // 分页初始化
        $('#paginator').bootstrapPaginator({
          // 版本号
          bootstrapMajorVersion: 3,
          // 当前页
          currentPage: info.page,
          // 总页数
          totalPages: Math.ceil( info.total / info.size ),

          // 配置按钮大小
          size: "normal",

          // 配置按钮文本
          // 每个按钮在初始化的时候, 都会调用一次这个函数, 通过返回值进行设置文本
          // 参数1: type  取值: page  first  last  prev  next
          // 参数2: page  指当前这个按钮所指向的页码
          // 参数3: current 当前页
          itemTexts: function( type, page, current ) {
            // console.log( arguments );

            // switch case
            switch ( type ) {
              case "page":
                return page;
              case "first":
                return "首页";
              case "last":
                return "尾页";
              case "prev":
                return "上一页";
              case "next":
                return "下一页";
            }
          },

          // 配置 title 提示信息
          // 每个按钮在初始化的时候, 都会调用一次这个函数, 通过返回值设置title文本
          tooltipTitles: function( type, page, current ) {
            switch ( type ) {
              case "page":
                return "前往第" + page + "页";
              case "first":
                return "首页";
              case "last":
                return "尾页";
              case "prev":
                return "上一页";
              case "next":
                return "下一页";
            }
          },

          // 使用 bootstrap 的提示框组件
          useBootstrapTooltip: true,

          // 给 页码 添加点击事件
          onPageClicked: function( a, b, c, page ) {
            // 更新当前页
            currentPage = page;
            // 重新渲染
            render();
          }
        })
      }
    })
  };


  // 2. 点击添加商品按钮, 显示添加模态框
  $('#addBtn').click(function() {
    $('#addModal').modal("show");

    // 发送 ajax 请求, 请求所有的二级分类数据, 进行下拉列表渲染
    // 通过分页接口, 模拟获取全部数据的接口
    $.ajax({
      type: "get",
      url: "/category/querySecondCategoryPaging",
      data: {
        page: 1,
        pageSize: 100
      },
      dataType: "json",
      success: function( info ) {
        console.log( info );
        var htmlStr = template( "dropdownTpl", info );
        $('.dropdown-menu').html( htmlStr );
      }
    })
  });



  // 3. 给dropdown-menu下面的 a 注册点击事件(通过事件委托)
  $('.dropdown-menu').on("click", "a", function() {
    // 设置文本
    var txt = $(this).text();
    $('#dropdownText').text( txt );

    // 设置 id 给隐藏域, name="brandId"
    var id = $(this).data("id");
    $('[name="brandId"]').val( id );

    // 重置校验状态为 VALID
    $('#form').data("bootstrapValidator").updateStatus("brandId", "VALID");
  });



  // 4. 文件上传初始化
  //    多文件上传时, 插件会遍历选中的图片, 发送多次请求到服务器, 将来响应多次
  //    每次响应都会调用一次 done 方法
  $('#fileupload').fileupload({
    // 返回的数据格式
    dataType: "json",
    // 文件上传完成时调用的回调函数
    done: function( e, data ) {
      // data.result 是后台响应的内容
      // console.log( data.result )

      // 往数组的最前面追加 图片对象
      picArr.unshift( data.result );

      // 往 imgBox 最前面追加 img 元素
      $('#imgBox').prepend('<img src="'+ data.result.picAddr +'" width="100" alt="">');


      // 通过判断数组长度, 如果数组长度大于 3, 将数组最后一项移除
      if ( picArr.length > 3 ) {
        // 移除数组的最后一项
        picArr.pop();

        // 移除imgBox中的最后一个图片
        // $('#imgBox img').eq(-1)
        $('#imgBox img:last-of-type').remove();
      }



      // 如果处理后, 图片数组的长度为 3, 那么就通过校验, 手动将picStatus置成VALID
      if ( picArr.length === 3 ) {
        $('#form').data("bootstrapValidator").updateStatus("picStatus", "VALID");
      }

      console.log( picArr )
    }
  });



  // 5. 进行表单校验初始化
  $('#form').bootstrapValidator({

    // 重置排除项
    excluded: [],

    // 配置校验图标
    feedbackIcons: {
      valid: 'glyphicon glyphicon-ok',    // 校验成功
      invalid: 'glyphicon glyphicon-remove',  // 校验失败
      validating: 'glyphicon glyphicon-refresh' // 校验中
    },

    // 配置校验字段
    fields: {
      // 选择二级分类
      brandId: {
        validators: {
          notEmpty: {
            message: "请选择二级分类"
          }
        }
      },
      // 产品名称
      proName: {
        validators: {
          notEmpty: {
            message: "请输入商品名称"
          }
        }
      },

      // 产品描述
      proDesc: {
        validators: {
          notEmpty: {
            message: "请输入产品描述"
          }
        }
      },

      // 产品库存
      // 除了非空之外, 要求必须是非零开头的数字
      num: {
        validators: {
          notEmpty: {
            message: "请输入商品库存"
          },
          //正则校验
          // \d 表示数字 0-9
          // + 表示出现一次或多次
          // * 表示出现0次或多次
          // ? 表示出现0次或1次
          regexp: {
            regexp: /^[1-9]\d*$/,
            message: '商品库存必须是非零开头的数字'
          }
        }
      },

      // 尺码, 还要求必须是 xx-xx 的格式, x为数字
      size: {
        validators: {
          notEmpty: {
            message: "请输入商品尺码"
          },
          regexp: {
            regexp: /^\d{2}-\d{2}$/,
            message: '尺码必须是 xx-xx 的格式, 例如: 32-40'
          }
        }
      },

      // 原价
      oldPrice: {
        validators: {
          notEmpty: {
            message: "请输入商品原价"
          }
        }
      },

      // 现价
      price: {
        validators: {
          notEmpty: {
            message: "请输入商品现价"
          }
        }
      },

      // 图片校验
      picStatus: {
        validators: {
          notEmpty: {
            message: "请选择三张图片"
          }
        }
      }

    }

  });



  // 6. 注册表单校验成功事件, 阻止默认的提交, 通过ajax进行提交
  $('#form').on("success.form.bv", function( e ) {
    // 阻止默认的提交
    e.preventDefault();

    // 获取的是表单元素的数据
    var paramsStr = $('#form').serialize();

    // 还需要拼接上图片的数据
    // &picName1=xx&picAddr1=xx
    // &picName2=xx&picAddr2=xx
    // &picName3=xx&picAddr3=xx
    paramsStr += "&picName1="+ picArr[0].picName +"&picAddr1=" + picArr[0].picAddr;
    paramsStr += "&picName2="+ picArr[1].picName +"&picAddr2=" + picArr[1].picAddr;
    paramsStr += "&picName3="+ picArr[2].picName +"&picAddr3=" + picArr[2].picAddr;

    $.ajax({
      type: "post",
      url: "/product/addProduct",
      data: paramsStr,
      dataType: "json",
      success: function( info ) {
        console.log( info )
        if ( info.success ) {
          // 添加成功

          // 关闭模态框
          $('#addModal').modal("hide");

          // 页面重新渲染第一页
          currentPage = 1;
          render();

          // 重置表单的内容和校验状态
          $('#form').data("bootstrapValidator").resetForm(true);

          // 下拉列表 和 图片 不是表单元素, 需要手动重置
          $('#dropdownText').text("请选择二级分类");
          $('#imgBox img').remove(); // 让所有的图片自杀
        }
      }
    })
  });

})
