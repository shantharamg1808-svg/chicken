const https = require('https');
const fs = require('fs');
const path = require('path');

const urls = [
    { url: 'https://cdn.tailwindcss.com', file: 'tailwind.js' },
    { url: 'https://unpkg.com/react@18/umd/react.production.min.js', file: 'react.production.min.js' },
    { url: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', file: 'react-dom.production.min.js' },
    { url: 'https://unpkg.com/@babel/standalone/babel.min.js', file: 'babel.min.js' },
    { url: 'https://unpkg.com/lucide@latest', file: 'lucide.min.js' }
];

const downloadDir = path.join(__dirname, 'www', 'js');
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

urls.forEach(item => {
    const dest = path.join(downloadDir, item.file);
    const download = (url) => {
        https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                // follow redirect (unpkg redirects to specific versions)
                let redirectUrl = response.headers.location;
                if (!redirectUrl.startsWith('http')) {
                    redirectUrl = 'https://unpkg.com' + redirectUrl;
                }
                download(redirectUrl);
            } else {
                const file = fs.createWriteStream(dest);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`Downloaded ${item.file}`);
                });
            }
        }).on('error', (err) => {
            console.error('Error downloading ' + item.file, err);
        });
    };
    download(item.url);
});
