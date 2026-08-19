const dns = require('dns');

const resolver = new dns.Resolver();
// Use Google's public DNS to bypass local ISP/VPN blocks
resolver.setServers(['8.8.8.8', '8.8.4.4']);

const host = 'cluster0.y3bch7z.mongodb.net';

console.log('Resolving SRV and TXT records using Google DNS...');

resolver.resolveSrv(`_mongodb._tcp.${host}`, (err, addresses) => {
  if (err) {
    console.error('Failed to resolve SRV records:', err.message);
    return;
  }
  
  resolver.resolveTxt(host, (errTxt, txtRecords) => {
    let options = '';
    if (!errTxt && txtRecords && txtRecords.length > 0) {
      options = txtRecords.map(r => r.join('')).join('&');
    } else {
      options = 'ssl=true&authSource=admin'; // Default fallbacks
    }

    const nodes = addresses.map(a => `${a.name}:${a.port}`).join(',');
    console.log('\n--- SUCCESS ---');
    console.log('Your local network is blocking SRV lookups, but we fetched the direct nodes using Google DNS!');
    console.log('\nPlease REPLACE your MONGODB_URI in the .env file with this exact string:\n');
    
    const legacyUri = `mongodb://chwminds_db_user:RandD%4027@${nodes}/hirate2?${options}`;
    console.log(legacyUri);
    console.log('\n----------------\n');
  });
});
