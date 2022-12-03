export default [
  {
    element: '#baseSettingBtn',
    stageBackground: '#df9d3a',
    popover: {
      title: '第一步：设置',
      description: '请先为您的表格设置默认班级',
      position: 'left'
    }
  },
  {
    element: '.baseTemplateBtn',
    popover: {
      title: '第二步：模版',
      description: '查看模版，并按模版规范调整需要上传的表格，以免数据分析错误',
      position: 'bottom-right'
    }
  },
  {
    element: '#uploadBtn',
    popover: {
      title: '第三步：上传',
      description:
        '请上传符合模版的excle文件，可将需要上传的表格整理成一个excel，多张工作薄将一起导入',
      position: 'bottom-left'
    }
  },
  //   {
  //     element: '#mulClassAnalyseBtn',
  //     popover: {
  //       title: '年段分析',
  //       description: '可分析不同班级的学生情况并汇总年段',
  //       position: 'bottom-left'
  //     }
  //   },
  //   {
  //     element: '#scoreAnalyseBtn',
  //     popover: {
  //       title: '成绩分析',
  //       description: '可用于分析学生的学习情况',
  //       position: 'bottom-left'
  //     }
  //   },
  //   {
  //     element: '#mulSheetExportBtn',
  //     popover: {
  //       title: '合表导出',
  //       description: '选择多张表格导出到一个excel',
  //       position: 'bottom-center'
  //     }
  //   },
  //   {
  //     element: '#allDeleteBtn',
  //     popover: {
  //       title: '一键删除',
  //       description: '不需要时，请删除保存的数据，确保数据安全',
  //       position: 'bottom-center'
  //     }
  //   },
  {
    element: '#menuHide',
    stageBackground: '#df9d3a',
    popover: {
      title: '切换菜单',
      description: '对于小屏幕，可收起菜单，方便查看更多的数据',
      position: 'right'
    }
  }
]
