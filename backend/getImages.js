const mongoose = require('mongoose');

mongoose.connect('mongodb://chwminds_db_user:RandD1900@ac-juvwhvv-shard-00-02.y3bch7z.mongodb.net:27017,ac-juvwhvv-shard-00-01.y3bch7z.mongodb.net:27017,ac-juvwhvv-shard-00-00.y3bch7z.mongodb.net:27017/hirate2?authSource=admin&replicaSet=atlas-c2m17u-shard-0&tls=true')
  .then(async () => {
    const InspectionTask = require('./src/models/InspectionTask.model');
    const tasks = await InspectionTask.find({ 'images.0': { $exists: true } }).limit(20).select('images');
    const allImages = tasks.flatMap(t => t.images).map(i => i.url || i);
    console.log(JSON.stringify(allImages, null, 2));
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
