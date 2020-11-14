// 防抖
export const Debounce = (fn, t) => {
	let delay = t || 1000;
	let timer;
	return function () {
		let args = arguments;
		if (timer) {
			clearTimeout(timer);
		}
		let callNow = !timer
		timer = setTimeout(() => {
			timer = null;
		}, delay)
		if (callNow) fn.apply(this, args)
	}
}

// 导出为excel
// titleData 首行标题   contentData 表内容    title 文件名称
export function exportToExcel(titleData, contentData, fileName) {
  // 建立表格
  let excel = "<table>";
  // 设置表头
  let row = "<tr>";
  titleData.map((item) => {
    row += `<th align="center">${item}</th>`;
  });
  excel += `${row}</tr>`;
  // 设置数据
  contentData.map((item) => {
    let row = "<tr>";
    item.map((data) => {
      row += `<td align="center">${data}</td>`;
    });
    excel += `${row}</tr>`;
  });
  excel += "</table>";
  let excelFile = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
      <head>
        <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>
                    {worksheet}
                  </x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
        <![endif]-->
      </head>
      <body>
        ${excel}
      </body>
    </html>
  `;
  let flag;
  //判断是否IE浏览器
  let isIE = !!window.ActiveXObject || "ActiveXObject" in window;
  // 兼容ie11
  if(isIE) {
    let blob = new Blob([excelFile], { type: "application/vnd.ms-excel;charset=utf-8" });
    window.navigator.msSaveOrOpenBlob(blob, fileName + ".xls");
    flag = "end";
  } else {
    try {
      let blob = new Blob([excelFile], { type: "application/vnd.ms-excel;charset=utf-8" });
      let url = window.URL.createObjectURL(blob);
      let link = document.createElement("a");
      link.href = url;
      link.style.visibility = "hidden";
      link.download = fileName + ".xls";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("下载异常！");
    }
    flag = 'end';
  }
  return flag
}