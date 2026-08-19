const mongoose = require('mongoose');

mongoose.connect('mongodb://chwminds_db_user:RandD1900@ac-juvwhvv-shard-00-02.y3bch7z.mongodb.net:27017,ac-juvwhvv-shard-00-01.y3bch7z.mongodb.net:27017,ac-juvwhvv-shard-00-00.y3bch7z.mongodb.net:27017/hirate2?authSource=admin&replicaSet=atlas-c2m17u-shard-0&tls=true')
  .then(async () => {
    // get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    let cloudinaryUrls = [];

    for (let c of collections) {
      const docs = await mongoose.connection.db.collection(c.name).find({}).toArray();
      const stringified = JSON.stringify(docs);
      const matches = stringified.match(/https:\/\/res\.cloudinary\.com[^"']+/g);
      if (matches) {
        cloudinaryUrls.push(...matches);
      }
    }

    console.log(JSON.stringify([...new Set(cloudinaryUrls)], null, 2));
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
