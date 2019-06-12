/**
 * Created by Jepson on 2018/8/19.
 */


$(function() {


  var currentPage = 1; // 当前页
  var pageSize = 5; // 每页条数

  // 1. 一进入页面, 发送 ajax 请求进行渲染
  render();
  function render() {
    $.ajax({
      type: "get",
      url: "/category/querySecondCategoryPaging",
      data: {
        page: currentPage,
        pageSize: pageSize
      },
      dataType: "json",
      success: function( info ) {
         console.log( info );
        // 在模板中可以任意使用数据对象里面的所有属性
        var htmlStr = template( "secondTpl", info );
        $('.lt_content tbody').html( htmlStr );

        // 进行分页初始化
        $('#paginator').bootstrapPaginator({
          // 版本
          bootstrapMajorVersion: 3,
          // 当前页
          currentPage: info.page,
          // 总页数
          totalPages: Math.ceil( info.total / info.size ),
          // 添加按钮点击事件
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



  // 2. 点击添加分类按钮, 显示添加模态框
  $('#addBtn').click(function() {
    $('#addModal').modal("show");

    // 发送ajax请求, 获取所有的一级分类数据, 进行动态渲染下拉框

    // 通过获取一级分类接口(带分页的) 模拟 获取全部一级分类的接口
    $.ajax({
      type: "get",
      url: "/category/queryTopCategoryPaging",
      data: {
        page: 1,
        pageSize: 100
      },
      dataType: "json",
      success: function( info ) {
        console.log( info )
        var htmlStr = template("dropdownTpl", info );
        $('.dropdown-menu').html( htmlStr );
      }
    })

  });



  // 3. 给下拉列表的 a 添加点击事件(通过事件委托绑定)
  $('.dropdown-menu').on("click", "a", function() {
    // 获取 a 的文本
    var txt = $(this).text();
    // 设置 给按钮
    $('#dropdownText').text( txt );

    // 获取 a 标签存储的 分类 id
    var id = $(this).data("id");
    // 赋值给 name="categoryId" 的表单元素
    $('[name="categoryId"]').val(id);

    // 更新校验状态为 校验通过状态
    // updateStatus(字段名称, 校验状态, 校验规则(可以配置提示信息) )
    $('#form').data("bootstrapValidator").updateStatus("categoryId", "VALID");
  });



  // 4. 配置文件上传插件, 进行文件上传初始化
  $('#fileupload').fileupload({
    // 配置返回数据格式
    dataType: "json",
    // 上传完成图片后, 调用的回调函数
    // 通过 data.result.picAddr 获取响应的图片地址
    done: function( e, data ) {
      console.log( data.result.picAddr )
      // 获取地址
      var imgUrl = data.result.picAddr;
      // 设置给 img
      $('#imgBox img').attr("src", imgUrl);

      // 将地址设置给 name="brandLogo" 的input
      $('[name="brandLogo"]').val( imgUrl );

      // 设置隐藏域的校验状态为 VALID
      $('#form').data("bootstrapValidator").updateStatus("brandLogo", "VALID");
    }
  });



  // 5. 进行表单校验初始化
  $('#form').bootstrapValidator({

    // 指定不校验的类型，默认为[':disabled', ':hidden', ':not(:visible)'],可以不设置
    // 默认插件不对隐藏域进行校验, 现在需要对隐藏域进行校验

    // 重置排除项
    excluded: [],

    // 配置校验图标
    feedbackIcons: {
      valid: 'glyphicon glyphicon-ok',    // 校验成功
      invalid: 'glyphicon glyphicon-remove',  // 校验失败
      validating: 'glyphicon glyphicon-refresh' // 校验中
    },

    // 配置字段
    fields: {
      //categoryId 选择的一级分类 id
      //brandName  二级分类名称
      //brandLogo  上传的图片地址
      categoryId: {
        // 配置校验规则
        validators: {
          notEmpty: {
            message: "请选择一级分类"
          }
        }
      },
      brandName: {
        validators: {
          notEmpty: {
            message: "请输入二级分类"
          }
        }
      },
      brandLogo: {
        validators: {
          notEmpty: {
            message: "请上传图片"
          }
        }
      }
    }
  });


  // 6. 注册表单校验成功事件, 阻止默认的表单提交, 通过ajax进行提交
  $('#form').on("success.form.bv", function( e ) {
    e.preventDefault();

    // 通过 ajax 提交
    $.ajax({
      type: "post",
      url: "/category/addSecondCategory",
      data: $('#form').serialize(),
      dataType: "json",
      success: function( info ) {
        console.log( info );
        if ( info.success ) {
          // 添加成功
          // 隐藏模态框
          $('#addModal').modal("hide");
          // 页面重新渲染第一页
          currentPage = 1;
          render();

          // 重置表单, 校验状态和文本都要重置
          $('#form').data("bootstrapValidator").resetForm( true );

          // 下拉按钮的文本, 图片不是表单元素, 需要手动重置
          $('#dropdownText').text("请选择一级分类");
          $('#imgBox img').attr("src", "./images/none.png");
        }
      }
    })
  });


})