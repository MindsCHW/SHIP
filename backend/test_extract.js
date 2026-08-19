require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const SurveyAsset = require('./src/models/SurveyAsset.model');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const asset = await SurveyAsset.findOne({ 'video.path': { $exists: true, $ne: null } });
  if (!asset) {
    console.log('No survey asset with video found');
    process.exit();
  }
  console.log('Using asset:', asset.assetName);

  const cliPath = path.join(__dirname, '../survey_video_processor/survey_video_processor/cli.py');
  const outputDir = path.join(require('os').tmpdir(), `test-extract-${Date.now()}`);
  fs.mkdirSync(outputDir, { recursive: true });

  const chainagesStr = '100.000'; // Target chainage

  console.log(`Running python: python ${cliPath} --video ${asset.video.path} --vtt ${asset.vtt.path} --outdir ${outputDir} --chainages ${chainagesStr}`);

  const pythonProcess = spawn('python', [
    cliPath,
    '--video', asset.video.path,
    '--vtt', asset.vtt.path,
    '--outdir', outputDir,
    '--chainages', chainagesStr
  ]);

  let stdoutData = '';
  let stderrData = '';

  pythonProcess.stdout.on('data', (data) => {
    stdoutData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    stderrData += data.toString();
  });

  pythonProcess.on('close', (code) => {
    console.log('Exit code:', code);
    console.log('STDOUT:', stdoutData);
    console.log('STDERR:', stderrData);
    
    if (fs.existsSync(path.join(outputDir, 'results.json'))) {
        console.log('results.json:', fs.readFileSync(path.join(outputDir, 'results.json'), 'utf-8'));
    }

    process.exit(code);
  });
}).catch(console.error);
