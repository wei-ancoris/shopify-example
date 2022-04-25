export const base64Encode = (_str) => Buffer.from(_str).toString('base64');
export const base64Decode = (_str) => Buffer.from(_str, 'base64').toString('utf-8');
export const downloadImage = (url, name) => {
    fetch(url)
        .then(resp => resp.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // the filename you want
            a.download = name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(() => alert('An error sorry'));
}