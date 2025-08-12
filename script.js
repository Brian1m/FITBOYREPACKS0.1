downloadBtn.onclick = async () => {
  if (!currentGame) return;

  downloadBtn.disabled = true;
  downloadProgress.style.width = '0%';

  try {
    const response = await fetch(currentGame.zip);
    if (!response.ok) throw new Error('Network error');

    const contentLength = response.headers.get('Content-Length');
    if (!contentLength) {
      // No content length header, fallback to instant download
      const blob = await response.blob();
      triggerDownload(blob);
      downloadBtn.disabled = false;
      downloadProgress.style.width = '100%';
      return;
    }

    const total = parseInt(contentLength, 10);
    let loaded = 0;
    const reader = response.body.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      let percent = (loaded / total) * 100;
      downloadProgress.style.width = percent + '%';
    }

    const blob = new Blob(chunks);
    triggerDownload(blob);
  } catch (err) {
    alert('Download failed: ' + err.message);
  } finally {
    downloadBtn.disabled = false;
  }
};

function triggerDownload(blob) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = currentGame.title + '.zip';
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  document.body.removeChild(link);
}
