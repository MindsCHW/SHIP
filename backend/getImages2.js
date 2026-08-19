const mongoose = require('mongoose');

mongoose.connect('mongodb://chwminds_db_user:RandD1900@ac-juvwhvv-shard-00-02.y3bch7z.mongodb.net:27017,ac-juvwhvv-shard-00-01.y3bch7z.mongodb.net:27017,ac-juvwhvv-shard-00-00.y3bch7z.mongodb.net:27017/hirate2?authSource=admin&replicaSet=atlas-c2m17u-shard-0&tls=true')
  .then(async () => {
    const Rating = require('./src/models/Rating.model');
    const Inspection = require('./src/models/Inspection.model');
    
    const r = await Rating.find({ 'images.0': { $exists: true } }).limit(20);
    const i = await Inspection.find({ 'images.0': { $exists: true } }).limit(20);
    
    let imgs = [];
    r.forEach(x => imgs.push(...x.images));
    i.forEach(x => imgs.push(...x.images));
    
    const urls = imgs.map(x => x.url || x.secure_url || x);
    console.log(JSON.stringify(urls, null, 2));
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
