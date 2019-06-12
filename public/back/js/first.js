/**
 * Created by Jepson on 2018/8/19.
 */

$(function() {

  var currentPage = 1;
  var pageSize = 5;

  // 1. 一进入页面, 发送ajax请求, 请求一级分类数据, 进行页面渲染
  render();
  function render() {
    $.ajax({
      type: "get",
      url: "/category/queryTopCategoryPaging",
      data: {
        page: currentPage,
        pageSize: pageSize
      },
      dataType: "json",
      success: function( info ) {
        console.log( info )
        var htmlStr = template( "firstTpl", info );
        $('.lt_content tbody').html( htmlStr );

        // 分页插件初始化
        $('#paginator').bootstrapPaginator({
          // 指定bootstrap版本号
          bootstrapMajorVersion: 3,
          // 当前页
          currentPage: info.page,
          // 总页数
          totalPages: Math.ceil( info.total / info.size ),
          // 给页码添加点击事件
          onPageClicked: function( a, b, c, page ) {
            // 更新当前页, 重新渲染
            currentPage = page;
            render();
          }
        });
      }
    })
  }



  // 2. 点击添加分类按钮, 显示添加模态框
  $('#addBtn').click(function() {
    // 显示添加模态框
    $('#addModal').modal("show");
  });



  // 3. 添加表单校验功能
  $('#form').bootstrapValidator({

    // 配置校验图标
    feedbackIcons: {
      valid: 'glyphicon glyphicon-ok',    // 校验成功
      invalid: 'glyphicon glyphicon-remove',  // 校验失败
      validating: 'glyphicon glyphicon-refresh' // 校验中
    },

    // 字段列表
    fields: {
      categoryName: {
        // 校验规则, 要求非空
        validators: {
          notEmpty: {
            message: "请输入一级分类名称"
          }
        }
      }
    }
  });


  // 4. 添加表单校验成功事件, 阻止默认的表单提交, 通过ajax进行提交
  $('#form').on("success.form.bv", function( e ) {
    // 阻止默认的提交
    e.preventDefault();

    // 通过 ajax 提交
    $.ajax({
      type: "post",
      url: "/category/addTopCategory",
      data: $('#form').serialize(),
      dataType: "json",
      success: function( info ) {
        console.log( info )

        if ( info.success ) {
          // 添加成功
          // 关闭模态框
          $('#addModal').modal("hide");
          // 重新渲染第一页
          currentPage = 1;
          render();

          // 重置表单内容和状态
          $('#form').data("bootstrapValidator").resetForm(true);
        }

      }
    })
  })


});
