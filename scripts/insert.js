// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client } = require('../dist/src/App/client.js');

const portIndex = process.argv.findIndex((a) => a === '-p') + 1;
if (portIndex === 0) {
  console.error('ERROR: Missing required command line option "-p $PORT"');
  process.exit();
} else if (portIndex === process.argv.length) {
  console.error('ERROR: Missing value for required command line option "-p $PORT"');
  process.exit();
}

const port = process.argv[portIndex];
if (/[^0-9]/.test(port)) {
  console.error('ERROR: Invalid $PORT provided. The port must consist only of numbers.');
  process.exit();
}

const zipIndex = process.argv.findIndex((a) => a === '-z') + 1;
if (zipIndex === 0) {
  console.error('ERROR: Missing required command line option "-z $ZIP_CODE"');
  process.exit();
} else if (zipIndex === process.argv.length) {
  console.error('ERROR: Missing value for required command line option "-p $ZIP_CODE"');
  process.exit();
}

const zips = process.argv[zipIndex].split(',');

const client = new Client({ hostname: `http://localhost:${port}` });
const inserts = zips.map(client.insert);
Promise.all(inserts)
  .catch((e) => {
    console.error(e.toString());
    process.exit();
  });
