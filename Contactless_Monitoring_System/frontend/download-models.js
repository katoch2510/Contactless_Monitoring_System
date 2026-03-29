import fs from 'fs';
import https from 'https';
import path from 'path';

const modelsPath = path.join(process.cwd(), 'public', 'models');
if (!fs.existsSync(modelsPath)) {
    fs.mkdirSync(modelsPath, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

const files = [
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2',
];

console.log('Downloading face-api.js models...');

const downloadFile = (file) => {
    return new Promise((resolve, reject) => {
        const dest = path.join(modelsPath, file);
        if (fs.existsSync(dest)) {
            console.log(`${file} already exists. Skipping.`);
            return resolve();
        }

        const fileStream = fs.createWriteStream(dest);
        https.get(baseUrl + file, (response) => {
            if (response.statusCode !== 200) {
                fs.unlinkSync(dest);
                return reject(new Error(`Failed to get ${file} (${response.statusCode})`));
            }
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Downloaded ${file}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlinkSync(dest);
            reject(err);
        });
    });
};

Promise.all(files.map(downloadFile))
    .then(() => console.log('All models downloaded successfully!'))
    .catch((err) => console.error(err));
