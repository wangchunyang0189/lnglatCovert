function exportJson(name, data) {
  const str = JSON.stringify(data);
  let blob = new Blob([str]); //  创建 blob 对象
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob); //  创建一个 URL 对象并传给 a 的 href
  link.download = name; //  设置下载的默认文件名
  link.click();
}

export { exportJson };
